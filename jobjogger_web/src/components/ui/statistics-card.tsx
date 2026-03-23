import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatisticsCardProps = {
  icon: ReactNode
  value: string
  title: string
  subtitle?: string
  className?: string
}

const StatisticsCard = ({ icon, value, title, subtitle, className }: StatisticsCardProps) => {
  return (
    <Card className={cn('gap-3', className)}>
      <CardHeader className='flex items-center gap-3 flex-row'>
        <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md lg:size-10'>
          {icon}
        </div>
        <span className='items-center justify-center text-lg font-medium lg:text-2xl'>{value}</span>
      </CardHeader>
      <CardContent className='flex flex-col gap-1'>
        <span className='text-sm font-semibold lg:text-base'>{title}</span>
        {subtitle && (
          <span className='text-muted-foreground text-xs lg:text-sm'>{subtitle}</span>
        )}
      </CardContent>
    </Card>
  )
}

export default StatisticsCard