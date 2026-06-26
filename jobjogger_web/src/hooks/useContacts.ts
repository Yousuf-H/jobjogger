import {
  fetchContact,
  fetchContacts,
  fetchJobContacts,
} from '@/services/api/contacts'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useContacts(
  params?: { search?: string; organisation_id?: number },
  options?: { enabled?: boolean }
) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.contacts.list(userId, params),
    queryFn: () => fetchContacts(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  })
}

export function useContact(id: string | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.contacts.detail(userId, id),
    queryFn: () => fetchContact(Number(id)),
    enabled: !!id,
  })
}

export function useJobContacts(jobId: number | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.contacts.forJob(userId, jobId),
    queryFn: () => fetchJobContacts(Number(jobId)),
    enabled: !!jobId,
  })
}
