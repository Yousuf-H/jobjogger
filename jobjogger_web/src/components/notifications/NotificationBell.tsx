import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotificationActions, useNotifications } from '@/hooks/useNotifications'
import type { Notification, NotificationKind } from '@/types/notification'
import {
  IconBell,
  IconCalendarDue,
  IconCheck,
  IconClock,
  IconMessage,
  IconUserCheck,
} from '@tabler/icons-react'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const KIND_ICONS: Record<NotificationKind, React.ElementType> = {
  stage_stall: IconClock,
  deadline_reminder: IconCalendarDue,
  follow_up_due: IconMessage,
  interview_reminder: IconUserCheck,
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification
  onRead: (id: number) => void
}) {
  const navigate = useNavigate()
  const Icon = KIND_ICONS[notification.kind]
  const isUnread = notification.read_at === null

  const handleClick = () => {
    if (isUnread) onRead(notification.id)
    if (notification.job) navigate(`/jobs/${notification.job.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
        isUnread ? 'bg-muted/30' : ''
      }`}
    >
      <div className="mt-0.5 shrink-0">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">{notification.body}</p>
        {notification.job && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {notification.job.job_title} · {notification.job.company_name}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {isUnread && (
        <div className="mt-1.5 shrink-0 size-2 rounded-full bg-primary" />
      )}
    </button>
  )
}

/**
 * Navigation bell icon that shows the unread notification count and a popover inbox.
 *
 * Notifications are fetched via `useNotifications`, which polls every 60 seconds.
 * The red badge on the icon displays `unread_count` from the response meta; counts
 * above 9 are capped at `"9+"`. Clicking a notification marks it read and navigates
 * to the linked job if one exists. The "Mark all as read" button is only shown when
 * there are unread items.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data } = useNotifications()
  const { markReadMutation, markAllReadMutation } = useNotificationActions()

  const notifications = data?.notifications ?? []
  const unreadCount = data?.meta.unread_count ?? 0

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate(id)
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconBell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <IconCheck className="size-8" />
              <p className="text-sm">You're all caught up</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={handleMarkRead} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
