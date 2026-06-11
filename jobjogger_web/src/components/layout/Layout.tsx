import { AppSidebar } from '@/components/layout/AppSidebar'
import BottomNav from '@/components/layout/BottomNav'
import DemoBanner from '@/components/layout/DemoBanner'
import TermsAcceptanceModal from '@/components/layout/TermsAcceptanceModal'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useSidebar } from '@/hooks/useSidebar'
import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

function LayoutContent() {
  const location = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()

  useEffect(() => {
    // Reset scroll position on every page navigation
    window.scrollTo(0, 0)

    if (isMobile) {
      setOpenMobile(false)
    }
  }, [location.pathname, isMobile, setOpenMobile])

  return (
    <SidebarInset>
      <DemoBanner />
      <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-background px-4">
        {/* Desktop: sidebar toggle. Mobile: app logo */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <SidebarTrigger />
          </div>
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#2563EB]">
              <span className="text-[10px] font-bold tracking-tight text-white">JJ</span>
            </div>
            <span className="text-[15px] font-semibold text-foreground">JobJogger</span>
          </Link>
        </div>
        <NotificationBell />
      </header>
      <main className="flex-1 p-4 pb-20 md:pb-4">
        <Outlet />
      </main>
      <BottomNav />
    </SidebarInset>
  )
}

export default function Layout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '220px',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar collapsible="offcanvas" variant="sidebar" />
      <LayoutContent />
      <TermsAcceptanceModal />
    </SidebarProvider>
  )
}
