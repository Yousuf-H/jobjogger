export const INTERACTION_TYPES = [
  'email',
  'call',
  'coffee_chat',
  'linkedin',
  'interview',
  'other',
] as const

export type InteractionType = (typeof INTERACTION_TYPES)[number]

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  email: 'Email',
  call: 'Call',
  coffee_chat: 'Coffee Chat',
  linkedin: 'LinkedIn',
  interview: 'Interview',
  other: 'Other',
}

export interface ContactInteraction {
  id: number
  contact_id: number
  interaction_type: InteractionType
  notes?: string | null
  occurred_at: string
  created_at: string
  updated_at: string
}

export interface ContactJob {
  id: number
  job_title: string
  status: string
  company_name: string
}

export interface Contact {
  id: number
  user_id: number
  organisation_id?: number | null
  organisation?: { id: number; name: string } | null
  name: string
  role?: string | null
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  notes?: string | null
  jobs?: ContactJob[]
  contact_interactions?: ContactInteraction[]
  created_at: string
  updated_at: string
}
