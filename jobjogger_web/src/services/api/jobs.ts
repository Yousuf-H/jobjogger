import { apiClient } from './client'
import type { Job, JobFilters } from '@/types/job'
import type { TimelineEntry } from '@/types/timelineEntry'

export async function fetchJobs(filters?: JobFilters): Promise<Job[]> {
  const response = await apiClient.get('/jobs', {
    params: filters
  })

  return response.data.jobs
}

export async function fetchJob(id: number): Promise<{ job: Job, timeline_entries: TimelineEntry[] }> {
  const response = await apiClient.get(`/jobs/${id}`)

  return { job: response.data.job, timeline_entries: response.data.timeline_entries }
}

export async function createJob(data: Partial<Job>): Promise<Job> {
  const response = await apiClient.post(`/jobs`, { job: data })

  return response.data.job
}

export async function updateJob(id: number, data: Job): Promise<Job> {
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

