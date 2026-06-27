import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from './queryKeys'

type UserId = string | null | undefined

/**
 * Invalidates all job-related queries for the given user.
 *
 * Triggers a background refetch of every query whose key starts with
 * `['jobs', userId]`, covering both list and detail queries.
 *
 * @param qc     - The active TanStack `QueryClient` instance.
 * @param userId - The current user's ID. Passing `null` or `undefined` is
 *                 safe — no queries will match and nothing is invalidated.
 */
export function invalidateJobQueries(qc: QueryClient, userId: UserId): void {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.jobs.byUser(userId) })
}

/**
 * Invalidates all contact-related queries for the given user.
 *
 * @param qc     - The active TanStack `QueryClient` instance.
 * @param userId - The current user's ID.
 */
export function invalidateContactQueries(qc: QueryClient, userId: UserId): void {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.contacts.byUser(userId) })
}

/**
 * Invalidates all organisation-related queries for the given user.
 *
 * @param qc     - The active TanStack `QueryClient` instance.
 * @param userId - The current user's ID.
 */
export function invalidateOrganisationQueries(qc: QueryClient, userId: UserId): void {
  qc.invalidateQueries({ queryKey: QUERY_KEYS.organisations.list(userId) })
}
