import { Button } from '@/components/ui/button'
import { TypographyH3 } from '@/components/ui/typography'
import type { LucideIcon } from 'lucide-react'

interface EmptyTabStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyTabState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyTabStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
      <div className="bg-muted mb-4 rounded-full p-3">
        <Icon className="text-muted-foreground h-5 w-5" />
      </div>

      <TypographyH3 className="text-lg font-semibold">{title}</TypographyH3>

      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
        {description}
      </p>

      {actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
