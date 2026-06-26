import { cn } from '@/lib/utils'

interface MetaItemProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  className?: string
}

export function MetaItem({ icon: Icon, label, children, className }: MetaItemProps) {
  return (
    <div className={cn('flex items-center gap-[8px] pr-[20px] mr-[20px] border-r border-border last:border-r-0 last:pr-0 last:mr-0', className)}>
      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-muted border border-border/60">
        <Icon className="h-[13px] w-[13px] text-muted-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
        {children}
      </div>
    </div>
  )
}
