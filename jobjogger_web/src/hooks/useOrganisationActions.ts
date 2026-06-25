import {
  createOrganisation,
  deleteOrganisation,
  dismissOrganisationReview,
  mergeOrganisation,
  updateOrganisation,
} from '@/services/api/organisations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Organisation } from '@/types/organisation'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface UseOrganisationActionsOptions {
  onDeleteSuccess?: () => void
}

export function useOrganisationActions(options?: UseOrganisationActionsOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: Partial<Organisation>) => createOrganisation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] })
      toast.success('Organisation created successfully!')
    },
    onError: (error: AxiosError<{ errors?: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to create organisation'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Organisation> }) =>
      updateOrganisation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] })
      toast.success('Organisation updated successfully!')
    },
    onError: (error: AxiosError<{ errors?: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to update organisation'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrganisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] })
      toast.success('Organisation deleted successfully!')
      options?.onDeleteSuccess?.()
    },
    onError: (error: AxiosError<{ errors?: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to delete organisation'
      toast.error(message)
    },
  })

  const mergeMutation = useMutation({
    mutationFn: ({
      duplicateId,
      targetId,
    }: {
      duplicateId: number
      targetId: number
    }) => mergeOrganisation(duplicateId, targetId),
    onSuccess: (survivingOrg) => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Organisations merged successfully!')
      navigate(`/organisations/${survivingOrg.id}`)
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      const message =
        error.response?.data?.error || 'Failed to merge organisations'
      toast.error(message)
    },
  })

  const dismissReviewMutation = useMutation({
    mutationFn: (id: number) => dismissOrganisationReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] })
      toast.success('Review dismissed.')
    },
    onError: () => {
      toast.error('Failed to dismiss review')
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    mergeMutation,
    dismissReviewMutation,
  }
}
