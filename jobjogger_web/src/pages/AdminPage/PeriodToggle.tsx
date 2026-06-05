import { Button } from '@/components/ui/button'
import type { StatPeriod } from '@/types/admin'

interface PeriodToggleProps {
  value: StatPeriod
  onChange: (period: StatPeriod) => void
}

const OPTIONS: { label: string; value: StatPeriod }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

export function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  return (
    <div className="flex rounded-md border">
      {OPTIONS.map((opt, i) => (
        <Button
          key={opt.value}
          type="button"
          variant={value === opt.value ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-7 text-xs ${i === 0 ? 'rounded-r-none' : i === OPTIONS.length - 1 ? 'rounded-l-none' : 'rounded-none border-x'}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
