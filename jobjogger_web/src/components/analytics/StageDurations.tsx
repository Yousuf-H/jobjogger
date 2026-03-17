import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { StageDurationDataPoint } from '@/types/analytics'

interface StageDurationsProps {
  data: StageDurationDataPoint[]
}

export function StageDurations({ data }: StageDurationsProps) {
  const chartData = data
    .filter((d) => d.avg_days !== null)
    .map((d) => ({
      label: d.label,
      avg_days: d.avg_days,
    }))

  const chartConfig = {
    avg_days: {
      label: 'Avg. days',
      color: '#7F77DD',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average time between stages</CardTitle>
        <p className="text-muted-foreground text-sm">
          Days from one stage to the next
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Not enough status transitions to calculate
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="w-full"
            style={{ height: Math.max(chartData.length * 50 + 40, 180) }}
          >
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v) => `${v}d`}
              />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={160}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${value} days`}
                  />
                }
              />
              <Bar
                dataKey="avg_days"
                fill="var(--color-avg_days)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}