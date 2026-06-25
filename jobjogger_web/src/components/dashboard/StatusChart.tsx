import { getStatusConfig } from '@/lib/statusConfig'

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

  return (
    <div className="flex flex-col gap-4 rounded-[10px] border border-border bg-card p-5">
      <div>
        <h2 className="text-[14px] font-semibold text-foreground">Application pipeline</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Where your applications stand right now
        </p>
      </div>

      <div
        className="overflow-hidden rounded-[8px]"
        style={{ display: 'flex', height: 8 }}
      >
        {total === 0 ? (
          <div className="w-full bg-muted/50" />
        ) : (
          data.filter((item) => item.count > 0).map((item) => (
            <div
              key={item.status}
              style={{
                width: `${(item.count / total) * 100}%`,
                backgroundColor: item.fill,
              }}
            />
          ))
        )}
      </div>

      <div className="flex flex-col">
        {data.map((item, i) => {
          const label = getStatusConfig(item.status).label
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
          const isLast = i === data.length - 1
          return (
            <div
              key={item.status}
              className={`flex items-center gap-3 py-2.5 ${isLast ? '' : 'border-b border-border/60'}`}
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="flex-1 text-[12px] text-foreground/80">{label}</span>
              <span className="text-[12px] font-medium text-foreground">{item.count}</span>
              <span className="w-9 text-right text-[11px] text-muted-foreground">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
