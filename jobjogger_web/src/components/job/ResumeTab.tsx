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
import { IconFileOff, IconPaperclip } from '@tabler/icons-react'
import { ExternalLink, FileText, Link2Off, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()

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
          <DialogTitle>Link a resume</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a resume variant to link to this job application.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : variants.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <IconFileOff className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-center text-sm text-muted-foreground">
              No resume variants yet. Create one in the Resume Library.
            </p>
          </div>
        ) : (
          <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
            {Object.entries(byTemplate).map(([templateName, tvariants]) => (
              <div key={templateName}>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
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
                        <span className="block truncate font-medium">
                          {v.pdf_filename ?? 'Unnamed variant'}
                        </span>
                        {v.notes && (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
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

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isLoading && variants.length === 0 && (
            <Button
              onClick={() => {
                onOpenChange(false)
                navigate('/resume')
              }}
            >
              Go to Resume Library
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
        <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
            <IconPaperclip className="h-5 w-5" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">No resume linked</p>
          <p className="text-muted-foreground mt-2 max-w-md text-[13px]">
            Link the resume variant you submitted or plan to submit for this job.
          </p>
          {!readOnly && (
            <Button onClick={() => setPickerOpen(true)} className="mt-5">
              Link Resume
            </Button>
          )}
        </div>
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
            <div className="mt-3">
              <Button size="sm" variant="outline" asChild>
                <a href={variant.pdf_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  {variant.pdf_filename ?? 'View PDF'}
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
