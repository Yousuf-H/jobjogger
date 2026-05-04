import EmptyTabState from '@/components/job/EmptyTabState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Dialog,
  DialogContent,
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
  INTERVIEW_OUTCOME_LABELS,
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
import { format, formatDistanceToNow, isPast } from 'date-fns'
import {
  AlertTriangle,
  BookOpen,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Library,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

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

function InterviewForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initial?: InterviewFormState
  onSubmit: (data: InterviewFormState) => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const [form, setForm] = useState<InterviewFormState>(initial ?? DEFAULT_FORM)

  const set = (key: keyof InterviewFormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Date & Time *</Label>
          <div className="relative">
            <CalendarIcon className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              type="datetime-local"
              className="pl-9"
              value={form.scheduled_at}
              onChange={(e) => set('scheduled_at', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Type *</Label>
          <Select
            value={form.interview_type}
            onValueChange={(v) => set('interview_type', v)}
          >
            <SelectTrigger>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Format</Label>
          <Select
            value={form.format || '__none'}
            onValueChange={(v) => set('format', v === '__none' ? '' : v)}
          >
            <SelectTrigger>
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

        <div className="space-y-1.5">
          <Label>Location / Link</Label>
          <Input
            placeholder="e.g. Zoom link or office address"
            value={form.location_or_link}
            onChange={(e) => set('location_or_link', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Prep Notes</Label>
        <MarkdownEditor
          value={form.prep_notes}
          onChange={(v) => set('prep_notes', v)}
          placeholder="Research, questions to prepare, key talking points… (markdown supported)"
          rows={5}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="success"
          disabled={isSubmitting || !form.scheduled_at || !form.interview_type}
          onClick={() => onSubmit(form)}
        >
          {isSubmitting ? 'Saving…' : 'Save Interview'}
        </Button>
      </div>
    </div>
  )
}

const OUTCOME_STYLES: Record<InterviewOutcome, { active: string; hover: string }> = {
  pending: {
    active: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
    hover: 'hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-900/10',
  },
  passed: {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
    hover: 'hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/10',
  },
  failed: {
    active: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
    hover: 'hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/10',
  },
}

const OUTCOME_ICONS: Record<InterviewOutcome, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  passed: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
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
  const [editing, setEditing] = useState(false)
  const [editingDebrief, setEditingDebrief] = useState(false)
  const [debrief, setDebrief] = useState(interview.debrief_notes ?? '')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const isPastInterview = isPast(new Date(interview.scheduled_at))
  const scheduledDate = new Date(interview.scheduled_at)

  const handleUpdate = (form: InterviewFormState) => {
    updateMutation.mutate(
      {
        id: interview.id,
        data: {
          ...form,
          scheduled_at: new Date(form.scheduled_at).toISOString(),
          format: form.format || undefined,
        },
      },
      { onSuccess: () => setEditing(false) }
    )
  }

  const handleSaveDebrief = () => {
    updateMutation.mutate(
      { id: interview.id, data: { debrief_notes: debrief } },
      { onSuccess: () => setEditingDebrief(false) }
    )
  }

  const handleOutcome = (outcome: InterviewOutcome) => {
    updateMutation.mutate({ id: interview.id, data: { outcome } })
  }

  const handleDelete = () => {
    setDeletingId(interview.id)
    deleteMutation.mutate(interview.id, {
      onSettled: () => setDeletingId(null),
    })
  }

  return (
    <div className={`rounded-lg border-2 bg-card p-4 shadow-sm ${
      interview.outcome === 'passed'
        ? 'border-emerald-200 dark:border-emerald-900/50'
        : interview.outcome === 'failed'
          ? 'border-red-200 dark:border-red-900/50'
          : 'border-amber-200 dark:border-amber-900/50'
    }`}>
      {editing ? (
        <InterviewForm
          initial={{
            scheduled_at: format(new Date(interview.scheduled_at), "yyyy-MM-dd'T'HH:mm"),
            interview_type: interview.interview_type,
            format: interview.format ?? '',
            location_or_link: interview.location_or_link ?? '',
            prep_notes: interview.prep_notes ?? '',
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          isSubmitting={updateMutation.isPending}
        />
      ) : (
        <>
          {/* Header row */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-medium">
                  Round {round}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {INTERVIEW_TYPE_LABELS[interview.interview_type]}
                </Badge>
                {interview.format && (
                  <Badge variant="outline" className="text-xs">
                    {INTERVIEW_FORMAT_LABELS[interview.format]}
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <CalendarIcon className="text-muted-foreground h-3.5 w-3.5" />
                  {format(scheduledDate, 'EEE d MMM yyyy, h:mm a')}
                </span>
                {!isPastInterview && (
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(scheduledDate, { addSuffix: true })}
                  </span>
                )}
              </div>
              {interview.location_or_link && (
                <div className="mt-1 flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
                  <MapPin className="h-3 w-3" />
                  {interview.location_or_link.startsWith('http') ? (
                    <a
                      href={interview.location_or_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {interview.location_or_link}
                    </a>
                  ) : (
                    interview.location_or_link
                  )}
                </div>
              )}
            </div>

            {!readOnly && (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                  disabled={deletingId === interview.id}
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Outcome buttons */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Outcome:</span>
            <div className="flex gap-1.5">
              {INTERVIEW_OUTCOMES.map((o) => {
                const isActive = interview.outcome === o
                const styles = OUTCOME_STYLES[o]
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={!readOnly ? () => handleOutcome(o) : undefined}
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      readOnly ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      isActive
                        ? styles.active
                        : `border-input bg-background text-muted-foreground ${!readOnly ? styles.hover : ''}`
                    }`}
                  >
                    {OUTCOME_ICONS[o]}
                    {INTERVIEW_OUTCOME_LABELS[o]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prep notes */}
          {interview.prep_notes && (
            <div className="mb-3 rounded-md bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                Prep Notes
              </p>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <Markdown>{interview.prep_notes}</Markdown>
              </div>
            </div>
          )}

          {/* Debrief — visible by default once past, editable inline */}
          {isPastInterview && (
            <div className="border-t pt-3 mt-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Debrief
                </p>
                {!editingDebrief && !readOnly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground"
                    onClick={() => setEditingDebrief(true)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    {interview.debrief_notes ? 'Edit' : 'Add'}
                  </Button>
                )}
              </div>

              {editingDebrief ? (
                <div className="space-y-2">
                  <MarkdownEditor
                    value={debrief}
                    onChange={setDebrief}
                    placeholder="How did it go? What was asked? Any follow-up actions… (markdown supported)"
                    rows={5}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDebrief(interview.debrief_notes ?? '')
                        setEditingDebrief(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      disabled={updateMutation.isPending}
                      onClick={handleSaveDebrief}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : interview.debrief_notes ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <Markdown>{interview.debrief_notes}</Markdown>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">
                  No debrief yet. How did it go?
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Add from Question Bank ───────────────────────────────────────────────────

function AddFromBankDialog({
  open,
  onOpenChange,
  jobId,
  pinnedIds,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: number
  pinnedIds: number[]
}) {
  const { data: allQuestions = [] } = useInterviewQuestions({ scope: 'all' }, { enabled: open })
  const { pinMutation } = usePinnedQuestionActions(jobId)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')

  const available = allQuestions.filter(
    (q) => !pinnedIds.includes(q.id) && (q.job_id === null || q.job_id === jobId)
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

// ─── New Question ─────────────────────────────────────────────────────────────

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
        answer: form.answer || undefined,
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
              variant="success"
              disabled={!form.question || createAndPinMutation.isPending}
              onClick={handleSubmit}
            >
              {createAndPinMutation.isPending ? 'Saving…' : 'Save Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Relevant Questions Section ───────────────────────────────────────────────

function RelevantQuestionsSection({ jobId, readOnly }: { jobId: number; readOnly: boolean }) {
  const { data: questions = [] } = usePinnedQuestions(jobId)
  const { unpinMutation } = usePinnedQuestionActions(jobId)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [unpinningId, setUnpinningId] = useState<number | null>(null)

  const handleUnpin = (id: number) => {
    setUnpinningId(id)
    unpinMutation.mutate(id, { onSettled: () => setUnpinningId(null) })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <BookOpen className="h-4 w-4" />
          Relevant Questions
        </h3>
        {!readOnly && (
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={() => setShowNewDialog(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              New Question
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowBankDialog(true)}>
              <Library className="mr-1 h-3.5 w-3.5" />
              Add from Bank
            </Button>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <p className="text-muted-foreground/60 text-sm italic">
          No questions yet — add from your bank or create a new one.
        </p>
      ) : (
        <div className="space-y-4">
          {QUESTION_CATEGORIES.map((cat) => {
            const catQs = questions.filter((q) => q.category === cat)
            if (catQs.length === 0) return null
            return (
              <div key={cat}>
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                  {QUESTION_CATEGORY_LABELS[cat]}
                </p>
                <div className="space-y-2">
                  {catQs.map((q) => (
                    <div key={q.id} className="bg-muted/30 rounded-md border px-3 py-2 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium leading-snug">{q.question}</p>
                        {!readOnly && (
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive mt-0.5 shrink-0 disabled:opacity-40"
                            disabled={unpinningId === q.id}
                            onClick={() => handleUnpin(q.id)}
                            aria-label="Remove question"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
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

      <AddFromBankDialog
        open={showBankDialog}
        onOpenChange={setShowBankDialog}
        jobId={jobId}
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

interface InterviewsTabProps {
  jobId: number
  status: JobStatus
}

export function InterviewsTab({ jobId, status }: InterviewsTabProps) {
  const readOnly = TERMINAL_STATUSES.includes(status)
  const { data: interviews = [], isLoading } = useInterviews(jobId)
  const { createMutation } = useInterviewActions(jobId)
  const [showForm, setShowForm] = useState(false)

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
        format: form.format || undefined,
      },
      { onSuccess: () => setShowForm(false) }
    )
  }

  if (isLoading) return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>

  return (
    <div className="space-y-4">
      {/* Relevant Questions */}
      <RelevantQuestionsSection jobId={jobId} readOnly={readOnly} />

      <div className="border-t" />

      {/* Add button */}
      {!readOnly && !showForm && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Interview
          </Button>
        </div>
      )}

      {/* New interview form */}
      {showForm && (
        <div className="rounded-lg border p-4">
          <p className="mb-4 text-sm font-semibold">Schedule Interview</p>
          {lastRoundFailed && (
            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/10 dark:text-amber-400 mb-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              The last round was marked as failed. Are you sure you want to add another?
            </div>
          )}
          <InterviewForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isSubmitting={createMutation.isPending}
          />
        </div>
      )}

      {/* Interview list */}
      {interviews.length === 0 && !showForm ? (
        <EmptyTabState
          icon={CalendarIcon}
          title="No interviews yet"
          description="Schedule your first interview to start tracking prep and outcomes."
          actionLabel={!readOnly ? "Add Interview" : undefined}
          onAction={!readOnly ? () => setShowForm(true) : undefined}
        />
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

    </div>
  )
}
