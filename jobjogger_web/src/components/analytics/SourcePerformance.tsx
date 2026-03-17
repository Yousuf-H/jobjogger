import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { SourcePerformanceDataPoint } from '@/types/analytics'

interface SourcePerformanceProps {
  data: SourcePerformanceDataPoint[]
}

function formatSource(source: string): string {
  return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function SourcePerformance({ data }: SourcePerformanceProps) {
  const chartData = data.map((d) => ({
    source: formatSource(d.source),
    applied: d.applied,
    got_interview: d.got_interview,
  }))

  const hasData = data.some((d) => d.applied > 0 || d.got_interview > 0)

  const chartConfig = {
    applied: {
      label: 'Applied',
      color: '#378ADD',
    },
    got_interview: {
      label: 'Got interview',
      color: '#5DCAA5',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response rate by source</CardTitle>
        <p className="text-muted-foreground text-sm">
          Which sources lead to interviews
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground text-sm">No data yet</p>
          </div>
        ) : (
          <>
            <div className="text-muted-foreground mb-3 flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: '#378ADD' }}
                />
                Applied
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: '#5DCAA5' }}
                />
                Got interview
              </span>
            </div>

            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="source"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="applied"
                  fill="var(--color-applied)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="got_interview"
                  fill="var(--color-got_interview)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}