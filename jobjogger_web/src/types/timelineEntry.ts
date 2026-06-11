export type TimelineEntryType =
  | 'note'
  | 'contact'
  | 'interview'
  | 'assessment'
  | 'follow_up'
  | 'status_change'

export interface TimelineEntry {
  id: number
  job_id: number
  entry_type: TimelineEntryType
  description: string
  occurred_at: string
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ActivityEntry extends TimelineEntry {
  company_name: string
  job_title: string
}

export interface ActivityMeta {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ActivityResponse {
  entries: ActivityEntry[]
  meta: ActivityMeta
}
