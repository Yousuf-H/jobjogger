# Frontend Testing

## Stack

| Tool | Version | Role |
|------|---------|------|
| Vitest | v4 | Test runner, watch mode, coverage |
| @testing-library/react | v16 | React component/hook rendering |
| @testing-library/user-event | v14 | Realistic user interactions |
| @testing-library/jest-dom | v6 | DOM assertion matchers |
| jsdom | — | Simulated browser environment |
| MSW (Mock Service Worker) | v2 | HTTP request interception at Node.js level |

Configuration lives in `jobjogger_web/vitest.config.ts` — it merges with `vite.config.ts` so the `@/` path alias and React plugin are shared automatically.

## Running Tests

```bash
# Run once
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# Interactive UI
npm run test:ui
```

## Directory Structure

```
src/test/
├── setup.ts          # Global hooks: MSW server, localStorage seed, cleanup
├── fixtures.ts       # testUser, testJob, testJobList, makeJob()
├── handlers.ts       # MSW v2 HTTP handlers for all job endpoints
├── server.ts         # setupServer(...handlers) export
├── utils.tsx         # createTestQueryClient, createWrapper, renderWithProviders
├── lib/              # Utility unit tests
│   ├── auth.test.ts
│   ├── avatar.test.ts
│   ├── errors.test.ts
│   └── queryKeys.test.ts
├── hooks/            # Hook unit tests
│   ├── useAuth.test.tsx
│   ├── useJob.test.tsx
│   ├── useJobs.test.tsx
│   └── useJobActions.test.tsx
├── components/       # Component unit tests
│   ├── EmptyTabState.test.tsx
│   ├── MetaItem.test.tsx
│   ├── ProtectedRoute.test.tsx
│   └── StatusBadge.test.tsx
└── integration/      # End-to-end UI flow tests
    └── createJob.test.tsx
```

## Test Infrastructure

### setup.ts

Runs before every test file:

- Starts MSW server (`server.listen`) before all tests; resets handlers and calls `cleanup()` after each test; closes after all tests
- Seeds `localStorage` with a valid user (`{ id: 1, email, name }`) before each test so `getCurrentUserId()` returns `'1'` — mirrors what a real session looks like
- Suppresses React's `Warning:` console noise (expected in test renders)

### fixtures.ts

`testUser` — a complete `User` object matching the type exactly.  
`testJob` — a minimal `Job` at status `applied`.  
`testJobList` — two jobs (`testJob` + a second at `interviewing`).  
`makeJob(overrides)` — factory for one-off jobs.

### handlers.ts (MSW v2)

Uses the MSW v2 API (`http`, `HttpResponse`):

```ts
import { http, HttpResponse } from 'msw'

http.get('/jobs', () => HttpResponse.json(testJobList))
http.post('/jobs', async ({ request }) => {
  const body = await request.json()
  return HttpResponse.json({ job: { ...testJob, id: 99, ...body.job } }, { status: 201 })
})
// 204 No Content
http.delete('/jobs/:id', () => new HttpResponse(null, { status: 204 }))
```

Covered endpoints: GET /jobs, GET /jobs/:id (including a 404 branch), POST /jobs, PATCH /jobs/:id, DELETE /jobs/:id, PATCH /jobs/:id/archive, PATCH /jobs/:id/unarchive.

### utils.tsx

`createTestQueryClient()` — returns a QueryClient with `retry: false` and `gcTime: 0` so failed queries surface immediately and stale data doesn't persist across tests.

`createWrapper(options)` — returns a Wrapper component that provides:
- `QueryClientProvider` (fresh client per call)
- `AuthContext.Provider` with a default authenticated user (overridable via `auth` option)
- `MemoryRouter` (route history overridable via `initialEntries`)

`renderWithProviders(ui, options)` — convenience wrapper around RTL's `render` that calls `createWrapper` internally.

**Why no `AuthProvider`?** `AuthProvider` imports `posthog-js` which tries to initialize on import. Rather than mocking the entire provider, the wrappers bypass it and inject an `AuthContext.Provider` directly with a mock value. This avoids side-effects and keeps tests fast.

## TypeScript Configuration

Test files are excluded from the main `tsconfig.app.json` so `tsc --noEmit` doesn't enforce `noUnusedLocals` / `noUnusedParameters` on test code. A separate `tsconfig.test.json` extends `tsconfig.app.json` with relaxed strictness and adds the required type augmentations:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src/test"]
}
```

## Patterns

### Hook tests

Use `renderHook` from `@testing-library/react`:

```tsx
const wrapper = createWrapper()
const { result } = renderHook(() => useJob('1'), { wrapper })
await waitFor(() => expect(result.current.isSuccess).toBe(true))
```

The `enabled:` guard is verified by checking that `fetchStatus === 'idle'` when the query condition is false:

```tsx
const { result } = renderHook(() => useJob(undefined), { wrapper })
expect(result.current.fetchStatus).toBe('idle')
```

### Mutation tests

Wrap `mutate` calls in `act()`, then use `waitFor` to await async completion:

```tsx
act(() => { result.current.deleteMutation.mutate(1) })
await waitFor(() => expect(result.current.deleteMutation.isSuccess).toBe(true))
```

### Component tests

For components that use mutations or context (e.g. `StatusBadge`), mock `sonner` to prevent toast side-effects:

```ts
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
```

### Integration tests

The `createJob` integration test exercises the full Add Job flow:

1. Render `<CreateJobDialog />`
2. Click "New Job" to open the dialog
3. Type into the Company and Job Title fields
4. Click the submit button
5. Assert the dialog closes (MSW intercepts the POST and returns 201)

The dialog title (`<h2>`) and submit button both contain "Add job" — use `getByRole('heading', { name: 'Add job' })` for the title and `getByRole('button', { name: 'Add job' })` for the submit button to avoid ambiguous queries.

## What's Not Covered (and Why)

| Area | Reason |
|------|--------|
| Page-level components (JobsPage, JobDetailPage) | Too many dependencies; more valuable as Playwright e2e tests |
| Auth flow (signin, signup) | UI/redirect behaviour is better validated by e2e |
| Charts (recharts in AnalyticsPage) | jsdom doesn't render SVG layouts; skipped |
| File upload (ResumeTab) | File API needs additional jsdom setup; deferred |
| Radix UI dropdown open/close in StatusBadge | Radix uses portals; interaction tests are brittle in jsdom |

## Adding New Tests

1. Add fixtures to `src/test/fixtures.ts` if a new model is needed
2. Add MSW handlers to `src/test/handlers.ts` for any new endpoints
3. Follow the `[resource].test.ts` naming convention and place under the matching subdirectory (`lib/`, `hooks/`, `components/`, `integration/`)
4. Use `renderWithProviders` for components; `renderHook` + `createWrapper` for hooks
5. Mock `sonner` in any test that exercises a mutation
