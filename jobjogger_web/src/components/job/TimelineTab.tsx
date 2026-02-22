import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TimelineEntry } from '@/types/timelineEntry'

interface TimelineTabProps {
  timelineEntries: TimelineEntry[]
}

function getEntryTypeColor(type: string) {
  switch (type) {
    case 'status_change':
      return 'bg-blue-500'
    case 'interview':
      return 'bg-green-500'
    case 'contact':
      return 'bg-purple-500'
    case 'note':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function TimelineTab({ timelineEntries }: TimelineTabProps) {
  return (
    <Card>
      <CardContent className="mt-4 space-y-6">
        {timelineEntries.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No timeline entries yet
          </p>
        ) : (
          <div className="space-y-6">
            {timelineEntries.map((entry, index) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      getEntryTypeColor(entry.entry_type)
                    )}
                  />
                  {index < timelineEntries.length - 1 && (
                    <div className="bg-border mt-2 h-full w-px" />
                  )}
                </div>

                <div className="flex-1 pb-6">
                  <div className="mb-1 flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {entry.entry_type.replaceAll('_', ' ')}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(entry.occurred_at)}
                    </span>
                  </div>
                  <p className="text-sm">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
