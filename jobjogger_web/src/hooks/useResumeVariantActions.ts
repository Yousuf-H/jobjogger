import {
  createResumeVariant,
  deleteResumeVariant,
  linkResumeVariant,
  updateResumeVariant,
} from '@/services/api/resume'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function useResumeVariantActions(templateId?: number) {
  const queryClient = useQueryClient()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['resume_variants', user.id] })
    queryClient.invalidateQueries({ queryKey: ['resume_templates', user.id] })
  }

  const createMutation = useMutation({
    mutationFn: (data: { notes?: string; pdf?: File }) =>
      createResumeVariant(templateId!, data),
    onSuccess: () => {
      invalidate()
      toast.success('Variant created.')
    },
    onError: (error: AxiosError<{ errors?: string[] }>) => {
      toast.error(error.response?.data?.errors?.[0] ?? 'Failed to create variant.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { notes?: string; pdf?: File } }) =>
      updateResumeVariant(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Variant updated.')
    },
    onError: (error: AxiosError<{ errors?: string[] }>) => {
      toast.error(error.response?.data?.errors?.[0] ?? 'Failed to update variant.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteResumeVariant,
    onSuccess: () => {
      invalidate()
      toast.success('Variant deleted.')
    },
    onError: () => {
      toast.error('Failed to delete variant.')
    },
  })

  const linkMutation = useMutation({
    mutationFn: ({ jobId, variantId }: { jobId: number; variantId: number | null }) =>
      linkResumeVariant(jobId, variantId),
    onSuccess: (_, { variantId }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', user.id] })
      toast.success(variantId ? 'Resume linked.' : 'Resume unlinked.')
    },
    onError: () => {
      toast.error('Failed to update resume link.')
    },
  })

  return { createMutation, updateMutation, deleteMutation, linkMutation, invalidate }
}
