export interface User {
  id: number
  email: string
  name: string
  job_title: string | null
  phone: string | null
  location: string | null
  linkedin_url: string | null
  notify_follow_up_reminders: boolean
  notify_interview_reminders: boolean
  avatar_url?: string | null
  demo: boolean
  admin: boolean
  terms_agreed_at: string | null
  created_at: string
  google_linked: boolean
  has_password: boolean
}
