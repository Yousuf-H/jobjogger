export type NotificationKind =
  | 'stage_stall'
  | 'deadline_reminder'
  | 'follow_up_due'
  | 'interview_reminder'

export interface Notification {
  id: number
  kind: NotificationKind
  body: string
  read_at: string | null
  created_at: string
  job?: {
    id: number
    job_title: string
    company_name: string
  }
}

export interface NotificationsResponse {
  notifications: Notification[]
  meta: {
    unread_count: number
  }
}
