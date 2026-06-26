import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import TurndownService from 'turndown'

import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { updateJob } from '@/services/api/jobs'
import type { Job } from '@/types/job'

import { Markdown } from '@/components/ui/markdown'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ClipboardPaste, Edit3, Eye, FileText, Save } from 'lucide-react'

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

export function JobInfoTab({ job }: { job: Job }) {
  const [description, setDescription] = useState(job.job_description || '')
  const [prevJobDescription, setPrevJobDescription] = useState(job.job_description)
  const [activeView, setActiveView] = useState<'preview' | 'write'>('preview')
  const queryClient = useQueryClient()

  if (prevJobDescription !== job.job_description) {
    setPrevJobDescription(job.job_description)
    setDescription(job.job_description || '')
  }

  const hasChanges = description !== (job.job_description || '')
  const hasDescription = Boolean(description.trim())

  const saveMutation = useMutation({
    mutationFn: (newDescription: string) =>
      updateJob(job.id, { job_description: newDescription }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.byUser(getCurrentUserId()) })
      toast.success('Description saved!')
    },
    onError: () => {
      toast.error('Failed to save description')
    },
  })

  const handleSave = () => saveMutation.mutate(description)
  const handleDiscard = () => setDescription(job.job_description || '')

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html')
    if (html) {
      e.preventDefault()
      let markdown = turndown.turndown(html)
      markdown = markdown
        .replace(/\*\*([^*]+?)\s*\n\s*\n\s*\*\*(?=\s*\n|\s*$)/g, '**$1**\n\n')
        .replace(/\*\*\s*\n/g, '**\n')
        .replace(/\*\*\n([A-Z])/g, '**\n\n$1')
        .replace(/^- {3}/gm, '- ')
        .replace(/^(\s+)- {3}/gm, '$1- ')
        .replace(/^(- .+)\n\s*\n(?=- )/gm, '$1\n')
        .replace(/^(- .+)\n\s*\n(\s+- )/gm, '$1\n$2')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^(\s*\n)+/, '')
        .trim()

      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = description.substring(0, start) + markdown + description.substring(end)
      setDescription(newValue)
    }
  }

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
        hasDescription ? (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-[12px] [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:uppercase [&_h1]:tracking-[0.4px] [&_h1]:mt-[14px] [&_h1]:mb-[5px] [&_h2]:text-[12px] [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:uppercase [&_h2]:tracking-[0.4px] [&_h2]:mt-[14px] [&_h2]:mb-[5px] [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:uppercase [&_h3]:tracking-[0.4px] [&_h3]:mt-[14px] [&_h3]:mb-[5px] [&_p]:text-[13px] [&_p]:text-foreground/80 [&_p]:leading-[1.7] [&_li]:text-[13px] [&_li]:text-foreground/80 [&_li]:leading-[1.7] [&_ul]:pl-[16px] [&_ol]:pl-[16px]">
            <Markdown>{description}</Markdown>
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-[14px] font-semibold text-foreground">No job description yet</p>
            <p className="text-muted-foreground mt-2 max-w-md text-[13px]">
              Switch to Write and paste the job listing — formatting is preserved automatically.
            </p>
          </div>
        )
      )}

      {/* Write */}
      {activeView === 'write' && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ClipboardPaste className="h-3.5 w-3.5" />
            <p className="text-[12px]">
              Paste from Seek, LinkedIn, or any job listing — formatting is converted automatically.
            </p>
          </div>
          <Textarea
            placeholder="Paste the job description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onPaste={handlePaste}
            className="min-h-[300px] resize-y font-mono text-sm"
          />
        </div>
      )}
    </div>
  )
}
