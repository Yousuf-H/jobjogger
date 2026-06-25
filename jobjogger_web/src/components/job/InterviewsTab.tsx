import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MarkdownEditor } from '@/components/ui/markdown-editor'
import { Markdown } from '@/components/ui/markdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useInterviewActions,
  useInterviewQuestions,
  useInterviews,
  usePinnedQuestionActions,
  usePinnedQuestions,
} from '@/hooks/useInterviews'
import {
  INTERVIEW_FORMAT_LABELS,
  INTERVIEW_FORMATS,
  INTERVIEW_OUTCOMES,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPES,
  QUESTION_CATEGORIES,
  QUESTION_CATEGORY_LABELS,
  type Interview,
  type InterviewFormat,
  type InterviewOutcome,
  type InterviewType,
  type QuestionCategory,
} from '@/types/interview'
import { TERMINAL_STATUSES, type JobStatus } from '@/types/job'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import {
  AlertTriangle,
  BookOpen,
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  Eye,
  Library,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'

// ─── Outcome config — single source of truth for all outcome colours ──────────

const OUTCOME_CONFIG: Record<
  InterviewOutcome,
  { stripe: string; badge: string; activePill: string; dot: string; label: string }
> = {
  pending: {
    stripe: 'bg-amber-500 dark:bg-amber-600',
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    activePill:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#854F0B] dark:text-[#FAC775] dark:border-[#EF9F27]',
    dot: 'bg-amber-500 dark:bg-amber-400',
    label: 'Pending',
  },
  passed: {
    stripe: 'bg-emerald-600 dark:bg-emerald-500',
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    activePill:
      'bg-green-50 text-green-700 border-green-200 dark:bg-[#27500A] dark:text-[#C0DD97] dark:border-[#639922]',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
    label: 'Passed',
  },
  failed: {
    stripe: 'bg-red-600 dark:bg-red-500',
    badge:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
    activePill:
      'bg-red-50 text-red-700 border-red-200 dark:bg-[#791F1F] dark:text-[#F7C1C1] dark:border-[#E24B4A]',
    dot: 'bg-red-600 dark:bg-red-400',
    label: 'Failed',
  },
}

const OUTCOME_ICONS: Record<InterviewOutcome, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  passed: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
}

// ─── Interview form state ─────────────────────────────────────────────────────

interface InterviewFormState {
  scheduled_at: string
  interview_type: InterviewType
  format: InterviewFormat | ''
  location_or_link: string
  prep_notes: string
}

const DEFAULT_FORM: InterviewFormState = {
  scheduled_at: '',
  interview_type: 'phone_screen',
  format: '',
  location_or_link: '',
  prep_notes: '',
}

// ─── Interview drawer ─────────────────────────────────────────────────────────

