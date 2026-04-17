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

## 4. Use keepPreviousData for search/filter queries

**The pattern:** A search input that causes `isLoading` to flip true on every keystroke,
replacing the list with a loading spinner.

**Why it matters:** Jarring UX — the existing results disappear while the new ones load.

**The rule:** Add `placeholderData: keepPreviousData` to any query whose key changes on
user input.
