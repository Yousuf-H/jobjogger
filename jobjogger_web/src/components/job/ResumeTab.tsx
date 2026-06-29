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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import EmptyTabState from '@/components/job/EmptyTabState'
import { useAnalyseResume } from '@/hooks/useAnalyseResume'
import { useResumeVariantActions } from '@/hooks/useResumeVariantActions'
import { useAllResumeVariants, useResumeVariant } from '@/hooks/useResumeVariants'
import { extractErrorMessage } from '@/lib/errors'
import { TERMINAL_STATUSES, type JobStatus, type ResumeMatchAnalysis } from '@/types/job'
import type { ResumeVariant } from '@/types/resume'
import { IconFileOff } from '@tabler/icons-react'
import { ExternalLink, FileText, Link2Off, Loader2, Paperclip, Pencil, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
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

function MatchResultSection({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-foreground">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ResumeTabProps {
  jobId: number
  status: JobStatus
  resumeVariantId: number | null | undefined
  jobDescription?: string
  jobAnalysis?: ResumeMatchAnalysis | null
}

export function ResumeTab({ jobId, status, resumeVariantId, jobDescription, jobAnalysis }: ResumeTabProps) {
  const readOnly = TERMINAL_STATUSES.includes(status)
  const { data: variant, isLoading } = useResumeVariant(resumeVariantId)
  const { linkMutation } = useResumeVariantActions()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [unlinkOpen, setUnlinkOpen] = useState(false)

  const analyseMutation = useAnalyseResume(jobId)

  // Reset stale mutation data when the resume or job description changes so the
  // old score is not shown for inputs that no longer match the current job.
  useEffect(() => {
    analyseMutation.reset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeVariantId, jobDescription])

  // Prefer fresh mutation result; fall back to persisted analysis from job data.
  const displayedAnalysis: ResumeMatchAnalysis | null = analyseMutation.data ?? jobAnalysis ?? null

  const canAnalyse = !!resumeVariantId && !!jobDescription?.trim()
  const analyseDisabledReason = !resumeVariantId
    ? 'Link a resume to this job first'
    : !jobDescription?.trim()
      ? 'Add a job description to this job first'
      : undefined

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
          icon={Paperclip}
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

        {/* Match analysis */}
        <div className="space-y-3 border-t pt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* span wrapper needed so pointer events reach the tooltip when button is disabled */}
                <span className="inline-block">
                  <Button
                    onClick={() => analyseMutation.mutate()}
                    disabled={!canAnalyse || analyseMutation.isPending}
                  >
                    {analyseMutation.isPending ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1.5 h-4 w-4" />
                    )}
                    {analyseMutation.isPending ? 'Analysing…' : 'Analyse Match'}
                  </Button>
                </span>
              </TooltipTrigger>
              {analyseDisabledReason && (
                <TooltipContent>{analyseDisabledReason}</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {analyseMutation.isError && (
            <p className="text-sm text-destructive">
              {extractErrorMessage(analyseMutation.error, 'Analysis failed. Please try again.')}
            </p>
          )}

          {displayedAnalysis && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Match Score
                  </p>
                  <p className="text-3xl font-bold tabular-nums">
                    {displayedAnalysis.score}
                    <span className="text-base font-normal text-muted-foreground"> / 100</span>
                  </p>
                </div>
                {displayedAnalysis.cached && (
                  <p className="text-xs text-muted-foreground mt-1 shrink-0">
                    Cached · Update the job description or linked resume to run a fresh analysis
                  </p>
                )}
              </div>

              <MatchResultSection label="Strengths" items={displayedAnalysis.strengths} />
              <MatchResultSection label="Weaknesses" items={displayedAnalysis.weaknesses} />
              <MatchResultSection label="Missing Keywords" items={displayedAnalysis.missing_keywords} />
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
