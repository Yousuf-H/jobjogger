import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { StageDurationDataPoint } from '@/types/analytics'
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'

interface StageDurationsProps {
  data: StageDurationDataPoint[]
}

const chartConfig = {
  avg_days: {
    label: 'Avg. days',
    color: '#185FA5',
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
    <div className="rounded-[10px] border border-border bg-card">
      <div className="px-5 py-4">
        <h2 className="text-[14px] font-semibold text-foreground">
          Average time between stages
        </h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Days from one stage to the next
        </p>
      </div>

      <div className="px-5 pb-5">
        {chartData.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center">
            <p className="text-[13px] text-muted-foreground">
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
                width={140}
              />
              <Bar
                dataKey="avg_days"
                fill="var(--color-avg_days)"
                radius={5}
                barSize={20}
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
      </div>
    </div>
  )
}
