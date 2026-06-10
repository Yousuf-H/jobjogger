import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/api/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

function getUserId(): string {
  return JSON.parse(localStorage.getItem('user') || '{}').id
}

export function useNotifications() {
  const userId = getUserId()

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: fetchNotifications,
    refetchInterval: 60000,
  })
}

export function useNotificationActions() {
  const queryClient = useQueryClient()
  const userId = getUserId()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['notifications', userId] })

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  })

  return { markReadMutation, markAllReadMutation }
}
