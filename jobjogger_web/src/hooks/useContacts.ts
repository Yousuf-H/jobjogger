import {
  fetchContact,
  fetchContacts,
  fetchJobContacts,
} from '@/services/api/contacts'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

function getUserId(): string {
  return JSON.parse(localStorage.getItem('user') || '{}').id
}

export function useContacts(
  params?: { search?: string; organisation_id?: number },
  options?: { enabled?: boolean }
) {
  const userId = getUserId()

  return useQuery({
    queryKey: ['contacts', userId, params],
    queryFn: () => fetchContacts(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  })
}

export function useContact(id: string | undefined) {
  const userId = getUserId()

  return useQuery({
    queryKey: ['contacts', userId, id],
    queryFn: () => fetchContact(Number(id)),
    enabled: !!id,
  })
}

export function useJobContacts(jobId: number | undefined) {
  const userId = getUserId()

  return useQuery({
    queryKey: ['contacts', userId, 'job', jobId],
    queryFn: () => fetchJobContacts(Number(jobId)),
    enabled: !!jobId,
  })
}
