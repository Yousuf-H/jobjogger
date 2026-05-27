export type JobStatus =
  | 'wishlist'
  | 'applied'
  | 'phone_screen'
  | 'interviewing'
  | 'offer'
  | 'accepted'
  | 'rejected'
  | 'ghosted'
  | 'withdrawn'

export type JobEmploymentType =
  | 'full_time'
  | 'part_time'
  | 'casual'
  | 'contract'

export type JobSource =
  | 'seek'
  | 'linkedin'
  | 'referral'
  | 'company_site'
  | 'other'

export const TERMINAL_STATUSES: JobStatus[] = ['accepted', 'rejected', 'ghosted', 'withdrawn']

export const ALL_JOB_STATUSES: JobStatus[] = [
  'wishlist', 'applied', 'phone_screen', 'interviewing', 'offer',
  'accepted', 'rejected', 'ghosted', 'withdrawn',
]

export type JobPriority = 'low' | 'medium' | 'high' | null

export type JobSort =
  | 'created_at'
  | 'date_applied'
  | 'follow_up_date'
  | 'priority'

export type JobSortDirection = 'asc' | 'desc'

export interface Job {
  id: number
  company_name: string
  job_title: string
  status: JobStatus
  location?: string
  employment_type?: JobEmploymentType
  salary_range?: string
  source?: JobSource
  source_other?: string
  job_url?: string
  job_description?: string
  priority?: JobPriority
  next_action?: string
  follow_up_date?: string
  notes?: string
  tags: string[]
  date_applied?: string
  archived_at?: string
  organisation_id?: number | null
  resume_variant_id?: number | null
  next_interview_at?: string | null
  created_at: string
  updated_at: string
}

export interface JobFilters {
  status?: JobStatus[]
  tags_any?: string[]
  employment_type?: JobEmploymentType
  priority?: JobPriority[]
  source?: JobSource[]
  overdue?: boolean
  due_this_week?: boolean
  archived?: boolean
  search?: string
  sort?: JobSort
  direction?: JobSortDirection
}
