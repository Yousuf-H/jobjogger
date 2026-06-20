import { useState, useRef } from 'react'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  Link2,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageLoading } from '@/components/layout/PageLoading'
import { PageError } from '@/components/layout/PageError'
import { useResumeTemplate } from '@/hooks/useResumeTemplates'
import { useResumeTemplateActions } from '@/hooks/useResumeTemplateActions'
import { useResumeVariantActions } from '@/hooks/useResumeVariantActions'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/utils'
import type { ResumeTemplate, ResumeVariant } from '@/types/resume'

// Same palette as list page — deterministic by template id
const TEMPLATE_COLORS = [
  'bg-avatar-1/15 text-avatar-1',
  'bg-avatar-2/15 text-avatar-2',
  'bg-avatar-3/15 text-avatar-3',
  'bg-avatar-4/15 text-avatar-4',
  'bg-avatar-5/15 text-avatar-5',
  'bg-avatar-6/15 text-avatar-6',
]
const templateColor = (id: number) => TEMPLATE_COLORS[id % TEMPLATE_COLORS.length]

function variantLabel(variant: ResumeVariant): string {
  const primary = variant.linked_jobs[0]
  return primary ? `Tailored for ${primary.company_name}` : 'General variant'
}

// ── Edit-template dialog ──────────────────────────────────────────────────────

function TemplateFormDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  template: ResumeTemplate
}) {
  const { updateMutation } = useResumeTemplateActions()
  const [name, setName] = useState(template.name)
  const [notes, setNotes] = useState(template.notes ?? '')
  const [pdf, setPdf] = useState<File | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setName(template.name)
    setNotes(template.notes ?? '')
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
    updateMutation.mutate(
      { id: template.id, data: { name: name.trim(), notes: notes.trim(), pdf } },
      { onSuccess: () => handleOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit template</DialogTitle>
          <DialogDescription>Update your base resume template.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="t-name">Name</Label>
            <Input
              id="t-name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-notes">Notes (optional)</Label>
            <Textarea
              id="t-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-pdf">
              {template.pdf_filename ? 'Replace PDF (optional)' : 'Upload PDF (optional)'}
            </Label>
            {template.pdf_filename && (
              <p className="text-xs text-muted-foreground">Current: {template.pdf_filename}</p>
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
            <Button type="submit" disabled={!name.trim() || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Add / edit variant dialog ─────────────────────────────────────────────────

function VariantFormDialog({
  open,
  onOpenChange,
  templateId,
  variant,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  templateId: number
  variant?: ResumeVariant
}) {
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
              <p className="text-xs text-muted-foreground">Current: {variant.pdf_filename}</p>
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

// ── Variant timeline entry ────────────────────────────────────────────────────

function VariantEntry({
  variant,
  templateId,
  deletingId,
  onDeletingId,
}: {
  variant: ResumeVariant
  templateId: number
  deletingId: number | null
  onDeletingId: (id: number | null) => void
}) {
  const { deleteMutation } = useResumeVariantActions(templateId)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="relative flex gap-[14px]">
        {/* Dot — border-background creates the line-passthrough cutout */}
        <div
          className={cn(
            'relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 border-background',
            variant.pdf_filename
              ? 'bg-green-100 dark:bg-green-950/40'
              : 'bg-muted'
          )}
        >
          {variant.pdf_filename ? (
            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>

        {/* Card */}
        <div className="mb-[10px] flex-1 rounded-[10px] border border-border bg-card p-[12px_14px]">
          {/* Header row */}
          <div className="flex items-start justify-between gap-[8px]">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[6px]">
              <span className="text-[12px] font-semibold text-foreground">
                {variantLabel(variant)}
              </span>
              {variant.pdf_url ? (
                <a
                  href={variant.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[3px] rounded-full border border-blue-200 bg-blue-50 px-[7px] py-[1px] text-[10px] font-medium text-blue-600 transition-opacity hover:opacity-80 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                >
                  <FileText className="h-[9px] w-[9px]" />
                  PDF
                  <ExternalLink className="h-[8px] w-[8px]" />
                </a>
              ) : (
                <span className="text-[10px] text-muted-foreground/50">No PDF</span>
              )}
            </div>

            {/* ⋯ menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] text-muted-foreground transition-colors hover:bg-muted"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={deletingId === variant.id}
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {variant.notes && (
            <p className="mt-[4px] text-[11px] leading-[1.5] text-muted-foreground">
              {variant.notes}
            </p>
          )}

          {/* Linked jobs */}
          {variant.linked_jobs.length > 0 && (
            <div className="mt-[6px] flex flex-wrap gap-[4px]">
              {variant.linked_jobs.map(j => (
                <span
                  key={j.id}
                  className="inline-flex items-center gap-[3px] rounded-full border border-green-200 bg-green-50 px-[7px] py-[1px] text-[10px] font-medium text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                >
                  <Link2 className="h-[9px] w-[9px]" />
                  {j.company_name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <VariantFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        templateId={templateId}
        variant={variant}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the variant permanently. Any job that references it will have its resume
              link cleared.
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
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const templateId = id ? Number(id) : undefined

  const { data: template, isLoading, isError } = useResumeTemplate(templateId)
  const { deleteMutation } = useResumeTemplateActions()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addVariantOpen, setAddVariantOpen] = useState(false)
  const [deletingVariantId, setDeletingVariantId] = useState<number | null>(null)

  usePageTitle(template?.name ?? 'Resume')

  if (isLoading) return <PageLoading />
  if (isError || !template) return <PageError />

  return (
    <div className="space-y-[14px]">
      {/* Back button — above the card, matching job detail pattern */}
      <button
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/resume'))}
        className="flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-[14px] w-[14px]" />
        Back
      </button>

      {/* Header card */}
      <div className="rounded-[10px] border border-border bg-card p-[16px_18px]">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-[12px]">
          {/* Identity */}
          <div className="flex items-start gap-[12px]">
            <div
              className={cn(
                'flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[9px] text-[15px] font-semibold',
                templateColor(template.id)
              )}
            >
              {template.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-[16px] font-semibold leading-snug text-foreground">
                {template.name}
              </h1>
              <p className="mt-[2px] text-[12px] leading-[1.5] text-muted-foreground">
                {template.notes ?? <span className="italic">No description yet.</span>}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-[8px]">
            {template.pdf_url && (
              <a
                href={template.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[4px] rounded-full border border-blue-200 bg-blue-50 px-[10px] py-[5px] text-[11px] font-medium text-blue-600 transition-opacity hover:opacity-80 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
              >
                <FileText className="h-[11px] w-[11px]" />
                Base PDF
                <ExternalLink className="h-[9px] w-[9px]" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-[7px] border border-border bg-secondary px-[12px] py-[7px] text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Edit base resume
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Version history */}
      <div className="rounded-[10px] border border-border bg-card p-[16px_18px]">
        <h2 className="mb-[14px] text-[13px] font-semibold text-foreground">
          Variants
          <span className="ml-[6px] text-[12px] font-normal text-muted-foreground">
            {template.variants.length}
          </span>
        </h2>

        <div className="relative">
          {/* Connecting line — spans from center of first dot to center of last (Add) dot */}
          <div className="absolute left-[14px] top-[15px] bottom-[15px] w-[1.5px] bg-border" />

          {template.variants.length === 0 && (
            <p className="mb-[12px] pl-[44px] text-[13px] text-muted-foreground">
              No variants yet — add one below.
            </p>
          )}

          {template.variants.map(v => (
            <VariantEntry
              key={v.id}
              variant={v}
              templateId={template.id}
              deletingId={deletingVariantId}
              onDeletingId={setDeletingVariantId}
            />
          ))}

          {/* Add variant — dashed dot entry */}
          <button
            type="button"
            onClick={() => setAddVariantOpen(true)}
            className="relative flex items-center gap-[14px] text-left"
          >
            <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-background transition-colors hover:border-foreground/30">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Add a new tailored variant
            </span>
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <TemplateFormDialog open={editOpen} onOpenChange={setEditOpen} template={template} />
      <VariantFormDialog
        open={addVariantOpen}
        onOpenChange={setAddVariantOpen}
        templateId={template.id}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the template and all its variants permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteMutation.mutate(template.id, {
                  onSuccess: () => navigate('/resume'),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
