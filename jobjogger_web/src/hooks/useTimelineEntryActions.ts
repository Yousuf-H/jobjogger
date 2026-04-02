import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

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
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Timeline entry added!')
      onCreateSuccess?.()
    },
    onError: (
      error: AxiosError<{ status?: { message?: string }; errors?: string[] }>
    ) => {
      const message =
        error.response?.data?.status?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to add entry'
      toast.error(message)
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
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Timeline entry updated!')
      onUpdateSuccess?.()
    },
    onError: (
      error: AxiosError<{ status?: { message?: string }; errors?: string[] }>
    ) => {
      const message =
        error.response?.data?.status?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to update entry'
      toast.error(message)
    },
  })

  return {
    createMutation,
    updateMutation,
  }
}
