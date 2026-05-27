import EmptyTabState from '@/components/job/EmptyTabState'
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResumeVariantActions } from '@/hooks/useResumeVariantActions'
import { useAllResumeVariants, useResumeVariant } from '@/hooks/useResumeVariants'
import { TERMINAL_STATUSES, type JobStatus } from '@/types/job'
import type { ResumeVariant } from '@/types/resume'
import { ExternalLink, FileText, Link2Off, Maximize2, Pencil } from 'lucide-react'
import { useState } from 'react'

function VariantPickerDialog({
  open,
  onOpenChange,
  jobId,
  currentVariantId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: number
  currentVariantId: number | null | undefined
}) {
  const { data: variants = [], isLoading } = useAllResumeVariants()
  const { linkMutation } = useResumeVariantActions()

  const byTemplate = variants.reduce<Record<string, ResumeVariant[]>>((acc, v) => {
    const key = v.template_name
    if (!acc[key]) acc[key] = []
    acc[key].push(v)
    return acc
  }, {})

  const handleSelect = (variantId: number) => {
    linkMutation.mutate(
      { jobId, variantId },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link Resume</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a resume variant to link to this job application.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : variants.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No resume variants yet. Create one in the Resume Library.
          </p>
        ) : (
          <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
            {Object.entries(byTemplate).map(([templateName, tvariants]) => (
              <div key={templateName}>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {templateName}
                </p>
                <div className="space-y-1">
                  {tvariants.map((v) => {
                    const isCurrent = v.id === currentVariantId
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelect(v.id)}
                        disabled={isCurrent || linkMutation.isPending}
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          isCurrent
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'bg-background hover:bg-muted/50 hover:border-muted-foreground/30'
                        }`}
                      >
                        <span className="font-medium">
                          {v.pdf_filename ?? (v.notes ? v.notes.slice(0, 40) : 'Unnamed variant')}
                        </span>
                        {v.notes && v.pdf_filename && (
                          <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">
                            {v.notes}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="mt-0.5 block text-xs text-primary">Currently linked</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PdfPreviewDialog({ pdfUrl, filename }: { pdfUrl: string; filename: string | null }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Maximize2 className="mr-1.5 h-3.5 w-3.5" />
        Preview
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] max-w-4xl flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 border-b px-4 py-3">
            <DialogTitle className="text-sm font-medium">{filename ?? 'Resume PDF'}</DialogTitle>
            <DialogDescription className="sr-only">PDF preview</DialogDescription>
          </DialogHeader>
          <iframe
            src={pdfUrl}
            className="min-h-0 w-full flex-1"
            title={filename ?? 'Resume PDF'}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ResumeTabProps {
  jobId: number
  status: JobStatus
  resumeVariantId: number | null | undefined
}

export function ResumeTab({ jobId, status, resumeVariantId }: ResumeTabProps) {
  const readOnly = TERMINAL_STATUSES.includes(status)
  const { data: variant, isLoading } = useResumeVariant(resumeVariantId)
  const { linkMutation } = useResumeVariantActions()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [unlinkOpen, setUnlinkOpen] = useState(false)

  const handleUnlink = () => {
    linkMutation.mutate({ jobId, variantId: null })
  }

  if (isLoading && resumeVariantId) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
  }

  if (!variant) {
    return (
      <>
        <EmptyTabState
          icon={FileText}
          title="No resume linked"
          description="Link the resume variant you submitted or plan to submit for this job."
          actionLabel={!readOnly ? 'Link Resume' : undefined}
          onAction={!readOnly ? () => setPickerOpen(true) : undefined}
        />
        <VariantPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          jobId={jobId}
          currentVariantId={resumeVariantId}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <FileText className="h-4 w-4" />
            Linked Resume
          </h3>
          {!readOnly && (
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Change
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setUnlinkOpen(true)}
              >
                <Link2Off className="mr-1.5 h-3.5 w-3.5" />
                Unlink
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Template
          </p>
          <p className="font-medium">{variant.template_name}</p>

          {variant.notes && (
            <div className="mt-3">
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="text-sm text-muted-foreground">{variant.notes}</p>
            </div>
          )}

          {variant.pdf_url && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <PdfPreviewDialog pdfUrl={variant.pdf_url} filename={variant.pdf_filename} />
              <Button size="sm" variant="ghost" className="text-muted-foreground" asChild>
                <a href={variant.pdf_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open in new tab
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      <VariantPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        jobId={jobId}
        currentVariantId={resumeVariantId}
      />

      <AlertDialog open={unlinkOpen} onOpenChange={setUnlinkOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the resume link from this job. The resume variant itself won't be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleUnlink()
                setUnlinkOpen(false)
              }}
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
