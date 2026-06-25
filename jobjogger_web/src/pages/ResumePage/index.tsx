import { useState, useRef, useMemo } from 'react'
import { FileText, Plus } from 'lucide-react'
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
import { PageLoading } from '@/components/layout/PageLoading'
import { PageError } from '@/components/layout/PageError'
import { useResumeTemplates } from '@/hooks/useResumeTemplates'
import { useAllResumeVariants } from '@/hooks/useResumeVariants'
import { useResumeTemplateActions } from '@/hooks/useResumeTemplateActions'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import type { ResumeTemplate } from '@/types/resume'

// Deterministic per-template colour, same avatar palette used across the app
const TEMPLATE_COLORS = [
  'bg-avatar-1/15 text-avatar-1',
  'bg-avatar-2/15 text-avatar-2',
  'bg-avatar-3/15 text-avatar-3',
  'bg-avatar-4/15 text-avatar-4',
  'bg-avatar-5/15 text-avatar-5',
  'bg-avatar-6/15 text-avatar-6',
]
const templateColor = (id: number) => TEMPLATE_COLORS[id % TEMPLATE_COLORS.length]
const companyColor = (name: string) => TEMPLATE_COLORS[name.charCodeAt(0) % TEMPLATE_COLORS.length]

// ── Create-template dialog ────────────────────────────────────────────────────

function TemplateCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { createMutation } = useResumeTemplateActions()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [pdf, setPdf] = useState<File | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setName('')
    setNotes('')
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
    createMutation.mutate(
      { name: name.trim(), notes: notes.trim() || undefined, pdf },
      { onSuccess: () => handleOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New resume template</DialogTitle>
          <DialogDescription className="sr-only">
            Create a base resume template. You can add tailored variants from it later.
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
            <Label htmlFor="t-pdf">Upload PDF (optional)</Label>
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
            <Button type="submit" disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Template grid card ────────────────────────────────────────────────────────

function TemplateCard({
  template,
  companies,
}: {
  template: ResumeTemplate
  companies: string[]
}) {
  const navigate = useNavigate()
  const MAX_AVATARS = 3
  const visible = companies.slice(0, MAX_AVATARS)
  const overflow = companies.length - MAX_AVATARS

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/resume/${template.id}`)}
      onKeyDown={e => e.key === 'Enter' && navigate(`/resume/${template.id}`)}
      className="flex cursor-pointer flex-col rounded-[10px] border border-border bg-card p-[14px] transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Header row */}
      <div className="mb-[8px] flex items-center gap-[8px]">
        <div
          className={cn(
            'flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[7px] text-[12px] font-semibold',
            templateColor(template.id)
          )}
        >
          {template.name.charAt(0).toUpperCase()}
        </div>
        <span className="truncate text-[13px] font-semibold text-foreground">
          {template.name}
        </span>
      </div>

      {/* Description — always rendered to keep card heights consistent */}
      <p className="mb-[10px] line-clamp-2 text-[11px] leading-[1.5] text-muted-foreground">
        {template.notes ? template.notes : <span className="italic">No description yet.</span>}
      </p>

      {/* Footer row — mt-auto pins it to the bottom of the card */}
      <div className="mt-auto flex items-center justify-between">
        {/* Company avatar stack */}
        {visible.length > 0 ? (
          <div className="flex items-center">
            {visible.map((name, i) => (
              <div
                key={name}
                className={cn(
                  'flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-card text-[7px] font-semibold',
                  i > 0 && '-ml-[6px]',
                  companyColor(name)
                )}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            ))}
            {overflow > 0 && (
              <div className="-ml-[6px] flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-card bg-muted text-[7px] font-medium text-muted-foreground">
                +{overflow}
              </div>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground/40">No variants</span>
        )}

        <span className="text-[10px] text-muted-foreground">
          {template.variant_count}{' '}
          {template.variant_count === 1 ? 'version' : 'versions'}
        </span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResumePage() {
  usePageTitle('Resumes')
  const { data: templates, isLoading, isError } = useResumeTemplates()
  const { data: allVariants } = useAllResumeVariants()
  const [createOpen, setCreateOpen] = useState(false)

  // Build templateId → unique company names from linked jobs across all variants
  const templateCompanies = useMemo(() => {
    const map = new Map<number, string[]>()
    allVariants?.forEach(v => {
      const prev = map.get(v.resume_template_id) ?? []
      v.linked_jobs.forEach(j => {
        if (!prev.includes(j.company_name)) prev.push(j.company_name)
      })
      map.set(v.resume_template_id, prev)
    })
    return map
  }, [allVariants])

  if (isLoading) return <PageLoading />
  if (isError) return <PageError />

  const count = templates?.length ?? 0

  return (
    <div className="space-y-[14px]">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Resumes</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {count} {count === 1 ? 'template' : 'templates'}
          </p>
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New template
        </Button>
      </div>

      {/* Empty state */}
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-border bg-card py-16 text-center">
          <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            <FileText className="h-6 w-6" />
          </div>
          <p className="font-semibold">No resume templates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a template for your base resume, then add tailored variants for each application.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
          {templates?.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              companies={templateCompanies.get(t.id) ?? []}
            />
          ))}
        </div>
      )}

      <TemplateCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
