export interface LinkedJob {
  id: number
  company_name: string
  job_title: string
}

export interface ResumeVariant {
  id: number
  resume_template_id: number
  template_name: string
  notes?: string
  pdf_url: string | null
  pdf_filename: string | null
  linked_jobs: LinkedJob[]
  created_at: string
  updated_at: string
}

export interface ResumeTemplate {
  id: number
  name: string
  notes?: string
  variant_count: number
  pdf_url: string | null
  pdf_filename: string | null
  created_at: string
  updated_at: string
}

export interface ResumeTemplateWithVariants extends ResumeTemplate {
  variants: ResumeVariant[]
}
