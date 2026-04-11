export type OrgSize = '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'

export const ORG_SIZES: OrgSize[] = ['1-10', '11-50', '51-200', '201-1000', '1000+']

export interface OrgJob {
  id: number
  job_title: string
  status: string
  archived_at: string | null
}

export interface Organisation {
  id: number
  name: string
  website?: string | null
  industry?: string | null
  size?: OrgSize | null
  rating?: number | null
  notes?: string | null
  aliases: string[]
  needs_review: boolean
  user_id: number
  created_at: string
  updated_at: string
  jobs?: OrgJob[]
  active_jobs_count?: number
  total_jobs_count?: number
}
