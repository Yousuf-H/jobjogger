import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts'

interface StatusData {
  status: string
  count: number
  fill: string
}

interface StatusChartProps {
  data: StatusData[]
}

export function StatusChart({ data }: StatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const chartData = data.filter((item) => item.count > 0)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
          <p className="text-muted-foreground text-sm">
            Distribution of applications across stages
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No applications to display
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = Object.fromEntries(
    chartData.map((item) => [
      item.status,
      {
        label: item.status.replaceAll('_', ' '),
        color: item.fill,
      },
    ])
  )

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Pipeline Overview</CardTitle>
        <p className="text-muted-foreground text-sm">
          Distribution of applications across stages
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid items-center gap-8 md:grid-cols-2">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center gap-2">
                          <span className="capitalize">
                            {String(name).replaceAll('_', ' ')}
                          </span>
                          <span className="font-bold">{value}</span>
                        </div>
                      )}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="space-y-3 rounded-md border p-4">
            {chartData.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm capitalize">
                    {item.status.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.count}</span>
                  <span className="text-muted-foreground text-xs">
                    ({Math.round((item.count / total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
