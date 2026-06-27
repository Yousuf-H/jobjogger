import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/api/notifications'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Fetches the current user's notifications with a 60-second polling interval.
 *
 * Polling is used in place of WebSocket push — the interval can be removed
 * once real-time delivery is implemented. The result includes both the
 * notifications array and `meta.unread_count` for the bell badge.
 *
 * @returns A TanStack `UseQueryResult` with `{ notifications, meta }`.
 */
export function useNotifications() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.notifications(userId),
    queryFn: fetchNotifications,
    // Poll every 60 s — no WebSocket support yet. Remove when real-time push is added.
    refetchInterval: 60000,
  })
}

/**
 * Provides mutations to mark individual or all notifications as read.
 *
 * Both mutations invalidate the notifications cache on success so the bell
 * badge count updates immediately.
 *
 * @returns `{ markReadMutation, markAllReadMutation }`
 */
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
