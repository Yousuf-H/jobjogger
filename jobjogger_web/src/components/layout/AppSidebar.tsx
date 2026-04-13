import { NavMain } from '@/components/nav/NavMain'
import { NavSecondary } from '@/components/nav/NavSecondary'
import { NavUser } from '@/components/nav/NavUser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import {
  IconChartBar,
  IconDashboard,
  IconListDetails,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react'
import { Building2 } from 'lucide-react'
import { FaPhoenixFramework } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signout } = useAuth()
  const navMain = [
    { title: 'Dashboard', url: '/', icon: IconDashboard },
    { title: 'Jobs', url: '/jobs', icon: IconListDetails },
    { title: 'Analytics', url: '/analytics', icon: IconChartBar },
    { title: 'Organisations', url: '/organisations', icon: Building2 },
  ]

  const navSecondary = [{ title: 'Settings', url: '/settings', icon: IconSettings }]

  const handleSignout = async () => {
    await signout()
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/" className="flex items-center gap-2">
                <FaPhoenixFramework className="size-5!" />
                <span className="text-base font-semibold">Job Jogger</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        {user ? (
          <NavUser user={user} signout={handleSignout} />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignout}>
                <IconLogout className="size-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
