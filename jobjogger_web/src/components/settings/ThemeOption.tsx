import { cn } from '@/lib/utils'

export function ThemeOption({
  value,
  current,
  icon: Icon,
  label,
  description,
  onSelect,
}: {
  value: string
  current: string | undefined
  icon: React.ElementType
  label: string
  description: string
  onSelect: (value: string) => void
}) {
  const isActive = current === value

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-colors',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 bg-card'
      )}
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </div>
    </button>
  )
}
