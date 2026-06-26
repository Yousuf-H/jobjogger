# Frontend Components — Overview

## Directory structure

Components live in `jobjogger_web/src/components/` and are organised by domain:

```
components/
  contact/        ContactAvatar, ContactForm, InteractionForm, OrgContactsTab
  job/            All job-detail tabs, dialogs, toolbar, table columns
  layout/         AppLayout, Sidebar, Nav, PageError, PageLoading
  notifications/  NotificationBell, NotificationPanel
  organisation/   OrganisationForm
  profile/        ProfileForm
  resume/         ResumePage sub-components
  settings/       SettingsForm
  ui/             Shared design-system primitives (shadcn + custom)
```

Pages in `pages/` compose these components. Each detail page (JobDetailPage, ContactDetailPage, OrganisationDetailPage) owns its layout, header card, and tab switching; the tabs themselves are separate components.

---

## Shared UI primitives

### EmptyTabState

`components/job/EmptyTabState.tsx` — the standard empty state for every tab in the application.

```tsx
interface EmptyTabStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}
```

Renders a centred card with a rounded icon badge, heading, description, and an optional action button. Use it instead of ad-hoc `flex min-h-[200px] flex-col items-center` markup. The button only renders when **both** `actionLabel` and `onAction` are supplied — omit either to render a read-only empty state (used for terminal-status jobs).

**Currently used in:**
- `NotesTab` — "No notes yet"
- `JobInfoTab` — "No job description yet"
- `InterviewsTab` — "No interviews logged yet" (conditional action, hidden when readOnly)
- `ResumeTab` — "No resume linked" (conditional action, hidden when readOnly)
- `OrgContactsTab` — "No contacts at this organisation yet"

**Known TODOs:**
- `TimelineTab` empty state should use EmptyTabState, but the action triggers `AddTimelineEntryDialog` which owns its own open state — fix requires adding `open`/`onOpenChange` props to that dialog.
- `JobContactsTab` empty state has two buttons (Link Existing + New Contact) that don't fit the single `onAction` slot — fix requires extending `EmptyTabState` or a bespoke empty state.

### MetaItem

`components/ui/MetaItem.tsx` — a labelled icon+value strip used in all three detail page headers.

```tsx
<MetaItem icon={Globe} label="Website">
  <a href={org.website}>Visit</a>
</MetaItem>
```

### MobileListRow

`components/ui/MobileListRow.tsx` — an avatar + clickable row used in list pages (JobsPage, ContactsPage, OrganisationsPage) for the mobile card view.

---

## Form components

Four reusable form components accept `onSubmit`, `defaultValues`, and `isSubmitting` props. Each manages its own `useForm` internally:

| Component | Used in |
|-----------|---------|
| `JobForm` | `CreateJobDialog`, `EditJobDialog` |
| `ContactForm` | `JobContactsTab`, `OrgContactsTab`, `ContactDetailPage` |
| `OrganisationForm` | `OrganisationDetailPage.EditOrganisationDialog` |
| `InteractionForm` | `ContactDetailPage.EditInteractionDialog`, `ContactDetailPage.InteractionsTab` |

All forms use **React Hook Form** with a **Zod** resolver. All date inputs use the shadcn `<Input>` component with `type="date"`, wrapped in a relative div with a `CalendarIcon` at `left-3` and `pl-9 cursor-pointer max="9999-12-31"`.

### Form reset pattern — known technical debt

All dialogs that wrap these form components use `key={open ? 'open' : 'closed'}` to remount and reset the form on close. This is a valid technique but causes unnecessary remounts. The correct pattern (as implemented in `AddTimelineEntryDialog`) is to call `form.reset()` in the `onOpenChange` handler, which requires lifting `useForm` to the dialog scope.

Every instance carries a `// TODO: replace key trick with form.reset()` comment. Fixing it requires refactoring the form component to either accept a `form` prop (lifting `useForm` to the caller) or expose a reset mechanism via `useImperativeHandle`.

**Reference implementation:** `AddTimelineEntryDialog` — creates `useForm` at the dialog level and calls `form.reset()` after a successful submit.

---

## Status and priority config

All job-status and priority display config lives in `lib/statusConfig.ts`:

```ts
STATUS_CONFIG: Record<JobStatus, { label, color, badgeClass }>
PRIORITY_CONFIG: Record<'low'|'medium'|'high', { label, badgeClass }>

getStatusConfig(status: string): StatusConfig
getPriorityConfig(priority: string | null | undefined): PriorityConfig | null
```

**Rule:** never inline status labels, colors, or badge classes in a component. Always derive from these two records.

`StatusBadge` derives its dropdown options from `STATUS_CONFIG`. `JobsToolbar` derives its filter options from both records. This ensures label changes propagate automatically.

---

## Dialog patterns

All dialogs follow the shadcn Dialog component structure:

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>…</DialogTitle>
      <DialogDescription className="sr-only">…</DialogDescription>
    </DialogHeader>
    {/* form */}
  </DialogContent>
</Dialog>
```

Checklist for every dialog:

| Requirement | How to meet it |
|-------------|---------------|
| Correct structure | `Dialog > DialogContent > DialogHeader > DialogTitle` |
| Loading state | Pass `isSubmitting={mutation.isPending}` to the form; button renders "Saving…" and is disabled |
| Error toasts | Use `extractErrorMessage(error, fallback)` from `lib/errors.ts` in the mutation `onError` callback |
| Form reset on close | `form.reset()` in `onOpenChange` (or key trick with TODO comment while awaiting refactor) |
| Confirmation before destructive action | `AlertDialog` from shadcn, description names the affected record and clarifies what won't be deleted |

**`CreateJobDialog`** and **`EditJobDialog`** are the reference implementations — they use `extractErrorMessage`, show spinner via `isSubmitting`, and have correct Dialog structure.

---

## Tab architecture

### JobDetailPage tabs

Rendered by `JobTabs.tsx`. Each tab is a separate component:

| Tab | Component | Notes |
|-----|-----------|-------|
| Description | `JobInfoTab` | Markdown editor, paste-from-HTML |
| Notes | `NotesTab` | Markdown editor |
| Timeline | `TimelineTab` | Status-change events + user entries |
| Contacts | `JobContactsTab` | Link existing or create new |
| Interviews | `InterviewsTab` | Rounds + pinned prep questions |
| Resume | `ResumeTab` | Link a resume variant |

The Interviews tab is hidden for `wishlist` jobs (unless interviews already exist). All write actions inside any tab check `TERMINAL_STATUSES` and are suppressed when the job is closed.

### OrganisationDetailPage tabs

Tabs: Overview, Jobs, Contacts. "Contacts" delegates to `OrgContactsTab`. "Jobs" renders a list of linked `OrgJob` records using `getStatusConfig()` for status dots and badges.

### ContactDetailPage tabs

Tabs: Interactions, Jobs. Interactions renders a timeline using `getInteractionIconConfig()` (local function — interaction-domain colors, intentionally not in `statusConfig.ts`).

---

## InterviewsTab — domain-specific config

`InterviewsTab.tsx` defines `OUTCOME_CONFIG` locally:

```ts
const OUTCOME_CONFIG: Record<InterviewOutcome, { stripe, badge, activePill, dot, label }>
```

This is interview-specific display config (pending/passed/failed colors). It does **not** belong in `statusConfig.ts` which covers job-level status and priority only.
