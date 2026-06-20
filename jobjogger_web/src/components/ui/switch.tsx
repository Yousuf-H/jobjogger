import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
}

export function Switch({ checked, onCheckedChange, disabled = false, id }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex w-[34px] h-[20px] shrink-0 rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted border border-border'
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[16px]' : 'translate-x-[2px]'
        )}
      />
    </button>
  )
}
