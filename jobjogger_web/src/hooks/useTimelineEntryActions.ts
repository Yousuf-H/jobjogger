import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getCurrentUserId } from '@/lib/auth'
import { extractErrorMessage } from '@/lib/errors'
import { invalidateJobQueries } from '@/lib/invalidation'
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
  const userId = getCurrentUserId()

  const invalidate = () => invalidateJobQueries(queryClient, userId)

  const createMutation = useMutation({
    mutationFn: (data: TimelineEntryFormValues) =>
      createTimelineEntry(jobId, data),
    onSuccess: () => {
      invalidate()
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
      invalidate()
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
