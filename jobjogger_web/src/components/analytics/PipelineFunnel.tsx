import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart'
import type { FunnelDataPoint } from '@/types/analytics'
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts'

interface PipelineFunnelProps {
  data: FunnelDataPoint[]
}

const STATUS_COLORS: Record<string, string> = {
  wishlist: 'var(--status-wishlist)',
  applied: 'var(--status-applied)',
  phone_screen: 'var(--status-phone-screen)',
  interviewing: 'var(--status-interviewing)',
  offer: 'var(--status-offer)',
  accepted: 'var(--status-accepted)',
  rejected: 'var(--status-rejected)',
  ghosted: 'var(--status-ghosted)',
  withdrawn: 'var(--status-withdrawn)',
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  const chartData = data.map((d) => ({
    status: formatStatus(d.status),
    count: d.count,
    rawStatus: d.status,
  }))

  const chartConfig = Object.fromEntries(
    data.map((d) => [
      d.status,
      {
        label: formatStatus(d.status),
        color: STATUS_COLORS[d.status] || '#888',
      },
    ])
  ) satisfies ChartConfig

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
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: Math.max(data.length * 40 + 20, 200) }}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: -10, right: 40 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="status"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
                fontSize={12}
              />
              <Bar dataKey="count" radius={5} barSize={24}>
                <LabelList
                  dataKey="count"
                  position="right"
                  fontSize={12}
                  fontWeight={500}
                />
                {chartData.map((entry) => (
                  <Cell
                    key={entry.rawStatus}
                    fill={STATUS_COLORS[entry.rawStatus] || '#888'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}