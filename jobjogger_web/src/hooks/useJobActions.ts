import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { archiveJob, deleteJob, unarchiveJob } from '@/services/api/jobs'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

export function useJobActions() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const archiveMutation = useMutation({
    mutationFn: archiveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job Archived Successfully!')
    },
    onError: (error: AxiosError<{ errors: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to archive this job'
      toast.error(message)
    },
  })

  const unarchiveMutation = useMutation({
    mutationFn: unarchiveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job unarchived successfully!')
    },
    onError: (error: AxiosError<{ errors: string[] }>) => {
      const message = error.response?.data?.errors?.[0] || 'Failed to unarchive'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job Deleted Successfully!')
    },
    onError: (error: AxiosError<{ errors: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to delete this job'
      toast.error(message)
    },
  })

  const handleView = (id: number) => navigate(`/jobs/${id}`)

  return {
    handleView,
    archiveMutation,
    unarchiveMutation,
    deleteMutation,
  }
}
