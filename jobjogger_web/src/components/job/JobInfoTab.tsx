import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import TurndownService from 'turndown'

import { updateJob } from '@/services/api/jobs'
import type { Job } from '@/types/job'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/ui/markdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ClipboardPaste, Edit3, Eye, FileText, Save } from 'lucide-react'

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

export function JobInfoTab({ job }: { job: Job }) {
  const [description, setDescription] = useState(job.job_description || '')
  const [prevJobDescription, setPrevJobDescription] = useState(
    job.job_description
  )
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('preview')
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
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Description saved!')
    },
    onError: () => {
      toast.error('Failed to save description')
    },
  })

  const handleSave = () => {
    saveMutation.mutate(description)
  }

  const handleDiscard = () => {
    setDescription(job.job_description || '')
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html')

    if (html) {
      e.preventDefault()
      let markdown = turndown.turndown(html)

      // Clean up common formatting issues from LinkedIn/Seek
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
      const current = description

      const newValue =
        current.substring(0, start) + markdown + current.substring(end)

      setDescription(newValue)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                disabled={saveMutation.isPending}
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                variant="success"
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'write' | 'preview')}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="write" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Write
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          {hasDescription ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{description}</Markdown>
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">
                No job description yet
              </h3>
              <p className="text-muted-foreground mt-2 max-w-md text-sm">
                Switch to Write and paste the job listing — formatting is
                preserved automatically.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="write" className="mt-4 space-y-2">
          <div className="text-muted-foreground flex items-center gap-1.5">
            <ClipboardPaste className="h-3.5 w-3.5" />
            <p className="text-xs">
              Paste from Seek, LinkedIn, or any job listing — formatting is
              converted automatically.
            </p>
          </div>
          <Textarea
            placeholder="Paste the job description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onPaste={handlePaste}
            className="min-h-[300px] resize-y font-mono text-sm"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
