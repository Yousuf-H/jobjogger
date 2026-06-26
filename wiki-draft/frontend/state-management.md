# Frontend State Management

## Overview

jobjogger_web uses two distinct state categories:

- **Server state** — data fetched from the Rails API, owned by TanStack Query
- **UI state** — ephemeral view state (sidebar open/closed, dialogs, local form state), held in React component state or two lean contexts

There is no Zustand, Redux, or Jotai in the codebase. The division is intentional: TanStack Query handles caching, loading, and background refetching for all API data; React state handles everything else.

---

## Contexts

### `AuthContext` / `AuthProvider`

**File:** `src/contexts/AuthContext.ts`, `src/contexts/AuthProvider.tsx`

Provides user identity and auth actions to the entire tree.

**State shape:**
```ts
{
  user: User | null
  isLoading: boolean
  signin(email, password): Promise<void>
  signup(email, password, name, agreedToTerms): Promise<void>
  signout(): Promise<void>
  updateUser(user: User): void
  refreshUser(): Promise<void>
  demoSignin(): Promise<void>
  acceptTerms(): Promise<void>
}
```

**Initialisation:** On mount, `AuthProvider` reads `localStorage.getItem('user')`, JSON-parses it, and sets initial state. The user object is stored as JSON in `localStorage` on every sign-in, sign-up, and profile update so it survives a page refresh.

**Mutations (signin/signup/demoSignin):** Call the API directly via `apiClient` (not through TanStack Query) because they need to gate the entire app on the result. On success they call `setUser` and write to `localStorage`.

**`refreshUser`:** Calls `fetchMe()` (which validates via Zod) and syncs the stored user. Silently absorbs failures — if the request fails, existing state stands.

**Important:** `AuthContext` is the only place in the app that reads/writes user identity to `localStorage`. All other code should call `getCurrentUserId()` from `lib/auth.ts` when they only need the user's ID.

---

### `SidebarContext`

**File:** `src/contexts/SidebarContext.ts`

Thin UI-only context for sidebar open/closed state and mobile breakpoint detection. No API calls. Consumed by the layout shell and any component that needs to respond to the sidebar state.

---

## TanStack Query Conventions

### Query key shape

All query keys are defined in `src/lib/queryKeys.ts`. Every user-scoped key includes the user ID as the second segment so that cache entries are automatically isolated per user (important for demo mode, which can switch users without a page reload):

```ts
QUERY_KEYS.jobs.byUser(userId)      // ['jobs', userId]
QUERY_KEYS.jobs.detail(userId, id)  // ['jobs', userId, id]
QUERY_KEYS.contacts.list(userId)    // ['contacts', userId]
```

`QUERY_KEYS.jobs.all()` returns `['jobs']` and matches all job queries via TanStack Query's prefix invalidation — use it when you need to wipe the entire jobs cache after a write.

### Hook structure

Data fetching and mutation logic are split into separate hooks for each resource:

- `useJobs()` / `useJob(id)` — query hooks, return `data`, `isLoading`, `error`
- `useJobActions()` — mutation hook, returns named mutations (`createMutation`, `updateMutation`, `deleteMutation`) and a shared `invalidate()` function

This keeps component code clean and makes the invalidation strategy explicit.

### `enabled` guards

Query hooks that depend on a value that may not be available on first render always pass an `enabled:` guard:

```ts
useQuery({ queryKey: [...], queryFn: ..., enabled: !!jobId })
```

Dialog contents that only load when the dialog opens use `enabled: open` to avoid fetching before the user needs them.

### Search and filter queries

Queries with search/filter params use `placeholderData: keepPreviousData` so results don't flash away on every keystroke. The filter object is passed directly as part of the query key so TanStack Query treats different filter sets as separate cache entries.

---

## localStorage Usage

Two things are stored in `localStorage`:

| Key | Value | Owner |
|-----|-------|-------|
| `user` | Serialised `User` JSON | `AuthProvider` (write); `getCurrentUserId()` (read) |
| `jobjogger_orgs_welcome_dismissed` | `"true"` | `OrganisationsPage` (dismiss banner once) |

### Safe access via `getCurrentUserId()`

**File:** `src/lib/auth.ts`

All hooks that need the user's ID for a query key call `getCurrentUserId()` rather than parsing `localStorage` inline. The function validates the parsed shape with Zod before returning — if the stored JSON is missing or malformed it returns `null` so callers can handle the absence gracefully rather than receiving `undefined` silently:

```ts
const userId = getCurrentUserId()  // string | null
useQuery({ ..., enabled: !!userId })
```

---

## Runtime Validation

Three critical API endpoints validate their response shape with Zod before trusting the data:

| Service function | Schema validates |
|-----------------|-----------------|
| `fetchMe()` | `{ id: number, email: string, name: string }` |
| `fetchJobs()` | Array of `{ id, company_name, job_title, status, tags, created_at, updated_at }` |
| `fetchJob(id)` | `{ job: {...}, timeline_entries: [...] }` |

These are the highest-traffic read paths. A parse failure throws a `ZodError`, which TanStack Query surfaces as an error state. The validation deliberately checks only the required structural shape — optional fields are not in the schema and will pass through unvalidated regardless of value.

---

## Error Handling

All mutation error handlers use `extractErrorMessage(error, fallback)` from `src/lib/errors.ts`. This handles both API error shapes the Rails backend emits:

- `{ status: { message: "..." } }` — Devise-style auth errors
- `{ errors: ["..."] }` — ActiveRecord validation errors
- `{ error: "..." }` — generic single-message errors

The function accepts `error: unknown` internally, casts to `AxiosError<ApiErrorResponse>`, and traverses the chain with `??`. Callers pass a human-readable fallback that surfaces if none of the known shapes match.

`ApiErrorResponse` is the single shared interface in `src/types/api.ts`.
