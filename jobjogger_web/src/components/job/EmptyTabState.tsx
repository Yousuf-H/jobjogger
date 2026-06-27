import { Button } from '@/components/ui/button'
import { TypographyH3 } from '@/components/ui/typography'
import type { LucideIcon } from 'lucide-react'

interface EmptyTabStateProps {
  /** A Lucide icon component rendered in the circular icon container. */
  icon: LucideIcon
  /** Short heading (e.g. `"No notes yet"`). */
  title: string
  /** Explanatory sentence below the heading. */
  description: string
  /** Label for the optional CTA button. Requires `onAction` to render. */
  actionLabel?: string
  /** Handler for the CTA button. Requires `actionLabel` to render. */
  onAction?: () => void
}

/**
 * Standardised empty state for job/contact/organisation detail tabs.
 *
 * Renders a centred icon, heading, description, and an optional action button.
 * The button only renders when **both** `actionLabel` and `onAction` are provided —
 * omit either to show a read-only empty state (used for terminal-status jobs).
 *
 * Prefer this over ad-hoc empty state markup so all tabs share the same
 * visual language. Two cases currently use custom markup instead due to
 * limitations in the single-action slot — see `JobContactsTab` and `TimelineTab`.
 */
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
