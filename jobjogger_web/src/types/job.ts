type JobStatus = 'wishlist' | 'applied' | 'phone_screen' | 'interviewing' | 'offer' | 'accepted' | 'rejected' | 'ghosted' | 'withdrawn'

type EmploymentType = 'full_time' | 'part_time' | 'casual' | 'contract'

type JobSource = 'seek' | 'linkedin' | 'referral' | 'company_site' | 'other'

type Priority = 'low' | 'medium' | 'high' | null

export interface Job {
  id: number
  company_name: string
  job_title: string
  status: JobStatus
  location?: string
  employment_type?: EmploymentType
  salary_range?: string
  source?: JobSource
  source_other?: string
  job_url?: string
  job_description?: string
  priority?: Priority
  next_action?: string
  follow_up_date?: string
  notes?: string
  tags: string[]
  date_applied?: string
  archived_at?: string
  created_at: string
  updated_at: string
}

export interface JobFilters {
  status?: JobStatus[]
  source?: JobSource
  tags_any?: string[]
  employment_type?: EmploymentType
  priority?: Priority
  overdue?: boolean
  due_this_week?: boolean
  archived?: boolean
  search?: string
  sort?: 'created_at' | 'date_applied' | 'follow_up_date' | 'priority'
  direction?: 'asc' | 'desc'
}