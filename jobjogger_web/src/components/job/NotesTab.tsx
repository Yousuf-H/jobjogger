import { Card, CardContent } from '@/components/ui/card'
import type { Job } from '@/types/job'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateJob } from '@/services/api/jobs'

export function NotesTab({ job }: { job: Job }) {
  const [localNotes, setLocalNotes] = useState(job?.notes || '')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>(
    'saved'
  )
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (notes: string) => updateJob(job.id, { ...job, notes }),
    onSuccess: () => {
      setSaveStatus('saved')
      queryClient.invalidateQueries({ queryKey: ['jobs', job.id.toString()] })
    },
    onError: () => {
      setSaveStatus('error')
    },
  })

  const debouncedSave = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      mutation.mutate(value)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Card>
      <CardContent className="mt-4 space-y-6">
        <Textarea
          placeholder="Add notes about this job application..."
          value={localNotes}
          onChange={(e) => {
            setLocalNotes(e.target.value)
            setSaveStatus('saving')
            debouncedSave(e.target.value)
          }}
          className="min-h-[200px] resize-none"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Error saving'}
        </p>
      </CardContent>
    </Card>
  )
}
