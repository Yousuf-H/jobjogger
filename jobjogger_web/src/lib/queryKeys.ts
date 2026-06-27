/**
 * Centralised TanStack Query cache key factory.
 *
 * Every hook that calls `useQuery` or `useQueryClient.invalidateQueries` must
 * derive its key from here. Keys follow the shape `[resource, userId, ...rest]`
 * so that per-user cache isolation is enforced at the key level — invalidating
 * `byUser(userId)` cascades to all list and detail queries for that user.
 *
 * Usage:
 *   queryKey: QUERY_KEYS.jobs.list(userId, filters)
 *   invalidateQueries({ queryKey: QUERY_KEYS.jobs.byUser(userId) })
 */

type UserId = string | null | undefined

export const QUERY_KEYS = {
  jobs: {
    /** Matches all job queries regardless of user. */
    all: () => ['jobs'] as const,
    /** Matches all job queries for a specific user (list + detail). */
    byUser: (userId: UserId) => ['jobs', userId] as const,
    /** Scoped to the jobs list with optional filter params. */
    list: (userId: UserId, filters?: unknown) => ['jobs', userId, filters] as const,
    /** Scoped to a single job by ID. */
    detail: (userId: UserId, id: string | number | undefined) => ['jobs', userId, id] as const,
  },
  contacts: {
    all: () => ['contacts'] as const,
    byUser: (userId: UserId) => ['contacts', userId] as const,
    list: (userId: UserId, params?: unknown) => ['contacts', userId, params] as const,
    detail: (userId: UserId, id: string | number | undefined) => ['contacts', userId, id] as const,
    /** Contacts linked to a specific job (via the contact_jobs join table). */
    forJob: (userId: UserId, jobId: number | undefined) => ['contacts', userId, 'job', jobId] as const,
  },
  organisations: {
    all: () => ['organisations'] as const,
    list: (userId: UserId) => ['organisations', userId] as const,
    detail: (userId: UserId, id: string | number | undefined) => ['organisations', userId, id] as const,
    /** Organisations considered duplicates of the given organisation ID. */
    similar: (userId: UserId, id: string | number | undefined) => ['organisations', userId, id, 'similar'] as const,
  },
  analytics: (userId: UserId) => ['analytics', userId] as const,
  activity: {
    byUser: (userId: UserId) => ['activity', userId] as const,
    /** Paginated activity feed — page and perPage are part of the key so each
     *  page is cached independently. */
    detail: (userId: UserId, page: number, perPage: number) => ['activity', userId, page, perPage] as const,
  },
  interviews: {
    byUser: (userId: UserId) => ['interviews', userId] as const,
    /** Interviews attached to a specific job. */
    forJob: (userId: UserId, jobId: number | undefined) => ['interviews', userId, jobId] as const,
  },
  interviewQuestions: {
    byUser: (userId: UserId) => ['interview_questions', userId] as const,
    list: (userId: UserId, params?: unknown) => ['interview_questions', userId, params] as const,
  },
  pinnedQuestions: {
    /** Questions pinned to a job via the job_interview_questions join table. */
    forJob: (userId: UserId, jobId: number) => ['pinned_questions', userId, jobId] as const,
  },
  resumeTemplates: {
    all: (userId: UserId) => ['resume_templates', userId] as const,
    detail: (userId: UserId, id: number | undefined) => ['resume_templates', userId, id] as const,
  },
  resumeVariants: {
    all: (userId: UserId) => ['resume_variants', userId] as const,
    detail: (userId: UserId, id: number | null | undefined) => ['resume_variants', userId, id] as const,
  },
  notifications: (userId: UserId) => ['notifications', userId] as const,
  adminStats: (userId: UserId, period: string) => ['adminStats', userId, period] as const,
}
