# Recurring Issues — Frontend

A living list of mistakes that have appeared in review more than once.
Check this before opening a PR that touches pages, components, or hooks.

---

## 1. Don't use toLocaleDateString() on date-only strings

**The pattern:** Rendering a date-only value (e.g. `occurred_at`, `date_applied`) using
`new Date(value).toLocaleDateString()`.

**Why it matters:** JavaScript parses ISO date-only strings (`2026-04-17`) as midnight UTC.
`toLocaleDateString()` then converts to local time, shifting the date back by one day for
users in timezones behind UTC (e.g. Americas).

**The rule:** Parse date-only strings without timezone conversion.

```ts
// Bad
new Date(occurred_at).toLocaleDateString()

// Good — split on T and format the date part directly
const [year, month, day] = occurred_at.split('T')[0].split('-')
`${day}/${month}/${year}`

// Or use date-fns with parseISO which respects the date-only format
import { parseISO, format } from 'date-fns'
format(parseISO(occurred_at), 'dd/MM/yyyy')
```

**Seen in:** contact interactions (PR #36).

---

## 2. Don't fire queries before data dependencies are loaded

**The pattern:** Calling a hook that depends on another hook's result (e.g. `org.id`) before
the parent query has resolved, without an `enabled` guard.

**Why it matters:** Fires a spurious request with `undefined` params, potentially returning
wrong data or making an unnecessary network call.

**The rule:** Always pass `enabled: !!dependency` when a query depends on another value
that isn't available on first render.

```ts
// Bad
const { data: orgContacts } = useContacts({ organisation_id: org?.id })

// Good
const { data: orgContacts } = useContacts(
  { organisation_id: org?.id },
  { enabled: !!org?.id }
)
```

---

## 3. Don't share mutation pending state across a list of items

**The pattern:** Using `mutation.isPending` as the `isLoading`/`isDisabled` prop on every
item in a list when only one item is being acted on.

**Why it matters:** Disables all interactive elements in the list while a single action is
in flight, which is confusing and broken UX.

**The rule:** Track which specific item is pending using local state alongside the mutation.

```tsx
// Bad
isDeleting={deleteMutation.isPending}  // passed to every row

// Good
const [deletingId, setDeletingId] = useState<number | null>(null)
const handleDelete = (id: number) => {
  setDeletingId(id)
  deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) })
}
isDeleting={deletingId === item.id}
```

---

## 5. Convert datetime-local input values to UTC before sending to the API

**The pattern:** Sending the raw value from a `<input type="datetime-local">` directly to the backend.

**Why it matters:** `datetime-local` gives a string like `2026-04-18T21:05` with no timezone.
Rails stores it as UTC as-is. When the frontend receives it back as `2026-04-18T21:05:00Z`
and renders it with `new Date()`, it converts from UTC to local time — adding the user's
UTC offset (e.g. +10 for AEST), shifting the time forward by 10 hours.

**The rule:** Always convert with `new Date(value).toISOString()` before submitting.

```ts
// Bad
createMutation.mutate({ scheduled_at: form.scheduled_at })

// Good
createMutation.mutate({ scheduled_at: new Date(form.scheduled_at).toISOString() })
```

**Seen in:** interview scheduling (feature/interview).

---

## 4. Use keepPreviousData for search/filter queries

**The pattern:** A search input that causes `isLoading` to flip true on every keystroke,
replacing the list with a loading spinner.

**Why it matters:** Jarring UX — the existing results disappear while the new ones load.

**The rule:** Add `placeholderData: keepPreviousData` to any query whose key changes on
user input.

---

## 6. Pre-fill datetime-local edit forms in local time, not UTC

**The pattern:** Pre-filling an edit form's `datetime-local` input by slicing the raw UTC
string returned by the API.

**Why it matters:** The API returns timestamps as UTC (e.g. `"2026-04-18T11:00:00.000Z"`).
`.slice(0, 16)` gives `"2026-04-18T11:00"` — the UTC time. For a user in AEST (+10) whose
interview was scheduled at 9 PM local time, the edit form shows 11 AM instead. Saving
without changes shifts the stored time by the user's UTC offset.

**The rule:** Convert UTC → browser local time using `format` from date-fns before assigning
to the form state.

```ts
// Bad — slices UTC string, shows wrong hour for non-UTC users
scheduled_at: interview.scheduled_at.slice(0, 16)

// Good — converts UTC to local time before pre-filling
import { format } from 'date-fns'
scheduled_at: format(new Date(interview.scheduled_at), "yyyy-MM-dd'T'HH:mm")
```

**Seen in:** InterviewsTab edit form (feature/interview PR #38).

---

## 7. Invalidate all affected query keys after a mutation

**The pattern:** A mutation that changes data visible in multiple query caches only
invalidates the query key for the resource it directly mutates.

**Why it matters:** Other views that read from a different query key show stale data until
an unrelated refetch. For example, creating/updating/deleting an interview changes
`next_interview_at` on the job — if only the `interviews` cache is invalidated, the job
detail and job list continue to show the old value.

**The rule:** In the action hook's `invalidate` function, call `invalidateQueries` for
every query key that could reflect the mutation's effect — not just the primary resource.

```ts
// Bad — only the interviews cache is refreshed
const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: ['interviews', userId, jobId] })

// Good — jobs cache also refreshed so next_interview_at updates immediately
const invalidate = () => {
  queryClient.invalidateQueries({ queryKey: ['interviews', userId, jobId] })
  queryClient.invalidateQueries({ queryKey: ['jobs', userId] })
}
```

**Seen in:** useInterviews hook (feature/interview PR #38).

---

## 8. Pair every hardcoded hex color with a dark-mode equivalent — or use a token instead

**The pattern:** Adding an arbitrary Tailwind color class (`bg-[#F9FAFB]`, `text-[#6B7280]`,
`border-[#E5E7EB]`, `border-white`, etc.) without a `dark:` variant. This has shipped three
separate times: a review-bot catch on `TimelineTab.tsx` description text with no dark
override, a full-page audit after the UI redesign found ~40+ unpaired hex classes across 8
files, and a `border-white` "cutout" ring around timeline/interaction dot icons that was
invisible-but-wrong until a dark-mode screenshot showed a bright white ring on a dark card.

**Why it matters:** The app's dark mode (`next-themes` + the `.dark` class + Tailwind's
`@custom-variant dark (&:is(.dark *))` in `index.css`) only works if every color either
resolves through a theme token or has an explicit `dark:` pair. Arbitrary hex values don't
get this for free, and the bug is invisible to `tsc`/`eslint` — it only shows up on visual
inspection in dark mode.

**The rule:**
1. Prefer an existing semantic token over a hardcoded hex wherever one exists — `bg-card`,
   `text-muted-foreground`, `border-border`, `bg-muted`, etc. These resolve correctly in both
   themes automatically because the underlying CSS var swaps in `.dark`.
2. If no token fits (e.g. a per-type accent color), pair the hex with an explicit `dark:`
   class using a Tailwind named-color shade, not another raw hex.
3. Watch for "relative to background" techniques like a colored ring with a `border-white`
   gap to separate it from the card behind it — `border-white` assumes a light card and
   breaks in dark mode. Use `border-card` instead so the cutout always matches the actual
   card background.

```tsx
// Bad — no dark variant, and assumes a white card background
<div className="border-2 border-white bg-[#F9FAFB] text-[#6B7280]">

// Good — token where one exists, dark: pair where it doesn't
<div className="border-2 border-card dark:bg-muted text-muted-foreground">
```

**Seen in:** TimelineTab.tsx description text (review comment), app-wide redesign dark-mode
audit, dot-icon `border-white` cutout on TimelineTab/ContactDetailPage/TimelineHelpDialog
(feature/detail-pages-redesign).
