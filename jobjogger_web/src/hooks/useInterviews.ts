import {
  createAndPinQuestion,
  createInterview,
  createInterviewQuestion,
  deleteInterview,
  deleteInterviewQuestion,
  fetchInterviewQuestions,
  fetchInterviews,
  fetchPinnedQuestions,
  pinQuestion,
  unpinQuestion,
  updateInterview,
  updateInterviewQuestion,
} from '@/services/api/interviews'
import { getCurrentUserId } from '@/lib/auth'
import { invalidateJobQueries } from '@/lib/invalidation'
import { QUERY_KEYS } from '@/lib/queryKeys'
import type { Interview, InterviewQuestion } from '@/types/interview'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// --- Interviews ---

/**
 * Fetches all interviews for a specific job.
 *
 * Disabled when `jobId` is `undefined`.
 *
 * @param jobId - The job whose interviews to fetch, or `undefined`.
 * @returns A TanStack `UseQueryResult` with an array of `Interview` objects.
 */
export function useInterviews(jobId: number | undefined) {
  const userId = getCurrentUserId()
  return useQuery({
    queryKey: QUERY_KEYS.interviews.forJob(userId, jobId),
    queryFn: () => fetchInterviews(Number(jobId)),
    enabled: !!jobId,
  })
}

/**
 * Provides create, update, and delete mutations for interviews on a specific job.
 *
 * All mutations invalidate both the interviews query and the full job query set
 * (because interview count affects job detail display).
 *
 * @param jobId - The job that owns the interviews.
 * @returns `{ createMutation, updateMutation, deleteMutation }`
 */
export function useInterviewActions(jobId: number) {
  const userId = getCurrentUserId()
  const queryClient = useQueryClient()
  const queryKey = QUERY_KEYS.interviews.forJob(userId, jobId)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey })
    invalidateJobQueries(queryClient, userId)
  }

  const createMutation = useMutation({
    mutationFn: (data: Partial<Interview>) => createInterview(jobId, data),
    onSuccess: () => {
      invalidate()
      toast.success('Interview scheduled!')
    },
    onError: () => toast.error('Failed to save interview'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Interview> }) =>
      updateInterview(jobId, id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Interview updated')
    },
    onError: () => toast.error('Failed to update interview'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInterview(jobId, id),
    onSuccess: () => {
      invalidate()
      toast.success('Interview removed')
    },
    onError: () => toast.error('Failed to delete interview'),
  })

  return { createMutation, updateMutation, deleteMutation }
}

// --- Interview Questions ---

/**
 * Fetches interview questions from the user's question bank with optional scoping.
 *
 * The `scope` param controls which questions are returned:
 * - `'all'`      — all questions owned by the user
 * - `'personal'` — questions not attached to any job or org
 * - `'job'`      — questions scoped to a specific `job_id`
 * - `'org'`      — questions scoped to a specific `organisation_id`
 *
 * The query is automatically disabled when required scope params are missing
 * (e.g. `scope: 'job'` with no `job_id`). Uses `keepPreviousData` to avoid
 * list flash while filters change.
 *
 * @param params          - Filter params: `scope`, `job_id`, `organisation_id`, `category`.
 * @param options.enabled - External enabled guard (ANDed with the internal scope guard).
 * @returns A TanStack `UseQueryResult` with an array of `InterviewQuestion` objects.
 */
export function useInterviewQuestions(
  params?: {
    scope?: 'personal' | 'job' | 'org' | 'all'
    job_id?: number
    organisation_id?: number
    category?: string
  },
  options?: { enabled?: boolean }
) {
  const userId = getCurrentUserId()
  const defaultEnabled =
    (params?.scope !== 'job' || !!params?.job_id) &&
    (params?.scope !== 'org' || !!params?.organisation_id)
  return useQuery({
    queryKey: QUERY_KEYS.interviewQuestions.list(userId, params),
    queryFn: () => fetchInterviewQuestions(params),
    enabled: options?.enabled !== undefined ? options.enabled && defaultEnabled : defaultEnabled,
    placeholderData: keepPreviousData,
  })
}

// --- Pinned Questions (join table) ---

/**
 * Fetches questions pinned to a specific job via the `job_interview_questions` join table.
 *
 * Disabled when `jobId` is falsy.
 *
 * @param jobId - The job whose pinned questions to fetch.
 * @returns A TanStack `UseQueryResult` with an array of `InterviewQuestion` objects.
 */
export function usePinnedQuestions(jobId: number) {
  const userId = getCurrentUserId()
  return useQuery({
    queryKey: QUERY_KEYS.pinnedQuestions.forJob(userId, jobId),
    queryFn: () => fetchPinnedQuestions(jobId),
    enabled: !!jobId,
  })
}

/**
 * Provides pin, create-and-pin, and unpin mutations for questions on a specific job.
 *
 * All mutations invalidate the pinned questions query for the job.
 * `createAndPinMutation` additionally invalidates the question bank so the
 * new question appears in the bank as well as the pinned list.
 *
 * @param jobId - The job to pin/unpin questions on.
 * @returns `{ pinMutation, createAndPinMutation, unpinMutation }`
 */
export function usePinnedQuestionActions(jobId: number) {
  const userId = getCurrentUserId()
  const queryClient = useQueryClient()
  const queryKey = QUERY_KEYS.pinnedQuestions.forJob(userId, jobId)

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const pinMutation = useMutation({
    mutationFn: (interviewQuestionId: number) => pinQuestion(jobId, interviewQuestionId),
    onSuccess: invalidate,
    onError: () => toast.error('Failed to add question'),
  })

  const createAndPinMutation = useMutation({
    mutationFn: (data: Partial<InterviewQuestion>) => createAndPinQuestion(jobId, data),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.interviewQuestions.byUser(userId) })
      toast.success('Question saved!')
    },
    onError: () => toast.error('Failed to save question'),
  })

  const unpinMutation = useMutation({
    mutationFn: (interviewQuestionId: number) => unpinQuestion(jobId, interviewQuestionId),
    onSuccess: invalidate,
    onError: () => toast.error('Failed to remove question'),
  })

  return { pinMutation, createAndPinMutation, unpinMutation }
}

/**
 * Provides create, update, and delete mutations for the question bank (standalone questions).
 *
 * These mutations operate on `InterviewQuestion` records independently of any job.
 * For pinning questions to a job, use `usePinnedQuestionActions` instead.
 *
 * @returns `{ createMutation, updateMutation, deleteMutation }`
 */
export function useInterviewQuestionActions() {
  const userId = getCurrentUserId()
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.interviewQuestions.byUser(userId),
    })

  const createMutation = useMutation({
    mutationFn: (data: Partial<InterviewQuestion>) =>
      createInterviewQuestion(data),
    onSuccess: () => {
      invalidate()
      toast.success('Question saved!')
    },
    onError: () => toast.error('Failed to save question'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InterviewQuestion> }) =>
      updateInterviewQuestion(id, data),
    onSuccess: () => {
      invalidate()
    },
    onError: () => toast.error('Failed to update question'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInterviewQuestion(id),
    onSuccess: () => {
      invalidate()
      toast.success('Question deleted')
    },
    onError: () => toast.error('Failed to delete question'),
  })

  return { createMutation, updateMutation, deleteMutation }
}
