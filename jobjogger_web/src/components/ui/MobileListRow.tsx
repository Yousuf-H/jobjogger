import { cn } from '@/lib/utils'

interface MobileListRowProps {
  initial: string
  avatarColor: string
  onClick: () => void
  children: React.ReactNode
}

export function MobileListRow({ initial, avatarColor, onClick, children }: MobileListRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/40 last:border-0 focus-visible:outline-none focus-visible:bg-blue-50 dark:focus-visible:bg-blue-900/20"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold mt-0.5', avatarColor)}>
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  )
}
