import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from './queryKeys'

type UserId = string | null | undefined

export function invalidateJobQueries(qc: QueryClient, userId: UserId): void {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.jobs.byUser(userId) })
}

export function invalidateContactQueries(qc: QueryClient, userId: UserId): void {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.byUser(userId) })
}

export function invalidateOrganisationQueries(qc: QueryClient, userId: UserId): void {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.organisations.list(userId) })
}
