import { useState, useRef } from 'react'
import { FileText, Plus, Pencil, Trash2, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { PageLoading } from '@/components/layout/PageLoading'
import { PageError } from '@/components/layout/PageError'
import { TypographyH1 } from '@/components/ui/typography'
import { useResumeTemplates, useResumeTemplate } from '@/hooks/useResumeTemplates'
import { useResumeTemplateActions } from '@/hooks/useResumeTemplateActions'
import { useResumeVariantActions } from '@/hooks/useResumeVariantActions'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { ResumeTemplate, ResumeVariant } from '@/types/resume'

// ── Template form ─────────────────────────────────────────────────────────────

interface TemplateFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  template?: ResumeTemplate
}

function TemplateFormDialog({ open, onOpenChange, template }: TemplateFormDialogProps) {
  const { createMutation, updateMutation } = useResumeTemplateActions()
  const [name, setName] = useState(template?.name ?? '')
  const [notes, setNotes] = useState(template?.notes ?? '')
  const [pdf, setPdf] = useState<File | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)
  const isEditing = !!template

  const isPending = createMutation.isPending || updateMutation.isPending

  function reset() {
    setName(template?.name ?? '')
    setNotes(template?.notes ?? '')
    setPdf(undefined)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    if (isEditing) {
      updateMutation.mutate(
        { id: template.id, data: { name: name.trim(), notes: notes.trim(), pdf } },
        { onSuccess: () => handleOpenChange(false) }
      )
    } else {
      createMutation.mutate(
        { name: name.trim(), notes: notes.trim() || undefined, pdf },
        { onSuccess: () => handleOpenChange(false) }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit template' : 'New resume template'}</DialogTitle>
          <DialogDescription>
            A template is your base resume. You'll create tailored variants from it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="t-name">Name</Label>
            <Input
              id="t-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Software Engineer Resume"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-notes">Notes (optional)</Label>
            <Textarea
              id="t-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes about this template…"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-pdf">
              {template?.pdf_filename ? 'Replace PDF (optional)' : 'Upload PDF (optional)'}
            </Label>
            {template?.pdf_filename && (
              <p className="text-muted-foreground text-xs">Current: {template.pdf_filename}</p>
            )}
            <Input
              id="t-pdf"
              type="file"
              accept="application/pdf"
              ref={fileRef}
              onChange={e => setPdf(e.target.files?.[0])}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Variant form ──────────────────────────────────────────────────────────────

interface VariantFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  templateId: number
  variant?: ResumeVariant
}

function VariantFormDialog({ open, onOpenChange, templateId, variant }: VariantFormDialogProps) {
  const { createMutation, updateMutation } = useResumeVariantActions(templateId)
  const [notes, setNotes] = useState(variant?.notes ?? '')
  const [pdf, setPdf] = useState<File | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)
  const isEditing = !!variant

  const isPending = createMutation.isPending || updateMutation.isPending

  function reset() {
    setNotes(variant?.notes ?? '')
    setPdf(undefined)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      updateMutation.mutate(
        { id: variant.id, data: { notes: notes.trim(), pdf } },
        { onSuccess: () => handleOpenChange(false) }
      )
    } else {
      createMutation.mutate(
        { notes: notes.trim() || undefined, pdf },
        { onSuccess: () => handleOpenChange(false) }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit variant' : 'New variant'}</DialogTitle>
          <DialogDescription>
            A variant is a tailored version of your base template for a specific application.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="v-notes">Notes (optional)</Label>
            <Textarea
              id="v-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Emphasised leadership experience for this role"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="v-pdf">
              {variant?.pdf_filename ? 'Replace PDF (optional)' : 'Upload PDF (optional)'}
            </Label>
            {variant?.pdf_filename && (
              <p className="text-muted-foreground text-xs">Current: {variant.pdf_filename}</p>
            )}
            <Input
              id="v-pdf"
              type="file"
              accept="application/pdf"
              ref={fileRef}
              onChange={e => setPdf(e.target.files?.[0])}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create variant'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Variant row ───────────────────────────────────────────────────────────────

function VariantRow({
  variant,
  templateId,
  onDeletingId,
  deletingId,
}: {
  variant: ResumeVariant
  templateId: number
  onDeletingId: (id: number | null) => void
  deletingId: number | null
}) {
  const { deleteMutation } = useResumeVariantActions(templateId)
  const [editOpen, setEditOpen] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)

  const MAX_JOB_BADGES = 2
  const visibleJobs = variant.linked_jobs.slice(0, MAX_JOB_BADGES)
  const hiddenCount = variant.linked_jobs.length - MAX_JOB_BADGES

  return (
    <>
      <div className="flex items-start gap-2 rounded-md border bg-background px-3 py-2.5 text-sm">
        {/* Notes — takes remaining space */}
        <div className="min-w-0 flex-1">
          {variant.notes ? (
            <div>
              <p className={notesExpanded ? 'text-sm' : 'line-clamp-2 text-sm sm:line-clamp-none'}>
                {variant.notes}
              </p>
              {variant.notes.length > 80 && (
                <button
                  className="mt-0.5 text-xs text-muted-foreground/70 underline sm:hidden"
                  onClick={() => setNotesExpanded(v => !v)}
                >
                  {notesExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          ) : variant.pdf_filename ? (
            <p className="text-muted-foreground text-sm">{variant.pdf_filename}</p>
          ) : (
            <p className="text-muted-foreground/50 text-xs italic">No notes</p>
          )}
        </div>

        {/* Job badges — w-36 matches header */}
        <div className="hidden w-36 shrink-0 items-center gap-1 sm:flex">
          {variant.linked_jobs.length === 0 ? (
            <span className="text-muted-foreground/50 text-xs">Not linked</span>
          ) : (
            <>
              {visibleJobs.map(j => (
                <Badge key={j.id} variant="secondary" className="text-xs font-normal">
                  {j.company_name}
                </Badge>
              ))}
              {hiddenCount > 0 && (
                <span className="text-muted-foreground text-xs">+{hiddenCount}</span>
              )}
            </>
          )}
        </div>

        {/* PDF chip — w-14 matches header */}
        <div className="hidden w-14 shrink-0 sm:block">
          {variant.pdf_filename ? (
            <Badge className="border-emerald-200 bg-emerald-100 text-xs font-normal text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              PDF
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground/50 text-xs font-normal">
              No PDF
            </Badge>
          )}
        </div>

        {/* Actions — w-20 matches header */}
        <div className="flex w-20 shrink-0 items-center justify-end gap-0.5">
          {variant.pdf_url && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
              <a href={variant.pdf_url} target="_blank" rel="noopener noreferrer" title="View PDF">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                disabled={deletingId === variant.id}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete variant?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the variant permanently. Any job that references it will have its
                  resume link cleared.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDeletingId(variant.id)
                    deleteMutation.mutate(variant.id, { onSettled: () => onDeletingId(null) })
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <VariantFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        templateId={templateId}
        variant={variant}
      />
    </>
  )
}

// ── Template card ─────────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: ResumeTemplate }) {
  const [expanded, setExpanded] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [addVariantOpen, setAddVariantOpen] = useState(false)
  const [deletingVariantId, setDeletingVariantId] = useState<number | null>(null)
  const { deleteMutation } = useResumeTemplateActions()

  const { data: full } = useResumeTemplate(expanded ? template.id : undefined)

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            {/* Expand toggle — chevron + name only */}
            <button
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? (
                <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
              )}
              <p className="truncate font-medium leading-snug">{template.name}</p>
            </button>

            {/* Badges + actions */}
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge variant="secondary" className="text-xs font-normal">
                {template.variant_count} {template.variant_count === 1 ? 'variant' : 'variants'}
              </Badge>
              {template.pdf_filename && (
                <Badge className="border-emerald-200 bg-emerald-100 text-xs font-normal text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  PDF
                </Badge>
              )}
              {template.pdf_url && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                  <a href={template.pdf_url} target="_blank" rel="noopener noreferrer" title="View base PDF">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete template?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This deletes the template and all its variants permanently.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(template.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Notes — separate row so "Show more" can be a proper button */}
          {template.notes && (
            <div className="pl-6">
              <p className={notesExpanded ? 'text-muted-foreground text-xs' : 'text-muted-foreground line-clamp-2 text-xs sm:line-clamp-none'}>
                {template.notes}
              </p>
              {template.notes.length > 80 && (
                <button
                  className="mt-0.5 text-xs text-muted-foreground/70 underline sm:hidden"
                  onClick={() => setNotesExpanded(v => !v)}
                >
                  {notesExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
        </CardHeader>

        {expanded && (
          <CardContent className="pt-0">
            {full ? (
              <div className="space-y-2">
                {/* Column headers — hidden on mobile */}
                {full.variants.length > 0 && (
                  <div className="hidden items-center gap-2 px-3 sm:flex">
                    <span className="flex-1" />
                    <span className="w-36 text-xs font-medium text-muted-foreground">Linked to</span>
                    <span className="w-14 text-xs font-medium text-muted-foreground">File</span>
                    <span className="w-20" />
                  </div>
                )}

                {full.variants.length === 0 ? (
                  <p className="text-muted-foreground py-2 text-sm">
                    No variants yet — add one below.
                  </p>
                ) : (
                  full.variants.map(v => (
                    <VariantRow
                      key={v.id}
                      variant={v}
                      templateId={template.id}
                      deletingId={deletingVariantId}
                      onDeletingId={setDeletingVariantId}
                    />
                  ))
                )}

                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setAddVariantOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add variant
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground py-2 text-sm">Loading…</p>
            )}
          </CardContent>
        )}
      </Card>

      <TemplateFormDialog open={editOpen} onOpenChange={setEditOpen} template={template} />
      <VariantFormDialog
        open={addVariantOpen}
        onOpenChange={setAddVariantOpen}
        templateId={template.id}
      />
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResumePage() {
  usePageTitle('Resume Library')
  const { data: templates, isLoading, isError } = useResumeTemplates()
  const [createOpen, setCreateOpen] = useState(false)

  if (isLoading) return <PageLoading />
  if (isError) return <PageError />

  return (
    <div className="page-container space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TypographyH1 className="text-2xl font-bold tracking-tight">Resume Library</TypographyH1>
          <p className="text-muted-foreground text-sm">
            Manage your base resumes and tailored variants for each application.
          </p>
        </div>
        <Button
          variant="success"
          size="sm"
          className="w-full min-w-36 sm:w-auto"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New template
        </Button>
      </div>

      {templates && templates.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <FileText className="h-6 w-6" />
            </div>
            <p className="font-semibold">No resume templates yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Create a template for your base resume, then add tailored variants for each
              application.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates?.map(t => <TemplateCard key={t.id} template={t} />)}
        </div>
      )}

      <TemplateFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
