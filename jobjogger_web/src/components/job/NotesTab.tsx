import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { updateJob } from '@/services/api/jobs'
import type { Job } from '@/types/job'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Save, Eye, Edit3 } from 'lucide-react'
import { Markdown } from '@/components/ui/markdown'

interface NotesTabProps {
  job: Job
}

export function NotesTab({ job }: NotesTabProps) {
  const [notes, setNotes] = useState(job.notes || '')
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const queryClient = useQueryClient()

  const hasChanges = notes !== (job.notes || '')

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
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Notes</h3>
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>

            {hasChanges && (
              <div className="flex gap-2">
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
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          {/* Add this description */}
          <div className="text-muted-foreground space-y-2 text-sm">
            <p>
              Keep interview prep, recruiter context, follow-up reminders, and
              anything else worth remembering. Markdown is supported.
            </p>
            <div className="bg-muted/50 flex flex-wrap gap-4 rounded-md p-2 font-mono text-xs">
              <span># Heading</span>
              <span>**bold**</span>
              <span>*italic*</span>
              <span>- list item</span>
              <span>[link](url)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'write' | 'preview')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write" className="gap-2">
              <Edit3 className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="mt-4">
            <Textarea
              placeholder="Add notes about this job application..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[400px] resize-y font-mono text-sm"
            />
            <p className="text-muted-foreground mt-2 text-xs">
              Supports Markdown formatting
            </p>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            {notes ? (
              <div className="prose prose-sm dark:prose-invert min-h-[400px] max-w-none rounded-md border p-4">
                <Markdown>{notes}</Markdown>
              </div>
            ) : (
              <div className="flex min-h-[400px] items-center justify-center rounded-md border border-dashed p-8">
                <p className="text-muted-foreground text-sm">
                  No notes yet. Switch to the Write tab to add notes.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
