import {
  createInterview,
  createInterviewQuestion,
  deleteInterview,
  deleteInterviewQuestion,
  fetchInterviewQuestions,
  fetchInterviews,
  updateInterview,
  updateInterviewQuestion,
} from '@/services/api/interviews'
import type { Interview, InterviewQuestion } from '@/types/interview'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

function getUserId(): string {
  return JSON.parse(localStorage.getItem('user') || '{}').id
}

// --- Interviews ---

export function useInterviews(jobId: number | undefined) {
  const userId = getUserId()
  return useQuery({
    queryKey: ['interviews', userId, jobId],
    queryFn: () => fetchInterviews(Number(jobId)),
    enabled: !!jobId,
  })
}

export function useInterviewActions(jobId: number) {
  const userId = getUserId()
  const queryClient = useQueryClient()
  const queryKey = ['interviews', userId, jobId]

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

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

export function useInterviewQuestions(params?: {
  scope?: 'personal' | 'job' | 'org'
  job_id?: number
  organisation_id?: number
  category?: string
}) {
  const userId = getUserId()
  return useQuery({
    queryKey: ['interview_questions', userId, params],
    queryFn: () => fetchInterviewQuestions(params),
    enabled: params?.scope !== 'job' || !!params?.job_id,
  })
}

export function useInterviewQuestionActions() {
  const userId = getUserId()
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['interview_questions', userId],
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
