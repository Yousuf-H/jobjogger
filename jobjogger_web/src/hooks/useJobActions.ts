import { archiveJob, deleteJob, unarchiveJob } from '@/services/api/jobs'
import { getCurrentUserId } from '@/lib/auth'
import { extractErrorMessage } from '@/lib/errors'
import { invalidateJobQueries } from '@/lib/invalidation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface UseJobActionsOptions {
  onDeleteSuccess?: () => void
}

/**
 * Provides archive, unarchive, and delete mutations for a job, plus a navigation helper.
 *
 * All mutations invalidate the full job query set on success so lists and
 * detail views automatically refetch. Toast notifications are shown on
 * both success and error.
 *
 * @param options.onDeleteSuccess - Optional callback fired after a successful delete
 *                                  (e.g. to close a detail panel or navigate away).
 * @returns An object with:
 *   - `archiveMutation`   — sets `archived_at` on the job
 *   - `unarchiveMutation` — clears `archived_at`
 *   - `deleteMutation`    — permanently removes the job
 *   - `handleView(id)`    — navigates to `/jobs/:id`
 */
export function useJobActions(options?: UseJobActionsOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  const invalidate = () => invalidateJobQueries(queryClient, userId)

  const archiveMutation = useMutation({
    mutationFn: archiveJob,
    onSuccess: () => {
      invalidate()
      toast.success('Job Archived Successfully!')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to archive this job'))
    },
  })

  const unarchiveMutation = useMutation({
    mutationFn: unarchiveJob,
    onSuccess: () => {
      invalidate()
      toast.success('Job unarchived successfully!')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to unarchive'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      invalidate()
      toast.success('Job Deleted Successfully!')
      options?.onDeleteSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to delete this job'))
    },
  })

  const handleView = useCallback((id: number) => navigate(`/jobs/${id}`), [navigate])

  return {
    handleView,
    archiveMutation,
    unarchiveMutation,
    deleteMutation,
  }
}
