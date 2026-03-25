import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart'
import type { StageDurationDataPoint } from '@/types/analytics'
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'

interface StageDurationsProps {
  data: StageDurationDataPoint[]
}

const chartConfig = {
  avg_days: {
    label: 'Avg. days',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

export function StageDurations({ data }: StageDurationsProps) {
  const chartData = data
    .filter((d) => d.avg_days !== null)
    .map((d) => ({
      label: d.label,
      avg_days: d.avg_days,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average time between stages</CardTitle>
        <CardDescription>Days from one stage to the next</CardDescription>
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
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: -10, right: 50 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={90}
              />
              <Bar
                dataKey="avg_days"
                fill="var(--color-avg_days)"
                radius={5}
                barSize={24}
              >
                <LabelList
                  dataKey="avg_days"
                  position="right"
                  fontSize={12}
                  fontWeight={500}
                  formatter={(value: number) => `${value}d`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}