import {
  createContact,
  createInteraction,
  deleteContact,
  deleteInteraction,
  linkContactToJob,
  unlinkContactFromJob,
  updateContact,
  updateInteraction,
} from '@/services/api/contacts'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UseContactActionsOptions {
  onCreateSuccess?: () => void
  onDeleteSuccess?: () => void
}

/**
 * Provides all write mutations for contacts and their interactions.
 *
 * All mutations invalidate the contacts query set on success so lists and
 * detail views stay in sync. Link/unlink mutations additionally invalidate
 * the `forJob` key for the affected job.
 *
 * @param options.onCreateSuccess - Fired after a contact is successfully created.
 * @param options.onDeleteSuccess - Fired after a contact is successfully deleted.
 * @returns An object with named mutations:
 *   - `createMutation` / `updateMutation` / `deleteMutation` — CRUD for contacts
 *   - `linkMutation` / `unlinkMutation` — manage contact↔job associations
 *   - `createInteractionMutation` / `updateInteractionMutation` / `deleteInteractionMutation`
 */
export function useContactActions(options?: UseContactActionsOptions) {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  const invalidateContacts = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.byUser(userId) })

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      invalidateContacts()
      toast.success('Contact created')
      options?.onCreateSuccess?.()
    },
    onError: () => toast.error('Failed to create contact'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Parameters<typeof updateContact>[1]> }) =>
      updateContact(id, data),
    onSuccess: () => {
      invalidateContacts()
      toast.success('Contact updated')
    },
    onError: () => toast.error('Failed to update contact'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      invalidateContacts()
      toast.success('Contact deleted')
      options?.onDeleteSuccess?.()
    },
    onError: () => toast.error('Failed to delete contact'),
  })

  const linkMutation = useMutation({
    mutationFn: ({ jobId, contactId }: { jobId: number; contactId: number }) =>
      linkContactToJob(jobId, contactId),
    onSuccess: (_data, { jobId }) => {
      invalidateContacts()
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.forJob(userId, jobId) })
      toast.success('Contact linked to job')
    },
    onError: () => toast.error('Failed to link contact'),
  })

  const unlinkMutation = useMutation({
    mutationFn: ({ jobId, contactId }: { jobId: number; contactId: number }) =>
      unlinkContactFromJob(jobId, contactId),
    onSuccess: (_data, { jobId }) => {
      invalidateContacts()
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts.forJob(userId, jobId) })
      toast.success('Contact unlinked')
    },
    onError: () => toast.error('Failed to unlink contact'),
  })

  const createInteractionMutation = useMutation({
    mutationFn: ({
      contactId,
      data,
    }: {
      contactId: number
      data: Parameters<typeof createInteraction>[1]
    }) => createInteraction(contactId, data),
    onSuccess: () => {
      invalidateContacts()
      toast.success('Interaction logged')
    },
    onError: () => toast.error('Failed to log interaction'),
  })

  const updateInteractionMutation = useMutation({
    mutationFn: ({
      contactId,
      interactionId,
      data,
    }: {
      contactId: number
      interactionId: number
      data: Parameters<typeof updateInteraction>[2]
    }) => updateInteraction(contactId, interactionId, data),
    onSuccess: () => {
      invalidateContacts()
      toast.success('Interaction updated')
    },
    onError: () => toast.error('Failed to update interaction'),
  })

  const deleteInteractionMutation = useMutation({
    mutationFn: ({
      contactId,
      interactionId,
    }: {
      contactId: number
      interactionId: number
    }) => deleteInteraction(contactId, interactionId),
    onSuccess: () => {
      invalidateContacts()
      toast.success('Interaction deleted')
    },
    onError: () => toast.error('Failed to delete interaction'),
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    linkMutation,
    unlinkMutation,
    createInteractionMutation,
    updateInteractionMutation,
    deleteInteractionMutation,
  }
}
