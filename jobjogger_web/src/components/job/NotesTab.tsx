import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { updateJob } from '@/services/api/jobs'
import type { Job } from '@/types/job'

import { Markdown } from '@/components/ui/markdown'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Edit3, Eye, PenLine, Save } from 'lucide-react'

interface NotesTabProps {
  job: Job
}

export function NotesTab({ job }: NotesTabProps) {
  const [notes, setNotes] = useState(job.notes || '')
  const [prevNotes, setPrevNotes] = useState(job.notes)
  const [activeView, setActiveView] = useState<'preview' | 'write'>('preview')
  const queryClient = useQueryClient()

  if (prevNotes !== job.notes) {
    setPrevNotes(job.notes)
    setNotes(job.notes || '')
  }

  const hasChanges = notes !== (job.notes || '')
  const hasNotes = Boolean(notes.trim())

  const saveMutation = useMutation({
    mutationFn: (newNotes: string) => updateJob(job.id, { notes: newNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.byUser(getCurrentUserId()) })
      toast.success('Notes saved!')
    },
    onError: () => {
      toast.error('Failed to save notes')
    },
  })

  const handleSave = () => saveMutation.mutate(notes)
  const handleDiscard = () => setNotes(job.notes || '')

  return (
    <div className="space-y-3">
      {/* Top row: toggle + save actions */}
      <div className="flex items-center justify-between gap-3">
        {/* Preview/Write pill toggle */}
        <div className="flex items-center gap-[3px] rounded-[7px] bg-muted p-[3px]">
          {(['preview', 'write'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={cn(
                'flex items-center gap-[5px] rounded-[5px] px-[10px] py-[4px] text-[12px] transition-colors',
                activeView === view
                  ? 'bg-card border border-border text-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {view === 'preview'
                ? <Eye className="h-[12px] w-[12px]" />
                : <Edit3 className="h-[12px] w-[12px]" />
              }
              {view === 'preview' ? 'Preview' : 'Write'}
            </button>
          ))}
        </div>

        {/* Save / Discard */}
        {hasChanges && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              disabled={saveMutation.isPending}
              className="rounded-[6px] border border-border bg-card px-[10px] py-[5px] text-[12px] font-medium text-foreground/80 hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-[5px] rounded-[6px] bg-[#2563EB] px-[10px] py-[5px] text-[12px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Save className="h-[12px] w-[12px]" />
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      {activeView === 'preview' && (
        hasNotes ? (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-[12px] [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:uppercase [&_h1]:tracking-[0.4px] [&_h1]:mt-[14px] [&_h1]:mb-[5px] [&_h2]:text-[12px] [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:uppercase [&_h2]:tracking-[0.4px] [&_h2]:mt-[14px] [&_h2]:mb-[5px] [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:uppercase [&_h3]:tracking-[0.4px] [&_h3]:mt-[14px] [&_h3]:mb-[5px] [&_p]:text-[13px] [&_p]:text-foreground/80 [&_p]:leading-[1.7] [&_li]:text-[13px] [&_li]:text-foreground/80 [&_li]:leading-[1.7] [&_ul]:pl-[16px] [&_ol]:pl-[16px]">
            <Markdown>{notes}</Markdown>
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
              <PenLine className="h-5 w-5" />
            </div>
            <p className="text-[14px] font-semibold text-foreground">No notes yet</p>
            <p className="text-muted-foreground mt-2 max-w-md text-[13px]">
              Switch to Write to add interview prep, recruiter context, or anything worth remembering. Markdown is supported.
            </p>
          </div>
        )
      )}

      {/* Write */}
      {activeView === 'write' && (
        <Textarea
          placeholder="Add notes about this job application..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[300px] resize-y font-mono text-sm"
        />
      )}
    </div>
  )
}
