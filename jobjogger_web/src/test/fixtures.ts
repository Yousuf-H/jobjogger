import type { Job } from '@/types/job'
import type { User } from '@/types/user'

export const testUser: User = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  job_title: null,
  phone: null,
  location: null,
  linkedin_url: null,
  notify_follow_up_reminders: true,
  notify_interview_reminders: true,
  notify_stage_stall: true,
  notify_deadline_reminder: true,
  theme: 'light',
  default_follow_up_days: 7,
  avatar_url: null,
  demo: false,
  admin: false,
  terms_agreed_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  google_linked: false,
  has_password: true,
}

export const testJob: Job = {
  id: 1,
  company_name: 'ACME Corp',
  job_title: 'Software Engineer',
  status: 'applied',
  tags: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

export const testJobList: Job[] = [
  testJob,
  {
    id: 2,
    company_name: 'Globex',
    job_title: 'Senior Developer',
    status: 'interviewing',
    tags: ['remote'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

export function makeJob(overrides: Partial<Job> = {}): Job {
  return { ...testJob, ...overrides }
}
