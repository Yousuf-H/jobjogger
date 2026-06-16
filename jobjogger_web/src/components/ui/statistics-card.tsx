import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type StatisticsCardProps = {
  icon: ReactNode
  value: string
  title: string
  subtitle?: string
  className?: string
  iconClassName?: string
  cardClassName?: string
  textClassName?: string
}

const StatisticsCard = ({
  icon,
  value,
  title,
  subtitle,
  className,
  iconClassName,
  cardClassName,
  textClassName,
}: StatisticsCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl p-4 lg:p-5',
        cardClassName ?? 'bg-card border',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px]',
            iconClassName ?? 'bg-primary/10 text-primary'
          )}
        >
          {icon}
        </div>
        <span className={cn('text-lg font-bold lg:text-2xl', textClassName)}>
          {value}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={cn('text-sm font-semibold lg:text-base', textClassName)}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className={cn(
              'text-xs lg:text-sm',
              textClassName ? 'opacity-70' : 'text-muted-foreground'
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

export default StatisticsCard
