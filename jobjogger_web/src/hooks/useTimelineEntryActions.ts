import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { extractErrorMessage } from '@/lib/errors'
import { QUERY_KEYS } from '@/lib/queryKeys'
import type { TimelineEntryFormValues } from '@/lib/validations/timelineEntry'
import {
  createTimelineEntry,
  updateTimelineEntry,
} from '@/services/api/timelineEntries'

interface UseTimelineEntryActionsOptions {
  jobId: number
  onCreateSuccess?: () => void
  onUpdateSuccess?: () => void
}

export function useTimelineEntryActions({
  jobId,
  onCreateSuccess,
  onUpdateSuccess,
}: UseTimelineEntryActionsOptions) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: TimelineEntryFormValues) =>
      createTimelineEntry(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.all() })
      toast.success('Timeline entry added!')
      onCreateSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to add entry'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: number
      data: TimelineEntryFormValues
    }) => updateTimelineEntry(entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.all() })
      toast.success('Timeline entry updated!')
      onUpdateSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to update entry'))
    },
  })

  return {
    createMutation,
    updateMutation,
  }
}
