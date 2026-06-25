import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
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
    color: 'var(--chart-brand)',
  },
  got_interview: {
    label: 'Got interview',
    color: 'var(--chart-brand-muted)',
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
    <div className="rounded-[10px] border border-border bg-card">
      <div className="px-5 py-4">
        <h2 className="text-[14px] font-semibold text-foreground">Response rate by source</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">Which sources lead to interviews</p>
      </div>

      <div className="px-5 pb-5">
        {!hasData ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-[13px] text-muted-foreground">No data yet</p>
          </div>
        ) : (
          <>
            {/* Horizontally scrollable on mobile so bars/labels don't squish */}
            <div className="overflow-x-auto">
              <div style={{ minWidth: Math.max(chartData.length * 100, 320) }}>
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <BarChart accessibilityLayer data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="source"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      fontSize={11}
                    />
                    <Bar dataKey="applied" fill="var(--color-applied)" radius={4} barSize={24}>
                      <LabelList dataKey="applied" position="top" fontSize={11} offset={4} />
                    </Bar>
                    <Bar dataKey="got_interview" fill="var(--color-got_interview)" radius={4} barSize={24}>
                      <LabelList dataKey="got_interview" position="top" fontSize={11} offset={4} />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </div>

            {/* Custom legend — squares, no dot circles */}
            <div className="mt-3 flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <div className="h-[10px] w-[10px] rounded-[2px]" style={{ background: 'var(--chart-brand)' }} />
                <span className="text-[11px] text-muted-foreground">Applied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-[10px] w-[10px] rounded-[2px]" style={{ background: 'var(--chart-brand-muted)' }} />
                <span className="text-[11px] text-muted-foreground">Got interview</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
