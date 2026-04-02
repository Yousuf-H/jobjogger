import { AppSidebar } from '@/components/layout/AppSidebar'
import DemoBanner from '@/components/layout/DemoBanner'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useSidebar } from '@/hooks/useSidebar'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

function LayoutContent() {
  const location = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [location.pathname, isMobile, setOpenMobile])

  return (
    <SidebarInset>
      <DemoBanner />
      <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
        </div>
      </header>
      <main className="flex-1 sm:p-4">
        <Outlet />
      </main>
    </SidebarInset>
  )
}

export default function Layout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar collapsible="offcanvas" variant="floating" />
      <LayoutContent />
    </SidebarProvider>
  )
}
