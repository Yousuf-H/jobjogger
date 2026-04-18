import type { Interview, InterviewQuestion } from '@/types/interview'
import { apiClient } from './client'

// --- Interviews ---

export async function fetchInterviews(jobId: number): Promise<Interview[]> {
  const response = await apiClient.get(`/jobs/${jobId}/interviews`)
  return response.data
}

export async function createInterview(
  jobId: number,
  data: Partial<Interview>
): Promise<Interview> {
  const response = await apiClient.post(`/jobs/${jobId}/interviews`, {
    interview: data,
  })
  return response.data
}

export async function updateInterview(
  jobId: number,
  id: number,
  data: Partial<Interview>
): Promise<Interview> {
  const response = await apiClient.patch(`/jobs/${jobId}/interviews/${id}`, {
    interview: data,
  })
  return response.data
}

export async function deleteInterview(
  jobId: number,
  id: number
): Promise<void> {
  await apiClient.delete(`/jobs/${jobId}/interviews/${id}`)
}

// --- Interview Questions ---

export async function fetchInterviewQuestions(params?: {
  scope?: 'personal' | 'job' | 'org'
  job_id?: number
  organisation_id?: number
  category?: string
}): Promise<InterviewQuestion[]> {
  const response = await apiClient.get('/interview_questions', { params })
  return response.data
}

export async function createInterviewQuestion(
  data: Partial<InterviewQuestion>
): Promise<InterviewQuestion> {
  const response = await apiClient.post('/interview_questions', {
    interview_question: data,
  })
  return response.data
}

export async function updateInterviewQuestion(
  id: number,
  data: Partial<InterviewQuestion>
): Promise<InterviewQuestion> {
  const response = await apiClient.patch(`/interview_questions/${id}`, {
    interview_question: data,
  })
  return response.data
}

export async function deleteInterviewQuestion(id: number): Promise<void> {
  await apiClient.delete(`/interview_questions/${id}`)
}
