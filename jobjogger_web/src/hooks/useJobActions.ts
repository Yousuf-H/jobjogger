import { archiveJob, deleteJob, unarchiveJob } from '@/services/api/jobs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface UseJobActionsOptions {
  onDeleteSuccess?: () => void
}

export function useJobActions(options?: UseJobActionsOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const archiveMutation = useMutation({
    mutationFn: archiveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job Archived Successfully!')
    },
    onError: (
      error: AxiosError<{ status?: { message?: string }; errors?: string[] }>
    ) => {
      const message =
        error.response?.data?.status?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to archive this job'
      toast.error(message)
    },
  })

  const unarchiveMutation = useMutation({
    mutationFn: unarchiveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job unarchived successfully!')
    },
    onError: (
      error: AxiosError<{ status?: { message?: string }; errors?: string[] }>
    ) => {
      const message =
        error.response?.data?.status?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to unarchive'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job Deleted Successfully!')
      options?.onDeleteSuccess?.()
    },
    onError: (
      error: AxiosError<{ status?: { message?: string }; errors?: string[] }>
    ) => {
      const message =
        error.response?.data?.status?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to delete this job'
      toast.error(message)
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
