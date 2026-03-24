import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { SourcePerformanceDataPoint } from '@/types/analytics'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts'

interface SourcePerformanceProps {
  data: SourcePerformanceDataPoint[]
}

function formatSource(source: string): string {
  return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const chartConfig = {
  applied: {
    label: 'Applied',
    color: 'var(--status-applied)',
  },
  got_interview: {
    label: 'Got interview',
    color: 'var(--status-phone-screen)',
  },
} satisfies ChartConfig

export function SourcePerformance({ data }: SourcePerformanceProps) {
  const chartData = data.map((d) => ({
    source: formatSource(d.source),
    applied: d.applied,
    got_interview: d.got_interview,
  }))

  const hasData = data.some((d) => d.applied > 0 || d.got_interview > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response rate by source</CardTitle>
        <CardDescription>Which sources lead to interviews</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground text-sm">No data yet</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="source"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="applied" fill="var(--color-applied)" radius={4} barSize={24}>
                <LabelList
                  dataKey="applied"
                  position="top"
                  fontSize={11}
                  offset={4}
                />
              </Bar>
              <Bar dataKey="got_interview" fill="var(--color-got_interview)" radius={4} barSize={24}>
                <LabelList
                  dataKey="got_interview"
                  position="top"
                  fontSize={11}
                  offset={4}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}