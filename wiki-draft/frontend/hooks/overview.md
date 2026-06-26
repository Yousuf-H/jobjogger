# Frontend Hooks — Overview

## Architecture

Hooks in `jobjogger_web/src/hooks/` fall into two categories:

**Data hooks** — wrap TanStack Query to fetch and cache server state. Every data hook calls `getCurrentUserId()` from `lib/auth.ts` and includes the user ID in its query key, so the cache is isolated per user. Data hooks are read-only: they never fire mutations.

**Utility hooks** — encapsulate browser or React behaviour with no network calls (`useDebounce`, `useIsMobile`, `usePageTitle`, `useExtensionInstalled`, `useAuth`, `useSidebar`).

For each resource that supports writes, a matching **action hook** owns all mutations (`useJobActions`, `useContactActions`, etc.). The split means components only subscribe to what they read, and action hooks can be imported independently into components that only need mutations.

---

## TanStack Query Patterns

### Query key shape

All query keys live in `src/lib/queryKeys.ts`. The canonical shape is:

```
[resourceType, userId, ...context]
```

Examples:
```ts
QUERY_KEYS.jobs.byUser(userId)           // ['jobs', userId]
QUERY_KEYS.jobs.detail(userId, id)       // ['jobs', userId, id]
QUERY_KEYS.contacts.list(userId, params) // ['contacts', userId, params]
QUERY_KEYS.activity.detail(userId, p, pp) // ['activity', userId, page, perPage]
```

TanStack Query invalidates by prefix, so `QUERY_KEYS.jobs.byUser(userId)` = `['jobs', userId]` busts all list and detail queries for that user in a single call.

### `enabled` guards

Every detail query (and any query that depends on a value that may not be available on first render) passes an `enabled:` option:

```ts
useQuery({ ..., enabled: !!id })          // detail hooks
useQuery({ ..., enabled: !!jobId })       // sub-resource hooks
useQuery({ ..., enabled: open })          // lazy dialog queries
```

`useInterviewQuestions` has a two-level guard: a scope-based check (e.g. `scope: 'job'` with no `job_id` is disabled) ANDed with an optional external `enabled` override from `options`:

```ts
const defaultEnabled =
  (params?.scope !== 'job' || !!params?.job_id) &&
  (params?.scope !== 'org' || !!params?.organisation_id)
enabled: options?.enabled !== undefined ? options.enabled && defaultEnabled : defaultEnabled
```

### `keepPreviousData`

All hooks whose query key changes based on user input (search, filter, pagination, period) use `placeholderData: keepPreviousData`. This prevents the result set from disappearing while a new page or filter set loads:

- `useJobs` — filter/search params
- `useContacts` — search + organisation_id params
- `useOrganisations` — applied on refetch after mutations
- `useActivity` — page / perPage pagination
- `useInterviewQuestions` — scope + filter params
- `useAdminStats` — period param

### Invalidation helpers

Three shared helpers in `src/lib/invalidation.ts` standardise how mutations wipe the cache:

```ts
invalidateJobQueries(qc, userId)           // busts ['jobs', userId] and all descendants
invalidateContactQueries(qc, userId)       // busts ['contacts', userId] and all descendants
invalidateOrganisationQueries(qc, userId)  // busts ['organisations', userId] and all descendants
```

Action hooks call these instead of inlining `invalidateQueries` calls. The merge mutation in `useOrganisationActions` needs all three because merging organisations can change which organisation a job references and which contacts link to which organisation.

### 60 s notification polling

`useNotifications` polls the server every 60 seconds. This was chosen as a reasonable balance between freshness and request volume for a background, non-critical feed. It should be replaced with a WebSocket or SSE subscription if real-time push is added.

---

## Hook Inventory

### Data hooks — Jobs

| Hook | Parameters | Returns / Notes |
|------|-----------|-----------------|
| `useJobs(filters?)` | Optional `JobFilters` (status, search, tags) | Jobs array; `keepPreviousData` |
| `useJob(id)` | String ID from `useParams`, or `undefined` | `{ job, timeline_entries }`; `enabled: !!id` |
| `useJobActions(opts?)` | `opts.onDeleteSuccess` callback | `{ archiveMutation, unarchiveMutation, deleteMutation, handleView }` |

### Data hooks — Contacts

