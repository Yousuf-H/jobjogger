import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { updateJob } from '@/services/api/jobs'
import type { Job } from '@/types/job'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/ui/markdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Edit3, Eye, PenLine, Save } from 'lucide-react'

interface NotesTabProps {
  job: Job
}

export function NotesTab({ job }: NotesTabProps) {
  const [notes, setNotes] = useState(job.notes || '')
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('preview')
  const queryClient = useQueryClient()

  const hasChanges = notes !== (job.notes || '')
  const hasNotes = Boolean(notes.trim())

  const saveMutation = useMutation({
    mutationFn: (newNotes: string) => updateJob(job.id, { notes: newNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', job.id.toString()] })
      toast.success('Notes saved!')
    },
    onError: () => {
      toast.error('Failed to save notes')
    },
  })

  const handleSave = () => {
    saveMutation.mutate(notes)
  }

  const handleDiscard = () => {
    setNotes(job.notes || '')
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
          {hasNotes ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{notes}</Markdown>
            </div>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-4 rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
                <PenLine className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">No notes yet</h3>
              <p className="text-muted-foreground mt-2 max-w-md text-sm">
                Switch to Write to add interview prep, recruiter context, or
                anything worth remembering. Markdown is supported.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="write" className="mt-4">
          <Textarea
            placeholder="Add notes about this job application..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[300px] resize-y font-mono text-sm"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
