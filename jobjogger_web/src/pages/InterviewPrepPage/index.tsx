import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Markdown } from '@/components/ui/markdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import {
  useInterviewQuestionActions,
  useInterviewQuestions,
} from '@/hooks/useInterviews'
import { useJobs } from '@/hooks/useJobs'
import { useOrganisations } from '@/hooks/useOrganisations'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/utils'
import {
  QUESTION_CATEGORIES,
  QUESTION_CATEGORY_LABELS,
  type InterviewQuestion,
  type QuestionCategory,
} from '@/types/interview'
import { ALL_JOB_STATUSES } from '@/types/job'
import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react'
import {
  BookOpen,
  CornerDownLeft,
  Edit3,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

// ─── Category label colours (text only — cards stay neutral) ──────────────────

const CATEGORY_LABEL_COLOR: Record<QuestionCategory, string> = {
  behavioural: 'text-qcat-behavioural-fg',
  technical: 'text-qcat-technical-fg',
  questions_to_ask: 'text-qcat-ask-fg',
}


// ─── Question Form ────────────────────────────────────────────────────────────

interface QuestionFormState {
  question: string
  answer: string
  category: QuestionCategory
  is_favourite: boolean
  scope: 'personal' | 'job' | 'org'
  job_id: string
  organisation_id: string
}

const DEFAULT_FORM: QuestionFormState = {
  question: '',
  answer: '',
  category: 'behavioural',
  is_favourite: false,
  scope: 'personal',
  job_id: '',
  organisation_id: '',
}

interface QuestionFormProps {
  initial?: Partial<QuestionFormState>
  onSubmit: (data: QuestionFormState) => void
  onCancel: () => void
  isSubmitting: boolean
  jobs: { id: number; job_title: string; company_name: string }[]
  orgs: { id: number; name: string }[]
}

function QuestionForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  jobs,
  orgs,
}: QuestionFormProps) {
  const [form, setForm] = useState<QuestionFormState>({
    ...DEFAULT_FORM,
    ...initial,
  })
  const [answerView, setAnswerView] = useState<'write' | 'preview'>('write')

  const set = <K extends keyof QuestionFormState>(
    key: K,
    value: QuestionFormState[K]
  ) => setForm((f) => ({ ...f, [key]: value }))

  const canSave =
    !!form.question &&
    !(form.scope === 'org' && !form.organisation_id) &&
    !(form.scope === 'job' && !form.job_id)

  return (
    <div className="space-y-4">
      {/* Category + Scope */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">
            Category *
          </label>
          <Select
            value={form.category}
            onValueChange={(v) => set('category', v as QuestionCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {QUESTION_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">
            Scope *
          </label>
          <Select
            value={form.scope}
            onValueChange={(v) => set('scope', v as QuestionFormState['scope'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal (reusable)</SelectItem>
              <SelectItem value="org">Organisation</SelectItem>
              <SelectItem value="job">Specific Job</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Org selector */}
      {form.scope === 'org' && (
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">
            Organisation *
          </label>
          <Select
            value={form.organisation_id}
            onValueChange={(v) => set('organisation_id', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select organisation" />
            </SelectTrigger>
            <SelectContent>
              {orgs.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Job selector */}
      {form.scope === 'job' && (
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">
            Job *
          </label>
          <Select value={form.job_id} onValueChange={(v) => set('job_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select job" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={String(j.id)}>
                  {j.job_title} — {j.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Question */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground mb-[5px]">
          Question *
        </label>
        <Textarea
          placeholder="e.g. Tell me about a time you handled a difficult situation."
          rows={2}
          value={form.question}
          onChange={(e) => set('question', e.target.value)}
        />
      </div>

      {/* Answer with Write/Preview toggle */}
      <div>
        <div className="flex items-center justify-between mb-[5px]">
          <label className="text-[11px] font-medium text-muted-foreground">
            Your Answer
          </label>
          <div className="flex items-center gap-[3px] rounded-[7px] bg-muted p-[3px]">
            {(['write', 'preview'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAnswerView(v)}
                className={cn(
                  'flex items-center gap-[5px] rounded-[5px] px-[12px] py-[4px] text-[12px] transition-colors',
                  v === answerView
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

        {answerView === 'write' ? (
          <Textarea
            placeholder="Write your prepared answer here… (markdown supported)"
            rows={4}
            value={form.answer}
            onChange={(e) => set('answer', e.target.value)}
            className="font-mono text-sm resize-y"
          />
        ) : form.answer ? (
          <div className="min-h-[100px] rounded-md border border-border px-3 py-2">
            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-[13px] [&_p]:text-foreground/80 [&_p]:leading-[1.7] [&_li]:text-[13px] [&_li]:text-foreground/80 [&_li]:leading-[1.7] [&_ul]:pl-[16px] [&_ol]:pl-[16px]">
              <Markdown>{form.answer}</Markdown>
            </div>
          </div>
        ) : (
          <div className="min-h-[100px] rounded-md border border-border px-3 py-2 flex items-center">
            <p className="text-[12px] italic text-muted-foreground">Nothing to preview yet.</p>
          </div>
        )}
      </div>

      {/* Favourite */}
      <button
        type="button"
        onClick={() => set('is_favourite', !form.is_favourite)}
        className="flex items-center gap-[8px] text-[13px]"
      >
        {form.is_favourite ? (
          <IconBookmarkFilled className="h-4 w-4 text-brand" />
        ) : (
          <IconBookmark className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-muted-foreground">Mark as favourite</span>
      </button>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[7px] px-[14px] py-[7px] text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isSubmitting || !canSave}
          onClick={() => onSubmit(form)}
          className="rounded-[7px] bg-[#2563EB] px-[14px] py-[7px] text-[12px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Save Question'}
        </button>
      </div>
    </div>
  )
}

// ─── Flash Card ───────────────────────────────────────────────────────────────

function FlashCard({
  question,
  onEdit,
  onDelete,
  onToggleFavourite,
  isDeleting,
}: {
  question: InterviewQuestion
  onEdit: () => void
  onDelete: () => void
  onToggleFavourite: () => void
  isDeleting: boolean
}) {
  const [flipped, setFlipped] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <div
        className={cn(
          'flex min-h-[160px] flex-col rounded-[10px] border cursor-pointer select-none transition-colors',
          flipped ? 'bg-muted border-border' : 'bg-card border-border'
        )}
        onClick={() => setFlipped((v) => !v)}
      >
        {!flipped ? (
          <>
            {/* Front: header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <span
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.4px]',
                  CATEGORY_LABEL_COLOR[question.category]
                )}
              >
                {QUESTION_CATEGORY_LABELS[question.category]}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavourite()
                }}
                className="ml-2 shrink-0 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
              >
                {question.is_favourite ? (
                  <IconBookmarkFilled className="h-[14px] w-[14px] text-brand" />
                ) : (
                  <IconBookmark className="h-[14px] w-[14px]" />
                )}
              </button>
            </div>

            {/* Front: question — flex-grow so footer stays at bottom */}
            <div className="flex-1 px-4 pb-3">
              <p className="text-[16px] font-semibold leading-snug text-foreground">
                {question.question}
              </p>
            </div>

            {/* Front: reveal footer */}
            <div className="flex items-center gap-1.5 px-4 pb-4 text-[12px] font-medium text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              Reveal answer
            </div>
          </>
        ) : (
          <>
            {/* Back: header */}
            <div className="flex items-start justify-between p-4 pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.4px] text-muted-foreground">
                Answer
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="-mr-1 -mt-1 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmDelete(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Back: answer text */}
            <div className="flex-1 px-4 pb-3">
              {question.answer ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:text-[13px] [&_p]:text-muted-foreground [&_p]:leading-[1.7] [&_li]:text-[13px] [&_li]:text-muted-foreground [&_li]:leading-[1.7] [&_ul]:pl-[16px] [&_ol]:pl-[16px]">
                  <Markdown>{question.answer}</Markdown>
                </div>
              ) : (
                <p className="text-[13px] italic text-muted-foreground/50">
                  No answer written yet.
                </p>
              )}
            </div>

            {/* Back: return footer */}
            <div
              className="flex items-center gap-1.5 px-4 pb-4 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                setFlipped(false)
              }}
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
              Back to question
            </div>
          </>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question from your bank. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDelete(false)
                onDelete()
              }}
              disabled={isDeleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ScopeTab = 'personal' | 'org' | 'job'

export default function InterviewPrepPage() {
  usePageTitle('Interview Prep')

  const [scopeTab, setScopeTab] = useState<ScopeTab>('personal')
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategory | 'all'>('all')
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: jobs = [] } = useJobs({ status: ALL_JOB_STATUSES })
  const { data: orgs = [] } = useOrganisations()
  const { createMutation, updateMutation, deleteMutation } =
    useInterviewQuestionActions()

  const queryParams = {
    scope: scopeTab,
    job_id:
      scopeTab === 'job' && selectedJobId ? Number(selectedJobId) : undefined,
    organisation_id:
      scopeTab === 'org' && selectedOrgId ? Number(selectedOrgId) : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  }

  const {
    data: questions = [],
    isLoading,
    error,
  } = useInterviewQuestions(queryParams)

  const handleCreate = (form: QuestionFormState) => {
    createMutation.mutate(
      {
        question: form.question,
        answer: form.answer || null,
        category: form.category,
        is_favourite: form.is_favourite,
        job_id: form.scope === 'job' ? Number(form.job_id) : null,
        organisation_id:
          form.scope === 'org' ? Number(form.organisation_id) : null,
      },
      { onSuccess: () => setCreateOpen(false) }
    )
  }

  const handleUpdate = (form: QuestionFormState) => {
    if (!editingQuestion) return
    updateMutation.mutate(
      {
        id: editingQuestion.id,
        data: {
          question: form.question,
          answer: form.answer || null,
          category: form.category,
          is_favourite: form.is_favourite,
          job_id: form.scope === 'job' ? Number(form.job_id) : null,
          organisation_id:
            form.scope === 'org' ? Number(form.organisation_id) : null,
        },
      },
      { onSuccess: () => setEditingQuestion(null) }
    )
  }

  const handleDelete = (id: number) => {
    setDeletingId(id)
    deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) })
  }

  const scopeNeedsSelection =
    (scopeTab === 'job' && !selectedJobId) ||
    (scopeTab === 'org' && !selectedOrgId)

  return (
    <div className="space-y-[14px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">
            Interview prep
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Tap a card to reveal your answer.
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-[8px] bg-[#2563EB] px-[14px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-blue-700"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New question
        </button>
      </div>

      {/* Toolbar card */}
      <div className="rounded-[10px] border border-border bg-card p-[12px_14px]">
        {/* Scope segmented control */}
        <div className="bg-muted mb-[12px] flex w-fit gap-1 rounded-lg p-1">
          {(['personal', 'org', 'job'] as ScopeTab[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScopeTab(s)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                scopeTab === s
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s === 'personal'
                ? 'Personal'
                : s === 'org'
                  ? 'Organisation'
                  : 'Job'}
            </button>
          ))}
        </div>

        {/* Job selector */}
        {scopeTab === 'job' && (
          <div className="mb-[12px]">
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select a job…" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    {j.job_title} — {j.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Org selector */}
        {scopeTab === 'org' && (
          <div className="mb-[12px]">
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select an organisation…" />
              </SelectTrigger>
              <SelectContent>
                {orgs.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Category underline tabs + count */}
        {!scopeNeedsSelection && (
          <div className="flex items-center border-t border-border">
            {(['all', ...QUESTION_CATEGORIES] as const).map((c) => {
              const isActive = categoryFilter === c
              const label = c === 'all' ? 'All' : QUESTION_CATEGORY_LABELS[c]
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(c)}
                  className={cn(
                    '-mt-px mr-[18px] shrink-0 border-t-2 pt-[8px] text-[12px] font-medium transition-colors',
                    isActive
                      ? 'border-[#2563EB] text-[#2563EB] dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              )
            })}
            <span className="ml-auto pt-[8px] text-[12px] text-muted-foreground">
              {questions.length}{' '}
              {questions.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {scopeNeedsSelection ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="text-muted-foreground/40 mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            Select a {scopeTab === 'job' ? 'job' : 'organisation'} above to
            view its questions.
          </p>
        </div>
      ) : isLoading ? (
        <PageLoading />
      ) : error ? (
        <PageError message={error.message} />
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="text-muted-foreground/40 mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            No questions yet. Add your first one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((q) => (
            <FlashCard
              key={q.id}
              question={q}
              onEdit={() => setEditingQuestion(q)}
              onDelete={() => handleDelete(q.id)}
              onToggleFavourite={() =>
                updateMutation.mutate({
                  id: q.id,
                  data: { is_favourite: !q.is_favourite },
                })
              }
              isDeleting={deletingId === q.id}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Question</DialogTitle>
            <DialogDescription className="sr-only">
              Add a new question to your interview question bank.
            </DialogDescription>
          </DialogHeader>
          <QuestionForm
            initial={{
              scope: scopeTab,
              job_id: selectedJobId,
              organisation_id: selectedOrgId,
            }}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isSubmitting={createMutation.isPending}
            jobs={jobs}
            orgs={orgs}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editingQuestion}
        onOpenChange={() => setEditingQuestion(null)}
      >
        <DialogContent className="max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription className="sr-only">
              Edit the question text, category, or your prepared answer.
            </DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <QuestionForm
              initial={{
                question: editingQuestion.question,
                answer: editingQuestion.answer ?? '',
                category: editingQuestion.category,
                is_favourite: editingQuestion.is_favourite,
                scope: editingQuestion.job_id
                  ? 'job'
                  : editingQuestion.organisation_id
                    ? 'org'
                    : 'personal',
                job_id: editingQuestion.job_id
                  ? String(editingQuestion.job_id)
                  : '',
                organisation_id: editingQuestion.organisation_id
                  ? String(editingQuestion.organisation_id)
                  : '',
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingQuestion(null)}
              isSubmitting={updateMutation.isPending}
              jobs={jobs}
              orgs={orgs}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
