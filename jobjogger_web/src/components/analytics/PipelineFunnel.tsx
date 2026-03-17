import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FunnelDataPoint } from '@/types/analytics'

interface PipelineFunnelProps {
  data: FunnelDataPoint[]
}

const STATUS_COLORS: Record<string, string> = {
  wishlist: '#9ca3af',
  applied: '#378ADD',
  phone_screen: '#5DCAA5',
  interviewing: '#EF9F27',
  offer: '#97C459',
  accepted: '#639922',
  rejected: '#E24B4A',
  ghosted: '#888780',
  withdrawn: '#D4537E',
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline funnel</CardTitle>
        <p className="text-muted-foreground text-sm">
          Current snapshot of jobs at each stage
        </p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground text-sm">No data yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((item) => {
              const pct = Math.round((item.count / maxCount) * 100)
              return (
                <div
                  key={item.status}
                  className="flex items-center gap-3"
                >
                  <span className="text-muted-foreground w-28 shrink-0 text-right text-sm">
                    {formatStatus(item.status)}
                  </span>
                  <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[item.status] || '#888',
                        minWidth: item.count > 0 ? '4px' : '0px',
                      }}
                    />
                  </div>
                  <span className="w-8 text-sm font-medium">{item.count}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}