function InterviewDrawer({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
  isSubmitting,
  warningMessage,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  initial?: InterviewFormState
  onSubmit: (data: InterviewFormState) => void
  isSubmitting: boolean
  warningMessage?: string
}) {
  const [form, setForm] = useState<InterviewFormState>(initial ?? DEFAULT_FORM)
  const [prepView, setPrepView] = useState<'write' | 'preview'>('write')

  // Reset form each time the drawer opens
  useEffect(() => {
    if (open) {
      setForm(initial ?? DEFAULT_FORM)
      setPrepView('write')
    }
  // `initial` is a new object each render — only reset on open change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const set = (key: keyof InterviewFormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const canSave = Boolean(form.scheduled_at && form.interview_type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[560px] max-h-[90vh] p-0 flex flex-col gap-0 rounded-[10px] max-sm:max-w-none max-sm:h-dvh max-sm:max-h-none max-sm:rounded-none">
        {/* Fixed header */}
        <div className="shrink-0 border-b border-border px-6 pt-5 pb-[14px] pr-12">
          <DialogTitle className="text-[14px] font-medium text-foreground leading-tight">{title}</DialogTitle>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-[16px]">
          {warningMessage && (
            <div className="flex items-center gap-2 rounded-[7px] border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/10 dark:text-amber-400">
              <AlertTriangle className="h-[13px] w-[13px] shrink-0" />
              {warningMessage}
            </div>
          )}

          {/* Row 1: Date & Time + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">Date & Time *</label>
              <div className="relative">
                <CalendarIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-[13px] w-[13px] -translate-y-1/2" />
                <Input
                  type="datetime-local"
                  className="rounded-[7px] text-[12px] h-auto pl-9 py-[7px] bg-background border-border cursor-pointer"
                  max="9999-12-31"
                  value={form.scheduled_at}
                  onChange={(e) => set('scheduled_at', e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">Type *</label>
              <Select
                value={form.interview_type}
                onValueChange={(v) => set('interview_type', v)}
              >
                <SelectTrigger className="rounded-[7px] text-[12px] h-auto px-[10px] py-[7px] bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {INTERVIEW_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Format + Location / Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">Format</label>
              <Select
                value={form.format || '__none'}
                onValueChange={(v) => set('format', v === '__none' ? '' : v)}
              >
                <SelectTrigger className="rounded-[7px] text-[12px] h-auto px-[10px] py-[7px] bg-background border-border">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Not specified</SelectItem>
                  {INTERVIEW_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {INTERVIEW_FORMAT_LABELS[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">Location / Link</label>
              <Input
                className="rounded-[7px] text-[12px] h-auto px-[10px] py-[7px] bg-background border-border"
                placeholder="e.g. Zoom link or office address"
                value={form.location_or_link}
                onChange={(e) => set('location_or_link', e.target.value)}
              />
            </div>
          </div>

          {/* Prep Notes — full width with Write / Preview toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-muted-foreground">Prep Notes</label>
              <div className="flex items-center gap-[3px] rounded-[7px] bg-muted p-[3px]">
                {(['write', 'preview'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPrepView(v)}
                    className={cn(
                      'flex items-center gap-[5px] rounded-[5px] px-[12px] py-[4px] text-[12px] transition-colors',
                      prepView === v
                        ? 'bg-card border border-border text-foreground font-medium shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {v === 'write'
                      ? <Edit3 className="h-[11px] w-[11px]" />
                      : <Eye className="h-[11px] w-[11px]" />
                    }
                    {v === 'write' ? 'Write' : 'Preview'}
                  </button>
                ))}
              </div>
            </div>

            {prepView === 'write' ? (
              <Textarea
                value={form.prep_notes}
                onChange={(e) => set('prep_notes', e.target.value)}
                placeholder="Research, questions to prepare, key talking points… (markdown supported)"
                rows={5}
                className="rounded-[7px] text-[12px] leading-[1.6] bg-background border-border resize-y"
              />
            ) : form.prep_notes ? (
              <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-[13px] [&_p]:text-foreground/80 [&_p]:leading-[1.7] [&_li]:text-[13px] [&_li]:text-foreground/80 [&_li]:leading-[1.7] [&_ul]:pl-[16px] [&_ol]:pl-[16px]">
                <Markdown>{form.prep_notes}</Markdown>
              </div>
            ) : (
              <p className="text-[12px] italic text-muted-foreground">No prep notes yet.</p>
            )}
          </div>
        </div>

        {/* Pinned footer */}
        <div className="shrink-0 border-t border-border px-6 pt-[12px] pb-4">
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onSubmit(form)}
              disabled={!canSave || isSubmitting}
            >
              {isSubmitting ? 'Saving…' : 'Save interview'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Interview round card ─────────────────────────────────────────────────────

function SubSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-muted-foreground">
      {children}
    </span>
  )
}

function InlineEditButtons({
  onCancel,
  onSave,
  isPending,
}: {
  onCancel: () => void
  onSave: () => void
  isPending: boolean
}) {
  return (
    <div className="mt-2 flex justify-end gap-2">
      <button
        onClick={onCancel}
        className="rounded-[6px] border border-border bg-card px-[10px] py-[5px] text-[12px] font-medium text-foreground/80 hover:bg-muted/50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isPending}
        className="flex items-center gap-[5px] rounded-[6px] bg-primary px-[10px] py-[5px] text-[12px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

function InterviewCard({
  interview,
  round,
  jobId,
  readOnly = false,
}: {
  interview: Interview
  round: number
  jobId: number
  readOnly?: boolean
}) {
  const { updateMutation, deleteMutation } = useInterviewActions(jobId)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingDebrief, setEditingDebrief] = useState(false)
  const [debrief, setDebrief] = useState(interview.debrief_notes ?? '')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [debriefView, setDebriefView] = useState<'write' | 'preview'>('write')

  // Optimistic outcome: null means use server value
  const [optimisticOutcome, setOptimisticOutcome] = useState<InterviewOutcome | null>(null)

  const isPastInterview = isPast(new Date(interview.scheduled_at))
  const scheduledDate = new Date(interview.scheduled_at)

  // Show the optimistic value only while it still differs from the server value.
  // Once interview.outcome catches up, displayOutcome resolves to it naturally —
  // no setState-in-effect needed, and no flicker between optimistic and server state.
  const displayOutcome = (optimisticOutcome !== null && interview.outcome !== optimisticOutcome)
    ? optimisticOutcome
    : interview.outcome
  const outcomeConfig = OUTCOME_CONFIG[displayOutcome]

  const handleOutcome = (outcome: InterviewOutcome) => {
    if (readOnly || updateMutation.isPending) return
    setOptimisticOutcome(outcome)
    updateMutation.mutate(
      { id: interview.id, data: { outcome } },
      { onError: () => setOptimisticOutcome(null) }
    )
  }

  const handleUpdate = (form: InterviewFormState) => {
    updateMutation.mutate(
      {
        id: interview.id,
        data: {
          ...form,
          scheduled_at: new Date(form.scheduled_at).toISOString(),
          format: form.format || null,
        },
      },
      { onSuccess: () => setDrawerOpen(false) }
    )
  }

  const handleSaveDebrief = () => {
    updateMutation.mutate(
      { id: interview.id, data: { debrief_notes: debrief } },
      { onSuccess: () => { setEditingDebrief(false); setDebriefView('write') } }
    )
  }

  const handleDelete = () => {
    setDeletingId(interview.id)
    deleteMutation.mutate(interview.id, {
      onSettled: () => setDeletingId(null),
    })
  }

  return (
    <>
    <div className="flex rounded-[10px] border border-border bg-card overflow-hidden">
      {/* Left accent stripe — colour driven by outcome */}
      <div className={cn('w-1 shrink-0 transition-colors duration-200', outcomeConfig.stripe)} />

      {/* Card body */}
      <div className="flex-1 p-[14px_16px]">
        {/* Header row */}
        <div className="mb-[10px] flex items-start justify-between gap-2">
          {/* Meta tags */}
          <div className="flex flex-wrap items-center gap-[7px]">
            <span className="text-[11px] font-medium text-muted-foreground">Round {round}</span>

            <span className="rounded-full border border-border bg-muted px-[8px] py-[2px] text-[11px] font-medium text-foreground/80">
              {INTERVIEW_TYPE_LABELS[interview.interview_type]}
            </span>

            {interview.format && (
              <span className="rounded-full border border-border bg-muted px-[8px] py-[2px] text-[11px] font-medium text-foreground/80">
                {INTERVIEW_FORMAT_LABELS[interview.format]}
              </span>
            )}

            {/* Outcome badge */}
            <span
              className={cn(
                'flex items-center gap-[4px] rounded-full border px-[8px] py-[2px] text-[10px] font-medium',
                outcomeConfig.badge
              )}
            >
              <span className={cn('h-[6px] w-[6px] shrink-0 rounded-full', outcomeConfig.dot)} />
              {outcomeConfig.label}
            </span>
          </div>

          {/* Edit / delete icon buttons */}
          {!readOnly && (
            <div className="flex shrink-0 items-center gap-[6px]">
              <button
                onClick={() => setDrawerOpen(true)}
                title="Edit interview"
                className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:bg-muted/50"
              >
                <Pencil className="h-[12px] w-[12px]" />
              </button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={deletingId === interview.id}
                    title="Delete interview"
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-border text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-50"
                  >
                    <Trash2 className="h-[12px] w-[12px]" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete interview?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this interview record including prep and debrief
                      notes. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Date/time row */}
        <div className="mb-[12px] flex flex-wrap items-center gap-[6px] text-[12px] font-medium text-foreground/80">
          <CalendarIcon className="h-[13px] w-[13px] text-muted-foreground" />
          {format(scheduledDate, 'EEE d MMM yyyy, h:mm a')}
          {!isPastInterview && (
            <span className="text-[11px] font-normal text-muted-foreground">
              · {formatDistanceToNow(scheduledDate, { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Location */}
        {interview.location_or_link && (
          <div className="mb-[12px] flex min-w-0 items-center gap-[5px] text-[12px] text-primary">
            <MapPin className="h-[12px] w-[12px] shrink-0" />
            {interview.location_or_link.startsWith('http') ? (
              <a
                href={interview.location_or_link}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:underline"
              >
                {interview.location_or_link}
              </a>
            ) : (
              <span className="truncate">{interview.location_or_link}</span>
            )}
          </div>
        )}

        {/* Outcome selector */}
        <div className="mb-[14px] flex flex-wrap items-center gap-[8px]">
          <span className="text-[11px] font-medium text-muted-foreground">Outcome</span>
          <div className="flex items-center gap-[3px] rounded-[7px] bg-muted p-[3px]">
            {INTERVIEW_OUTCOMES.map((o) => {
              const isActive = displayOutcome === o
              const config = OUTCOME_CONFIG[o]
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => handleOutcome(o)}
                  disabled={readOnly || updateMutation.isPending}
                  className={cn(
                    'flex items-center gap-[5px] rounded-[5px] px-[10px] py-[4px] text-[11px] font-medium transition-colors',
                    readOnly ? 'cursor-default' : 'cursor-pointer',
                    isActive
                      ? 'bg-card border border-border text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground disabled:cursor-default'
                  )}
                >
                  {OUTCOME_ICONS[o]}
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Prep notes subsection */}
        <div className="mt-[14px] border-t border-border/60 pt-[12px]">
          <div className="mb-[8px]">
            <SubSectionLabel>Prep Notes</SubSectionLabel>
          </div>

          {interview.prep_notes ? (
            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-[13px] [&_p]:text-foreground/80 [&_p]:leading-[1.7] [&_li]:text-[13px] [&_li]:text-foreground/80 [&_li]:leading-[1.7] [&_ul]:pl-[16px] [&_ol]:pl-[16px] [&_strong]:font-semibold [&_strong]:text-foreground [&_h1]:text-[14px] [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mb-[4px] [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-[4px] [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-[4px]">
              <Markdown>{interview.prep_notes}</Markdown>
            </div>
          ) : (
            <p className="text-[12px] italic text-muted-foreground">No prep notes yet.</p>
          )}
        </div>

        {/* Debrief subsection — only for past interviews */}
        {isPastInterview && (
          <div className="mt-[2px] border-t border-border/60 pt-[12px]">
            <div className="mb-[8px] flex items-center justify-between">
              <SubSectionLabel>Debrief</SubSectionLabel>
              {!readOnly && !editingDebrief && (
                <button
                  onClick={() => setEditingDebrief(true)}
                  className="flex items-center gap-[3px] text-[11px] font-medium text-primary hover:underline"
                >
                  {interview.debrief_notes ? (
                    <Pencil className="h-[10px] w-[10px]" />
                  ) : (
                    <Plus className="h-[10px] w-[10px]" />
                  )}
                  {interview.debrief_notes ? 'Edit' : 'Add'}
                </button>
              )}
            </div>

            {editingDebrief ? (
              <div>
                <div className="mb-2 flex justify-start">
                  <div className="flex items-center gap-[3px] rounded-[7px] bg-muted p-[3px]">
                    {(['write', 'preview'] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setDebriefView(v)}
                        className={cn(
                          'flex items-center gap-[5px] rounded-[5px] px-[12px] py-[4px] text-[12px] transition-colors',
                          debriefView === v
                            ? 'bg-card border border-border text-foreground font-medium shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {v === 'write' ? <Edit3 className="h-[11px] w-[11px]" /> : <Eye className="h-[11px] w-[11px]" />}
                        {v === 'write' ? 'Write' : 'Preview'}
                      </button>
                    ))}
                  </div>
                </div>
                {debriefView === 'write' ? (
                  <Textarea
                    value={debrief}
                    onChange={(e) => setDebrief(e.target.value)}
                    placeholder="How did it go? What was asked? Any follow-up actions… (markdown supported)"
                    rows={5}
                    className="text-[12px] leading-[1.6] resize-y"
                  />
                ) : debrief ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-[13px] [&_p]:text-foreground/80 [&_p]:leading-[1.7] [&_li]:text-[13px] [&_li]:text-foreground/80 [&_li]:leading-[1.7] [&_ul]:pl-[16px] [&_ol]:pl-[16px] [&_h1]:text-[14px] [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mb-[4px] [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-[4px] [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-[4px]">
                    <Markdown>{debrief}</Markdown>
                  </div>
                ) : (
                  <p className="text-[12px] italic text-muted-foreground">Nothing to preview yet.</p>
                )}
                <InlineEditButtons
                  onCancel={() => {
                    setDebrief(interview.debrief_notes ?? '')
                    setEditingDebrief(false)
                    setDebriefView('write')
                  }}
                  onSave={handleSaveDebrief}
                  isPending={updateMutation.isPending}
                />
              </div>
            ) : interview.debrief_notes ? (
              <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-[13px] [&_p]:text-foreground/80 [&_p]:leading-[1.7] [&_li]:text-[13px] [&_li]:text-foreground/80 [&_li]:leading-[1.7] [&_ul]:pl-[16px] [&_ol]:pl-[16px] [&_strong]:font-semibold [&_strong]:text-foreground [&_h1]:text-[14px] [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mb-[4px] [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-[4px] [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-[4px]">
                <Markdown>{interview.debrief_notes}</Markdown>
              </div>
            ) : (
              <p className="text-[12px] italic text-muted-foreground">
                No debrief yet. How did it go?
              </p>
            )}
          </div>
        )}
      </div>
    </div>
    <InterviewDrawer
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      title="Edit interview"
      initial={{
        scheduled_at: format(new Date(interview.scheduled_at), "yyyy-MM-dd'T'HH:mm"),
        interview_type: interview.interview_type,
        format: interview.format ?? '',
        location_or_link: interview.location_or_link ?? '',
        prep_notes: interview.prep_notes ?? '',
      }}
      onSubmit={handleUpdate}
      isSubmitting={updateMutation.isPending}
    />
    </>
  )
}

// ─── Add from Question Bank (unchanged) ──────────────────────────────────────

function AddFromBankDialog({
  open,
  onOpenChange,
  jobId,
  organisationId,
  pinnedIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: number
  organisationId: number | null
  pinnedIds: number[]
}) {
  const { data: allQuestions = [] } = useInterviewQuestions({ scope: 'all' }, { enabled: open })
  const { pinMutation } = usePinnedQuestionActions(jobId)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')

  const available = allQuestions.filter(
    (q) =>
      !pinnedIds.includes(q.id) &&
      (q.job_id === null || q.job_id === jobId) &&
      (q.organisation_id === null || q.organisation_id === organisationId)
  )
  const filtered = search
    ? available.filter((q) => q.question.toLowerCase().includes(search.toLowerCase()))
    : available

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })

  const handleAdd = async () => {
    try {
      await Promise.all(Array.from(selected).map((id) => pinMutation.mutateAsync(id)))
      setSelected(new Set())
      onOpenChange(false)
    } catch {
      // individual errors handled by the mutation
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) { setSelected(new Set()); setSearch('') }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add from Question Bank</DialogTitle>
          <DialogDescription className="sr-only">
            Search and pin existing questions from your question bank to this job.
          </DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search questions…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-72">
            <CommandEmpty>No questions found.</CommandEmpty>
            {QUESTION_CATEGORIES.map((cat) => {
              const catQs = filtered.filter((q) => q.category === cat)
              if (catQs.length === 0) return null
              return (
                <CommandGroup key={cat} heading={QUESTION_CATEGORY_LABELS[cat]}>
                  {catQs.map((q) => (
                    <CommandItem
                      key={q.id}
                      value={String(q.id)}
                      onSelect={() => toggle(q.id)}
                      className="gap-2"
                    >
                      <Checkbox
                        checked={selected.has(q.id)}
                        onCheckedChange={() => toggle(q.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="flex-1 leading-snug">{q.question}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={selected.size === 0 || pinMutation.isPending}
            onClick={handleAdd}
          >
            Add {selected.size > 0 ? selected.size : ''} question{selected.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── New Question (unchanged) ─────────────────────────────────────────────────

function NewQuestionDialog({
  open,
  onOpenChange,
  jobId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: number
}) {
  const { createAndPinMutation } = usePinnedQuestionActions(jobId)
  const [form, setForm] = useState({
    question: '',
    category: 'behavioural' as QuestionCategory,
    answer: '',
  })

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = () => {
    createAndPinMutation.mutate(
      {
        question: form.question,
        category: form.category,
        answer: form.answer || null,
      },
      {
        onSuccess: () => {
          setForm({ question: '', category: 'behavioural', answer: '' })
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Question</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new interview question and pin it to this job.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Question *</Label>
            <Textarea
              value={form.question}
              onChange={(e) => set('question', e.target.value)}
              placeholder="e.g. Tell me about a time you had to…"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => set('category', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {QUESTION_CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Answer / Notes</Label>
            <MarkdownEditor
              value={form.answer}
              onChange={(v) => set('answer', v)}
              placeholder="Optional — your prepared answer or key points… (markdown supported)"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={!form.question || createAndPinMutation.isPending}
              onClick={handleSubmit}
            >
              {createAndPinMutation.isPending ? 'Saving…' : 'Save question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Relevant questions card ──────────────────────────────────────────────────

function RelevantQuestionsSection({
  jobId,
  readOnly,
  organisationId,
}: {
  jobId: number
  readOnly: boolean
  organisationId: number | null
}) {
  const { data: questions = [] } = usePinnedQuestions(jobId)
  const { unpinMutation } = usePinnedQuestionActions(jobId)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [unpinningId, setUnpinningId] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleUnpin = (id: number) => {
    setUnpinningId(id)
    unpinMutation.mutate(id, { onSettled: () => setUnpinningId(null) })
  }

  return (
    <div className="rounded-[10px] border border-border bg-card overflow-hidden">
      {/* Header row — always visible, toggles body */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center gap-[6px] px-[16px] py-[12px]"
      >
        <BookOpen className="h-[14px] w-[14px] shrink-0 text-muted-foreground" />
        <span className="text-[13px] font-semibold text-foreground">Relevant questions</span>
        <span className="rounded-full bg-muted px-[5px] py-[1px] text-[10px] leading-tight text-muted-foreground">
          {questions.length}
        </span>
        <ChevronDown
          className={cn(
            'ml-auto h-[14px] w-[14px] shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Collapsible body — grid-rows trick animates to/from auto height */}
      <div className={cn('grid transition-all duration-200', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="border-t border-border px-[16px] pb-[14px] pt-[12px]">
            {!readOnly && (
              <div className="mb-[12px] flex items-center justify-end gap-[6px]">
                <button
                  onClick={() => setShowBankDialog(true)}
                  className="flex items-center gap-[5px] rounded-[7px] border border-border bg-card px-[10px] py-[5px] text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                >
                  <Library className="h-[12px] w-[12px]" />
                  Add from bank
                </button>
                <button
                  onClick={() => setShowNewDialog(true)}
                  className="flex items-center gap-[5px] rounded-[7px] border border-border bg-card px-[10px] py-[5px] text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                >
                  <Plus className="h-[12px] w-[12px]" />
                  New question
                </button>
              </div>
            )}

            {questions.length === 0 ? (
              <p className="text-[12px] italic text-muted-foreground">
                No questions yet — add from your bank or create a new one.
              </p>
            ) : (
              <div className="space-y-4">
                {QUESTION_CATEGORIES.map((cat) => {
                  const catQs = questions.filter((q) => q.category === cat)
                  if (catQs.length === 0) return null
                  return (
                    <div key={cat}>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {QUESTION_CATEGORY_LABELS[cat]}
                      </p>
                      <div className="space-y-2">
                        {catQs.map((q) => (
                          <div key={q.id} className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium leading-snug">{q.question}</p>
                              {!readOnly && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      type="button"
                                      className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                                      disabled={unpinningId === q.id}
                                      aria-label="Remove question"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove question?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This question will be removed from this job's prep list. The
                                        question itself won't be deleted.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleUnpin(q.id)}>
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                            {q.answer && (
                              <div className="prose prose-sm dark:prose-invert mt-1.5 max-w-none text-muted-foreground">
                                <Markdown>{q.answer}</Markdown>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddFromBankDialog
        open={showBankDialog}
        onOpenChange={setShowBankDialog}
        jobId={jobId}
        organisationId={organisationId}
        pinnedIds={questions.map((q) => q.id)}
      />
      <NewQuestionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        jobId={jobId}
      />
    </div>
  )
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

interface InterviewsTabProps {
  jobId: number
  status: JobStatus
  organisationId: number | null
  companyName: string
}

export function InterviewsTab({ jobId, status, organisationId }: InterviewsTabProps) {
  const readOnly = TERMINAL_STATUSES.includes(status)
  const { data: interviews = [], isLoading } = useInterviews(jobId)
  const { createMutation } = useInterviewActions(jobId)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Oldest first for round numbering, newest first for display
  const chronological = [...interviews].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )
  const displayOrder = [...chronological].reverse()

  const latestOutcome = chronological[chronological.length - 1]?.outcome
  const lastRoundFailed = latestOutcome === 'failed'

  const handleCreate = (form: InterviewFormState) => {
    createMutation.mutate(
      {
        ...form,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        format: form.format || null,
      },
      { onSuccess: () => setDrawerOpen(false) }
    )
  }

  if (isLoading) {
    return <div className="py-8 text-center text-[13px] text-muted-foreground">Loading…</div>
  }

  return (
    <div className="space-y-4">
      {/* Relevant questions card */}
      <RelevantQuestionsSection
        jobId={jobId}
        readOnly={readOnly}
        organisationId={organisationId}
      />

      {/* Add interview button — only shown when rounds exist; empty state has its own */}
      {!readOnly && interviews.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-[6px] rounded-[7px] border border-border bg-card px-[10px] py-[5px] text-[12px] font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            <Plus className="h-[13px] w-[13px]" />
            Add interview
          </button>
        </div>
      )}

      {/* Interview round cards or empty state */}
      {interviews.length === 0 ? (
        <div className="rounded-[10px] border border-border bg-card p-[14px_16px]">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarIcon className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-[14px] font-medium text-foreground/80">No interviews logged yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Add your first interview round to start tracking.
            </p>
            {!readOnly && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="mt-4 flex items-center gap-[6px] rounded-[7px] bg-primary px-[10px] py-[5px] text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-[13px] w-[13px]" />
                Add interview
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayOrder.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              round={chronological.findIndex((i) => i.id === interview.id) + 1}
              jobId={jobId}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
      <InterviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Schedule interview"
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
        warningMessage={
          lastRoundFailed
            ? 'The last round was marked as failed. Are you sure you want to add another?'
            : undefined
        }
      />
    </div>
  )
}
