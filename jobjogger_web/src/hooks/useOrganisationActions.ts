import {
  createOrganisation,
  deleteOrganisation,
  dismissOrganisationReview,
  mergeOrganisation,
  updateOrganisation,
} from '@/services/api/organisations'
import { getCurrentUserId } from '@/lib/auth'
import { extractErrorMessage } from '@/lib/errors'
import {
  invalidateContactQueries,
  invalidateJobQueries,
  invalidateOrganisationQueries,
} from '@/lib/invalidation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Organisation } from '@/types/organisation'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface UseOrganisationActionsOptions {
  onDeleteSuccess?: () => void
}

/**
 * Provides write mutations for organisations, including a merge operation.
 *
 * All mutations invalidate the organisation query set on success. The merge
 * mutation additionally invalidates jobs and contacts because merging
 * reassigns those records to the surviving organisation.
 *
 * @param options.onDeleteSuccess - Fired after a successful delete.
 * @returns An object with named mutations:
 *   - `createMutation` / `updateMutation` / `deleteMutation` — standard CRUD
 *   - `mergeMutation`           — merges a duplicate into a target, then navigates to the survivor
 *   - `dismissReviewMutation`   — dismisses the duplicate-review flag on an organisation
 */
export function useOrganisationActions(options?: UseOrganisationActionsOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  const invalidateOrgs = () => invalidateOrganisationQueries(queryClient, userId)

  const createMutation = useMutation({
    mutationFn: (data: Partial<Organisation>) => createOrganisation(data),
    onSuccess: () => {
      invalidateOrgs()
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
      invalidateOrgs()
      toast.success('Organisation updated successfully!')
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to update organisation'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrganisation,
    onSuccess: () => {
      invalidateOrgs()
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
      invalidateOrgs()
      invalidateJobQueries(queryClient, userId)
      invalidateContactQueries(queryClient, userId)
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
      invalidateOrgs()
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
