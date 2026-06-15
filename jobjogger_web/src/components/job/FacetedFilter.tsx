import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, PlusCircle } from 'lucide-react'

interface FacetedFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface FacetedFilterProps {
  title: string
  options: FacetedFilterOption[]
  selected: Set<string>
  onSelectionChange: (selected: Set<string>) => void
}

export function FacetedFilter({
  title,
  options,
  selected,
  onSelectionChange,
}: FacetedFilterProps) {
  const isActive = selected.size > 0

  const toggleOption = (value: string) => {
    const next = new Set(selected)
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }
    onSelectionChange(next)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 h-8 rounded-full border px-3 text-xs font-normal whitespace-nowrap transition-colors cursor-pointer shrink-0',
            isActive
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
              : 'bg-background text-muted-foreground border-dashed border-border hover:text-foreground hover:bg-muted/60'
          )}
        >
          <PlusCircle className="h-3.5 w-3.5 shrink-0" />
          {title}
          {isActive && (
            <span className="ml-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-[5px] py-px text-[10px] font-medium leading-none">
              {selected.size}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-52 p-1">
        <div className="max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = selected.has(option.value)
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer',
                  'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                {option.icon && (
                  <option.icon className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>

        {isActive && (
          <>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={() => onSelectionChange(new Set())}
              className="flex w-full items-center justify-center rounded-sm py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              Clear
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
