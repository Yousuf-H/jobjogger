export const INTERVIEW_TYPES = [
  'phone_screen',
  'technical',
  'panel',
  'final',
  'other',
] as const

export const INTERVIEW_FORMATS = ['video', 'phone', 'in_person'] as const

export const INTERVIEW_OUTCOMES = ['pending', 'passed', 'failed'] as const

export type InterviewType = (typeof INTERVIEW_TYPES)[number]
export type InterviewFormat = (typeof INTERVIEW_FORMATS)[number]
export type InterviewOutcome = (typeof INTERVIEW_OUTCOMES)[number]

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  phone_screen: 'Phone Screen',
  technical: 'Technical',
  panel: 'Panel',
  final: 'Final',
  other: 'Other',
}

export const INTERVIEW_FORMAT_LABELS: Record<InterviewFormat, string> = {
  video: 'Video',
  phone: 'Phone',
  in_person: 'In Person',
}

export const INTERVIEW_OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  pending: 'Pending',
  passed: 'Passed',
  failed: 'Failed',
}

export interface Interview {
  id: number
  job_id: number
  scheduled_at: string
  interview_type: InterviewType
  format?: InterviewFormat | null
  location_or_link?: string | null
  prep_notes?: string | null
  debrief_notes?: string | null
  outcome: InterviewOutcome
  created_at: string
  updated_at: string
}

export const QUESTION_CATEGORIES = [
  'behavioural',
  'technical',
  'questions_to_ask',
] as const

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number]

export const QUESTION_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  behavioural: 'Behavioural',
  technical: 'Technical',
  questions_to_ask: 'Questions to Ask',
}

export interface InterviewQuestion {
  id: number
  user_id: number
  job_id?: number | null
  organisation_id?: number | null
  question: string
  answer?: string | null
  category: QuestionCategory
  is_favourite: boolean
  created_at: string
  updated_at: string
}
