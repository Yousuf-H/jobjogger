type UserId = string | undefined

export const QUERY_KEYS = {
  jobs: {
    all: () => ['jobs'] as const,
    byUser: (userId: UserId) => ['jobs', userId] as const,
    list: (userId: UserId, filters?: unknown) => ['jobs', userId, filters] as const,
    detail: (userId: UserId, id: string | number | undefined) => ['jobs', userId, id] as const,
  },
  contacts: {
    all: () => ['contacts'] as const,
    byUser: (userId: UserId) => ['contacts', userId] as const,
    list: (userId: UserId, params?: unknown) => ['contacts', userId, params] as const,
    detail: (userId: UserId, id: string | number | undefined) => ['contacts', userId, id] as const,
    forJob: (userId: UserId, jobId: number | undefined) => ['contacts', userId, 'job', jobId] as const,
  },
  organisations: {
    all: () => ['organisations'] as const,
    list: (userId: UserId) => ['organisations', userId] as const,
    detail: (userId: UserId, id: string | number | undefined) => ['organisations', userId, id] as const,
    similar: (userId: UserId, id: string | number | undefined) => ['organisations', userId, id, 'similar'] as const,
  },
  analytics: (userId: UserId) => ['analytics', userId] as const,
  activity: (userId: UserId, page: number, perPage: number) => ['activity', userId, page, perPage] as const,
  interviews: {
    byUser: (userId: UserId) => ['interviews', userId] as const,
    forJob: (userId: UserId, jobId: number | undefined) => ['interviews', userId, jobId] as const,
  },
  interviewQuestions: {
    byUser: (userId: UserId) => ['interview_questions', userId] as const,
    list: (userId: UserId, params?: unknown) => ['interview_questions', userId, params] as const,
  },
  pinnedQuestions: {
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
