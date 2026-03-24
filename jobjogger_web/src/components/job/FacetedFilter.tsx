import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Check, PlusCircle } from 'lucide-react'
import { useState } from 'react'

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
  const [open, setOpen] = useState(false)

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
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-8 border-dashed text-xs"
        onClick={() => setOpen(!open)}
      >
        <PlusCircle className="mr-2 h-3.5 w-3.5" />
        {title}
        {selected.size > 0 && (
          <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Badge
              variant="secondary"
              className="rounded-sm px-1 font-normal text-xs"
            >
              {selected.size}
            </Badge>
          </>
        )}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-md border bg-popover p-1 shadow-md">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => {
                const isSelected = selected.has(option.value)
                return (
                  <button
                    type='button'
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      'cursor-pointer'
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

            {selected.size > 0 && (
              <>
                <Separator className="my-1" />
                <button
                  type='button'
                  onClick={() => onSelectionChange(new Set())}
                  className="flex w-full items-center justify-center rounded-sm py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}