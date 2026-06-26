import { cn } from '@/lib/utils'

interface MetaItemProps {
  /** A Lucide (or compatible) icon component rendered inside the icon box. */
  icon: React.ElementType
  /** Short label displayed above the children (e.g. `"Applied"`, `"Company"`). */
  label: string
  /** The primary value — typically a `<span>` or text node. */
  children: React.ReactNode
  className?: string
}

/**
 * A single metadata cell used in the job/contact/organisation detail header bar.
 *
 * Renders an icon box, a small uppercase label, and the value as children.
 * Cells are separated by a right border; the `last:` variant removes it from
 * the final item automatically.
 *
 * Used inside a flex row on `JobDetailPage`, `ContactDetailPage`, and
 * `OrganisationDetailPage` to display key attributes at a glance.
 */
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
