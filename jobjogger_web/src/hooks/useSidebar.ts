import { SidebarContext } from '@/contexts/SidebarContext'
import { useContext } from 'react'

/**
 * Returns the sidebar open/collapsed state and the toggle function.
 *
 * Must be used inside a component that is a descendant of `SidebarProvider`.
 * Throws an error otherwise — same guard pattern as `useAuth`.
 *
 * @returns The `SidebarContextType` value (e.g. `{ isOpen, toggle }`).
 * @throws If called outside a `SidebarProvider`.
 */
export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }
  return context
}
