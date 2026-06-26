import {
  createResumeTemplate,
  deleteResumeTemplate,
  updateResumeTemplate,
} from '@/services/api/resume'
import { getCurrentUserId } from '@/lib/auth'
import { extractErrorMessage } from '@/lib/errors'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Provides write mutations for resume templates.
 *
 * All mutations invalidate `resumeTemplates.all` on success.
 * Templates support PDF file uploads — pass a `File` object in the `pdf` field.
 *
 * @returns `{ createMutation, updateMutation, deleteMutation, invalidate }`
 *   - `invalidate` is exposed so callers can manually trigger a refetch after
 *     related operations (e.g. after variant changes).
 */
export function useResumeTemplateActions() {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.resumeTemplates.all(userId) })
  }

  const createMutation = useMutation({
    mutationFn: (data: { name: string; notes?: string; pdf?: File }) =>
      createResumeTemplate(data),
    onSuccess: () => {
      invalidate()
      toast.success('Template created.')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to create template.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; notes?: string; pdf?: File } }) =>
      updateResumeTemplate(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Template updated.')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to update template.'))
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
