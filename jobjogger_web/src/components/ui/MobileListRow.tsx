import { cn } from '@/lib/utils'

interface MobileListRowProps {
  /** Single character shown inside the avatar circle (typically the first letter of a name). */
  initial: string
  /** Tailwind class string from `avatarColorById` or `avatarColorByName` (e.g. `"bg-avatar-1/15 text-avatar-1"`). */
  avatarColor: string
  /** Click handler — also fires on Enter / Space for keyboard accessibility. */
  onClick: () => void
  /** Row content rendered to the right of the avatar. Typically two lines of text. */
  children: React.ReactNode
}

/**
 * A mobile-optimised list row with an avatar circle and arbitrary child content.
 *
 * Used on mobile breakpoints as a replacement for `DataTable` rows. Renders an
 * accessible `role="button"` div that responds to click, Enter, and Space.
 * Pair with `avatarColorById` or `avatarColorByName` for the `avatarColor` prop.
 */
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
