# Frontend Services Layer

## Overview

The services layer (`jobjogger_web/src/services/api/`) is a thin wrapper around Axios. Its job is to:

1. Make HTTP requests through the shared `apiClient`
2. Parse and validate critical response shapes with Zod (where applicable)
3. Return typed values to hook callers

Service functions are **never called directly by components** — components always go through hooks, which own the caching and invalidation logic.

---

## Axios Client (`src/services/api/client.ts`)

```ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 20000,
  withCredentials: true,
})
```

Key properties:

| Property | Value | Why |
|----------|-------|-----|
| `baseURL` | `VITE_API_BASE_URL` or `http://localhost:3000/api/v1` | All service functions use relative paths |
| `timeout` | 20 000 ms | Prevents hung requests from blocking UI indefinitely |
| `withCredentials` | `true` | Required for the signed JWT cookie (`cookies.signed[:jwt]`) to be included on every cross-origin request |

### 401 Interceptor

The response interceptor handles `401 Unauthorized`:

```ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect from auth endpoints or the OAuth callback
      if (isAuthEndpoint || isOAuthCallback) return Promise.reject(error)
      localStorage.removeItem('user')
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)
```

Two endpoints are exempted from the auto-redirect:
- `/sign_in` and `/sign_up` — these return 401 on bad credentials; the form handles the error banner itself
- `/auth/callback` — the OAuth callback page renders its own error state

### Google OAuth

`submitGoogleOAuthForm(params?)` creates and submits a hidden `<form method="POST">` to the OmniAuth endpoint. POST is required by OmniAuth 2 to prevent cross-site initiation; params are sent on the query string (not the body) because OmniAuth reads them as `request.GET` for the callback phase.

---

## Service Files

| File | Resource | Notes |
|------|----------|-------|
| `jobs.ts` | Jobs | Zod-validated list + detail responses |
| `contacts.ts` | Contacts + Interactions | Includes link/unlink endpoints |
| `organisations.ts` | Organisations | Includes merge + dismiss-review |
| `interviews.ts` | Interviews + Questions + Pins | Covers the full interview prep domain |
| `resume.ts` | Templates + Variants | Multipart file upload via `FormData` |
| `activity.ts` | Activity feed | Paginated |
| `analytics.ts` | Analytics aggregates | Read-only |
| `notifications.ts` | Notifications | Mark-read + mark-all-read |
| `timelineEntries.ts` | Timeline entries | Scoped to a job |
| `admin.ts` | Admin stats | Restricted to admin users |
| `user.ts` | User profile | Update + avatar upload |

---

## Request / Response Pattern

Every service function follows the same structure:

```ts
export async function fetchJob(id: number): Promise<{ job: Job; timeline_entries: TimelineEntry[] }> {
  const response = await apiClient.get(`/jobs/${id}`)
  jobDetailResponseSchema.parse(response.data) // Zod validation
  return {
    job: response.data.job as Job,
    timeline_entries: response.data.timeline_entries as TimelineEntry[],
  }
}
```

Functions that write data use the Rails nested param convention:

```ts
export async function createJob(data: Partial<Job>): Promise<Job> {
  const response = await apiClient.post('/jobs', { job: data })
  return response.data.job
}
```

File uploads use `FormData`:

```ts
export async function createResumeTemplate(data: { name: string; notes?: string; pdf?: File }) {
  const form = new FormData()
  form.append('resume_template[name]', data.name)
  if (data.pdf) form.append('resume_template[pdf]', data.pdf)
  const response = await apiClient.post('/resume_templates', form)
  return response.data.resume_template
}
```

---

## Zod Validation

Three service functions validate their response with Zod at the boundary where incorrect data would cause silent downstream bugs:

| Function | Schema | What it guards |
|----------|--------|----------------|
| `fetchJobs` | `jobsResponseSchema` | Array of jobs — ensures `id`, `company_name`, `status`, `tags` are present |
| `fetchJob` | `jobDetailResponseSchema` | Single job + timeline array |
| `createJob` → implicit | (post, trusts Rails) | Write responses not validated — caller shape is controlled |

The schemas use `z.array(jobSchema)` and `z.object({ job: jobSchema, timeline_entries: ... })`. If the API returns an unexpected shape (e.g. a Rails error body at a 200 status), the Zod parse throws and TanStack Query treats the query as failed.

Other service functions do not validate responses — they trust that the Rails API returns the documented shape. Adding Zod to more endpoints is worthwhile but deferred.

---

## Service ↔ Hook Relationship

Services and hooks have a strict one-way dependency: **hooks import services, never the reverse**.

```
Component
  └── Hook (useJob, useJobActions, ...)
        └── Service function (fetchJob, createJob, ...)
              └── apiClient (axios instance)
```

Hooks own:
- TanStack Query cache keys and lifecycle
- `keepPreviousData` and `enabled` guards
- Mutation side-effects (toast notifications, cache invalidation, navigation)

Services own:
- HTTP method and URL
- Request body shape (`{ job: data }` Rails convention)
- Zod validation of critical responses
- Nothing else — no toast, no navigation, no query client

This boundary means service functions are easily testable in isolation (just call them with a mocked Axios client) and hooks can swap implementations without changing call sites.
