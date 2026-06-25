import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { ActivityDataPoint } from '@/types/analytics'
import { Info } from 'lucide-react'
import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

interface ActivityChartProps {
  weekly: ActivityDataPoint[]
  monthly: ActivityDataPoint[]
}

function formatLabel(dateStr: string, mode: 'weekly' | 'monthly'): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (mode === 'monthly') {
    return date.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
  }
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

const chartConfig = {
  count: {
    label: 'Applications',
    color: 'var(--chart-brand)',
  },
}

export function ActivityChart({ weekly, monthly }: ActivityChartProps) {
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly')

  const rawData = mode === 'weekly' ? weekly : monthly
  const chartData = rawData.map((d) => ({
    label: formatLabel(d.period, mode),
    count: d.count,
  }))

  return (
    <div className="rounded-[10px] border border-border bg-card">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-foreground">Application activity</h2>
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="text-[12px] text-muted-foreground">Applications submitted over time</p>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="cursor-help">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="max-w-[240px] text-xs">
                {mode === 'weekly'
                  ? 'Each point shows applications submitted that week, using the date applied (or creation date if not set). Weeks are labelled by their start date (Monday).'
                  : 'Each point shows applications submitted that month, using the date applied (or creation date if not set).'}
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex rounded-md border border-border">
          <Button
            type="button"
            variant={mode === 'weekly' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 rounded-r-none text-xs"
            onClick={() => setMode('weekly')}
          >
            Weekly
          </Button>
          <Button
            type="button"
            variant={mode === 'monthly' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 rounded-l-none text-xs"
            onClick={() => setMode('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>

      <div className="px-5 pb-5">
        {chartData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-[13px] text-muted-foreground">No data yet</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-brand)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--chart-brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="count"
                type="natural"
                fill="url(#activityFill)"
                stroke="var(--chart-brand)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  )
}
