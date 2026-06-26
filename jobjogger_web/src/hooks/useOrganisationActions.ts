import {
  createOrganisation,
  deleteOrganisation,
  dismissOrganisationReview,
  mergeOrganisation,
  updateOrganisation,
} from '@/services/api/organisations'
import { extractErrorMessage } from '@/lib/errors'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Organisation } from '@/types/organisation'
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.organisations.all() })
      toast.success('Organisation created successfully!')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to create organisation'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Organisation> }) =>
      updateOrganisation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.organisations.all() })
      toast.success('Organisation updated successfully!')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to update organisation'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrganisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.organisations.all() })
      toast.success('Organisation deleted successfully!')
      options?.onDeleteSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to delete organisation'))
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.organisations.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.all() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.all() })
      toast.success('Organisations merged successfully!')
      navigate(`/organisations/${survivingOrg.id}`)
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to merge organisations'))
    },
  })

  const dismissReviewMutation = useMutation({
    mutationFn: (id: number) => dismissOrganisationReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.organisations.all() })
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