| Hook | Parameters | Returns / Notes |
|------|-----------|-----------------|
| `useContacts(params?, opts?)` | `{ search, organisation_id }`; `opts.enabled` | Contacts array; `keepPreviousData` |
| `useContact(id)` | String ID from `useParams`, or `undefined` | Single `Contact`; `enabled: !!id` |
| `useJobContacts(jobId)` | `number | undefined` | Contacts for a job; `enabled: !!jobId` |
| `useContactActions(opts?)` | `opts.onCreateSuccess`, `opts.onDeleteSuccess` | Full CRUD + link/unlink + interaction mutations |

### Data hooks — Organisations

| Hook | Parameters | Returns / Notes |
|------|-----------|-----------------|
| `useOrganisations()` | — | All orgs; `keepPreviousData` |
| `useOrganisation(id)` | String ID or `undefined` | Single `Organisation`; `enabled: !!id` |
| `useSimilarOrganisations(id, enabled)` | ID + caller-controlled enabled gate | Potential duplicates; disabled until `enabled = true` |
| `useOrganisationActions(opts?)` | `opts.onDeleteSuccess` | CRUD + merge + dismiss-review mutations |

### Data hooks — Interviews & Questions

| Hook | Parameters | Returns / Notes |
|------|-----------|-----------------|
| `useInterviews(jobId)` | `number | undefined` | Interviews for a job; `enabled: !!jobId` |
| `useInterviewActions(jobId)` | Required `jobId` | Create/update/delete mutations; invalidates job cache |
| `useInterviewQuestions(params?, opts?)` | `{ scope, job_id, organisation_id, category }`; external `enabled` | Question bank; scope-guarded enabled; `keepPreviousData` |
| `useInterviewQuestionActions()` | — | Create/update/delete bank mutations |
| `usePinnedQuestions(jobId)` | Required `jobId` | Questions pinned to a job; `enabled: !!jobId` |
| `usePinnedQuestionActions(jobId)` | Required `jobId` | `{ pinMutation, createAndPinMutation, unpinMutation }` |

### Data hooks — Timeline

| Hook | Parameters | Returns / Notes |
|------|-----------|-----------------|
| `useTimelineEntryActions(opts)` | `{ jobId, onCreateSuccess?, onUpdateSuccess? }` | `{ createMutation, updateMutation }`; invalidates job queries on success |

### Data hooks — Resumes

| Hook | Parameters | Returns / Notes |
|------|-----------|-----------------|
| `useResumeTemplates()` | — | All templates |
| `useResumeTemplate(id)` | `number | undefined` | Single template with variants; `enabled: !!id` |
| `useResumeTemplateActions()` | — | Create/update/delete + `invalidate()` |
| `useAllResumeVariants()` | — | All variants across templates |
| `useResumeVariant(id)` | `number | null | undefined` | Single variant; `enabled: !!id` |
| `useResumeVariantActions(templateId?)` | Optional parent `templateId` for create | Create/update/delete/link + `invalidate()`; link accepts `variantId: null` to unlink |

### Data hooks — Activity, Analytics, Notifications, Admin

| Hook | Parameters | Returns / Notes |
|------|-----------|-----------------|
| `useActivity(page, perPage)` | Page number (default 1), items per page (default 5) | Paginated feed; `keepPreviousData` |
| `useAnalytics()` | — | Aggregates for the Analytics page |
| `useNotifications()` | — | `{ notifications, meta }`; polls every 60 s |
| `useNotificationActions()` | — | `{ markReadMutation, markAllReadMutation }` |
| `useAdminStats(period)` | `StatPeriod` (e.g. `'7d'`, `'30d'`) | Admin stats; `enabled: !!userId`; `keepPreviousData` |

### Utility hooks

| Hook | Parameters | Returns / Notes |
|------|-----------|-----------------|
| `useAuth()` | — | `AuthContextType`; throws if called outside `AuthProvider` |
| `useSidebar()` | — | Sidebar state + toggle; throws if outside `SidebarProvider` |
| `useDebounce(value, delay)` | Any value, delay in ms | Debounced copy of `value` |
| `useIsMobile()` | — | `true` below 768 px viewport; reactive to resize |
| `usePageTitle(title)` | Page-specific title string | Side-effect only — sets `document.title` |
| `useExtensionInstalled()` | — | `true` / `false` / `null` while pending; pings Chrome extension via `VITE_EXTENSION_ID` |
