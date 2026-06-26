import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/api/notifications'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useNotifications() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.notifications(userId),
    queryFn: fetchNotifications,
    refetchInterval: 60000,
  })
}

export function useNotificationActions() {
  const queryClient = useQueryClient()
  const userId = getCurrentUserId()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications(userId) })

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
