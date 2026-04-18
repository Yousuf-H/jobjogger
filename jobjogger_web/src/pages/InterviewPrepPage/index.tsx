import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TypographyH1 } from '@/components/ui/typography'
import { useJobs } from '@/hooks/useJobs'
import { useOrganisations } from '@/hooks/useOrganisations'
import {
  useInterviewQuestionActions,
  useInterviewQuestions,
} from '@/hooks/useInterviews'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  QUESTION_CATEGORIES,
  QUESTION_CATEGORY_LABELS,
  type InterviewQuestion,
  type QuestionCategory,
} from '@/types/interview'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

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

  const set = <K extends keyof QuestionFormState>(
    key: K,
    value: QuestionFormState[K]
  ) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category *</Label>
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

        <div className="space-y-1.5">
          <Label>Scope *</Label>
          <Select
            value={form.scope}
            onValueChange={(v) =>
              set('scope', v as QuestionFormState['scope'])
            }
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

      {form.scope === 'org' && (
        <div className="space-y-1.5">
          <Label>Organisation *</Label>
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

      {form.scope === 'job' && (
        <div className="space-y-1.5">
          <Label>Job *</Label>
          <Select
            value={form.job_id}
            onValueChange={(v) => set('job_id', v)}
          >
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

      <div className="space-y-1.5">
        <Label>Question *</Label>
        <Textarea
          placeholder="e.g. Tell me about a time you handled a difficult situation."
          rows={2}
          value={form.question}
          onChange={(e) => set('question', e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Your Answer</Label>
        <Textarea
          placeholder="Write your prepared answer here…"
          rows={4}
          value={form.answer}
          onChange={(e) => set('answer', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => set('is_favourite', !form.is_favourite)}
          className="flex items-center gap-1.5 text-sm"
        >
          <Star
            className={`h-4 w-4 ${form.is_favourite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
          />
          <span className="text-muted-foreground">Mark as favourite</span>
        </button>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="success"
          disabled={
            isSubmitting ||
            !form.question ||
            (form.scope === 'org' && !form.organisation_id) ||
            (form.scope === 'job' && !form.job_id)
          }
          onClick={() => onSubmit(form)}
        >
          {isSubmitting ? 'Saving…' : 'Save Question'}
        </Button>
      </div>
    </div>
  )
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  onEdit,
  onDelete,
  isDeleting,
}: {
  question: InterviewQuestion
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {question.is_favourite && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
            <p className="text-sm font-medium leading-snug">{question.question}</p>
          </div>
          {question.answer && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs mt-1 transition-colors"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {expanded ? 'Hide answer' : 'Show answer'}
            </button>
          )}
          {expanded && question.answer && (
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-3">
              {question.answer}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
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

  const { data: jobs = [] } = useJobs()
  const { data: orgs = [] } = useOrganisations()
  const { createMutation, updateMutation, deleteMutation } = useInterviewQuestionActions()

  const queryParams = {
    scope: scopeTab,
    job_id: scopeTab === 'job' && selectedJobId ? Number(selectedJobId) : undefined,
    organisation_id: scopeTab === 'org' && selectedOrgId ? Number(selectedOrgId) : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  }

  const { data: questions = [], isLoading, error } = useInterviewQuestions(queryParams)

  const handleCreate = (form: QuestionFormState) => {
    createMutation.mutate(
      {
        question: form.question,
        answer: form.answer || undefined,
        category: form.category,
        is_favourite: form.is_favourite,
        job_id: form.scope === 'job' ? Number(form.job_id) : undefined,
        organisation_id: form.scope === 'org' ? Number(form.organisation_id) : undefined,
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
          answer: form.answer || undefined,
          category: form.category,
          is_favourite: form.is_favourite,
          job_id: form.scope === 'job' ? Number(form.job_id) : undefined,
          organisation_id: form.scope === 'org' ? Number(form.organisation_id) : undefined,
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
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TypographyH1 className="text-2xl font-bold tracking-tight">
            Interview Prep
          </TypographyH1>
          <p className="text-muted-foreground text-sm">
            Build your question bank across jobs, organisations, and personal prep.
          </p>
        </div>
        <Button
          variant="success"
          size="sm"
          className="min-w-36 w-full sm:w-auto"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Question
        </Button>
      </div>

      {/* Scope tabs + filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          {/* Scope tabs */}
          <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
            {(['personal', 'org', 'job'] as ScopeTab[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScopeTab(s)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  scopeTab === s
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'personal' ? 'Personal' : s === 'org' ? 'Organisation' : 'Job'}
              </button>
            ))}
          </div>

          {/* Scope selectors */}
          {scopeTab === 'job' && (
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
          )}

          {scopeTab === 'org' && (
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
          )}

          {/* Category filter */}
          {!scopeNeedsSelection && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {QUESTION_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    categoryFilter === c
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {QUESTION_CATEGORY_LABELS[c]}
                </button>
              ))}
              <span className="text-muted-foreground ml-auto text-xs self-center">
                {questions.length} {questions.length === 1 ? 'question' : 'questions'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {scopeNeedsSelection ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="text-muted-foreground/40 mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            Select a {scopeTab === 'job' ? 'job' : 'organisation'} above to view its questions.
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
        <div className="space-y-4">
          {QUESTION_CATEGORIES.filter(
            (c) => categoryFilter === 'all' || categoryFilter === c
          ).map((cat) => {
            const catQuestions = questions.filter((q) => q.category === cat)
            if (catQuestions.length === 0) return null
            return (
              <div key={cat}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold">
                    {QUESTION_CATEGORY_LABELS[cat]}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {catQuestions.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {catQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      onEdit={() => setEditingQuestion(q)}
                      onDelete={() => handleDelete(q.id)}
                      isDeleting={deletingId === q.id}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Question</DialogTitle>
          </DialogHeader>
          <QuestionForm
            initial={{ scope: scopeTab, job_id: selectedJobId, organisation_id: selectedOrgId }}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            isSubmitting={createMutation.isPending}
            jobs={jobs}
            orgs={orgs}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
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
                job_id: editingQuestion.job_id ? String(editingQuestion.job_id) : '',
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
