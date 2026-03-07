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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (notes: string) => updateJob(job.id, { notes }),
    onSuccess: () => {
      setSaveStatus('saved')
      queryClient.invalidateQueries({ queryKey: ['jobs', job.id.toString()] })
    },
    onError: () => {
      setSaveStatus('error')
    },
  })

  const clearPendingSave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const debouncedSave = (value: string) => {
    clearPendingSave()

    timeoutRef.current = setTimeout(() => {
      mutation.mutate(value)
      timeoutRef.current = null
    }, 1000)
  }

  const flushSave = (value: string) => {
    clearPendingSave()
    mutation.mutate(value)
  }

  useEffect(() => {
    return () => {
      clearPendingSave()
    }
  }, [])

  return (
    <Card>
      <CardContent className="mt-4 space-y-6">
        <Textarea
          placeholder="Write notes about this job application..."
          value={localNotes}
          onChange={(e) => {
            const value = e.target.value
            setLocalNotes(value)
            setSaveStatus('saving')
            debouncedSave(value)
          }}
          onBlur={() => {
            if (saveStatus === 'saving') {
              flushSave(localNotes)
            }
          }}
          className="min-h-[260px] resize-y"
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
