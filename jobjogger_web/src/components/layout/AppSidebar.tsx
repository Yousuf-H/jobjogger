import { NavGrouped } from '@/components/nav/NavGrouped'
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
  IconArchive,
  IconAward,
  IconBellRinging,
  IconBriefcase,
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconFileText,
  IconHelp,
  IconListDetails,
  IconLogout,
  IconSettings,
  IconTimeline,
  IconUserCheck,
  IconWorld,
} from '@tabler/icons-react'
import { FaPhoenixFramework } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

const data = {
  navMain: [
    { title: 'Dashboard', url: '/', icon: IconDashboard },
    { title: 'Jobs', url: '/jobs', icon: IconListDetails },
    { title: 'Follow Ups', url: '#', icon: IconBellRinging },
    { title: 'Timeline', url: '#', icon: IconTimeline },
    { title: 'Analytics', url: '/analytics', icon: IconChartBar },
  ],

  navJobs: [
    { title: 'Active Applications', url: '#', icon: IconBriefcase },
    { title: 'Interviews', url: '#', icon: IconUserCheck },
    { title: 'Offers', url: '#', icon: IconAward },
    { title: 'Archived', url: '#', icon: IconArchive },
  ],

  navTools: [
    { title: 'Resume Versions', icon: IconFileDescription, url: '#' },
    { title: 'Cover Letters', icon: IconFileText, url: '#' },
    { title: 'Job Sources', icon: IconWorld, url: '#' },
  ],

  navSecondary: [
    { title: 'Settings', url: '#', icon: IconSettings },
    { title: 'Help', url: '#', icon: IconHelp },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signout } = useAuth()

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
        <NavMain items={data.navMain} />
        <NavGrouped title="Jobs" items={data.navJobs} />
        <NavGrouped title="Tools" items={data.navTools} />
        <NavSecondary
          title="Secondary"
          items={data.navSecondary}
          className="mt-auto"
        />
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
