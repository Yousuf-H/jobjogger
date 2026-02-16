import { apiClient } from './client'
import type { TimelineEntry } from '@/types/timelineEntry'

export async function createTimelineEntry(job_id: number, data: Partial<TimelineEntry>): Promise<TimelineEntry> {

  const response = await apiClient.post(`/jobs/${job_id}/timeline_entries`, { timeline_entry: data })

  return response.data.timeline_entry
}

export async function updateTimelineEntry(id: number, data: TimelineEntry): Promise<TimelineEntry> {
  const response = await apiClient.patch(`/timeline_entries/${id}`, { timeline_entry: data })

  return response.data.timeline_entry
}

export async function deleteTimelineEntry(id: number): Promise<void> {
  await apiClient.delete(`/timeline_entries/${id}`)
}