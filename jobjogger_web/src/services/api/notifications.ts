import type { Notification, NotificationsResponse } from '@/types/notification'
import { apiClient } from './client'

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const response = await apiClient.get('/notifications')
  return response.data
}

export async function markNotificationRead(id: number): Promise<Notification> {
  const response = await apiClient.patch(`/notifications/${id}/read`)
  return response.data
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/notifications/read_all')
}
