import type { Job, JobFilters } from '@/types/job'
import type { TimelineEntry } from '@/types/timelineEntry'
import { z } from 'zod'
import { apiClient } from './client'

const jobSchema = z.object({
  id: z.number(),
  company_name: z.string(),
  job_title: z.string(),
  status: z.string(),
  tags: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
})

const jobsResponseSchema = z.array(jobSchema)

const jobDetailResponseSchema = z.object({
  job: jobSchema,
  timeline_entries: z.array(z.object({ id: z.number() })),
})

export async function fetchJobs(filters?: JobFilters): Promise<Job[]> {
  const response = await apiClient.get('/jobs', {
    params: filters,
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return

        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(`${key}[]`, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      })

      return searchParams.toString()
    },
  })
  jobsResponseSchema.parse(response.data)
  return response.data as Job[]
}

export async function fetchJob(
  id: number
): Promise<{ job: Job; timeline_entries: TimelineEntry[] }> {
  const response = await apiClient.get(`/jobs/${id}`)
  jobDetailResponseSchema.parse(response.data)
  return {
    job: response.data.job as Job,
    timeline_entries: response.data.timeline_entries as TimelineEntry[],
  }
}

export async function createJob(data: Partial<Job>): Promise<Job> {
  const response = await apiClient.post('/jobs', { job: data })

  return response.data.job
}

export async function updateJob(id: number, data: Partial<Job>): Promise<Job> {
  const response = await apiClient.patch(`/jobs/${id}`, { job: data })

  return response.data.job
}

export async function deleteJob(id: number): Promise<void> {
  await apiClient.delete(`/jobs/${id}`)
}

export async function archiveJob(id: number): Promise<Job> {
  const response = await apiClient.patch(`/jobs/${id}/archive`)

  return response.data.job
}

export async function unarchiveJob(id: number): Promise<Job> {
  const response = await apiClient.patch(`/jobs/${id}/unarchive`)

  return response.data.job
}

export async function analyseResume(jobId: number): Promise<ResumeMatchResult> {
  // Gemini responses can take 20-30 s; override the global 20 s client timeout for this call only.
  const response = await apiClient.post(`/jobs/${jobId}/analyse_resume`, undefined, { timeout: 60000 })
  return response.data as ResumeMatchResult
}

export interface ResumeMatchResult {
  score: number
  strengths: string[]
  weaknesses: string[]
  missing_keywords: string[]
  cached: boolean
}
