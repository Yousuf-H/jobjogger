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

export function useInterviews(jobId: number | undefined) {
  const userId = getCurrentUserId()
  return useQuery({
    queryKey: QUERY_KEYS.interviews.forJob(userId, jobId),
    queryFn: () => fetchInterviews(Number(jobId)),
    enabled: !!jobId,
  })
}

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

export function usePinnedQuestions(jobId: number) {
  const userId = getCurrentUserId()
  return useQuery({
    queryKey: QUERY_KEYS.pinnedQuestions.forJob(userId, jobId),
    queryFn: () => fetchPinnedQuestions(jobId),
    enabled: !!jobId,
  })
}

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
