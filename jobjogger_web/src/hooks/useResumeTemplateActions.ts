import {
  createResumeTemplate,
  deleteResumeTemplate,
  updateResumeTemplate,
} from '@/services/api/resume'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function useResumeTemplateActions() {
  const queryClient = useQueryClient()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['resume_templates', user.id] })
  }

  const createMutation = useMutation({
    mutationFn: (data: { name: string; notes?: string; pdf?: File }) =>
      createResumeTemplate(data),
    onSuccess: () => {
      invalidate()
      toast.success('Template created.')
    },
    onError: (error: AxiosError<{ errors?: string[] }>) => {
      toast.error(error.response?.data?.errors?.[0] ?? 'Failed to create template.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; notes?: string; pdf?: File } }) =>
      updateResumeTemplate(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Template updated.')
    },
    onError: (error: AxiosError<{ errors?: string[] }>) => {
      toast.error(error.response?.data?.errors?.[0] ?? 'Failed to update template.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteResumeTemplate,
    onSuccess: () => {
      invalidate()
      toast.success('Template deleted.')
    },
    onError: () => {
      toast.error('Failed to delete template.')
    },
  })

  return { createMutation, updateMutation, deleteMutation, invalidate }
}
