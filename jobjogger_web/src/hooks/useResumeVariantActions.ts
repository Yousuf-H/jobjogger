import {
  createResumeVariant,
  deleteResumeVariant,
  linkResumeVariant,
  updateResumeVariant,
} from '@/services/api/resume'
import { getCurrentUserId } from '@/lib/auth'
import { extractErrorMessage } from '@/lib/errors'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useResumeVariantActions(templateId?: number) {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resumeVariants.all(userId) })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resumeTemplates.all(userId) })
  }

  const createMutation = useMutation({
    mutationFn: (data: { notes?: string; pdf?: File }) =>
      createResumeVariant(templateId!, data),
    onSuccess: () => {
      invalidate()
      toast.success('Variant created.')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to create variant.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { notes?: string; pdf?: File } }) =>
      updateResumeVariant(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Variant updated.')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to update variant.'))
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.byUser(userId) })
      toast.success(variantId ? 'Resume linked.' : 'Resume unlinked.')
    },
    onError: () => {
      toast.error('Failed to update resume link.')
    },
  })

  return { createMutation, updateMutation, deleteMutation, linkMutation, invalidate }
}
