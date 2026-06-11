import { NavMain } from '@/components/nav/NavMain'
import { NavUser } from '@/components/nav/NavUser'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useJobs } from '@/hooks/useJobs'
import { BarChart2, Brain, FolderKanban, IdCard, Landmark, LayoutDashboard, LogOut, Shield, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, signout } = useAuth()
  const { data: jobs } = useJobs()

  const navMain = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Jobs', url: '/jobs', icon: FolderKanban, badge: jobs?.length },
    { title: 'Analytics', url: '/analytics', icon: BarChart2 },
    { title: 'Organisations', url: '/organisations', icon: Landmark },
    { title: 'Contacts', url: '/contacts', icon: Users },
    ...(user?.admin
      ? [{ title: 'Admin', url: '/admin', icon: Shield }]
      : []),
  ]

  const navPrep = [
    { title: 'Interviews', url: '/interview-prep', icon: Brain },
    { title: 'Resumes', url: '/resume', icon: IdCard },
  ]

  const handleSignout = async () => {
    await signout()
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-14 justify-center border-b border-[#E5E7EB]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-auto p-0 hover:bg-transparent active:bg-transparent">
              <Link to="/" className="flex items-center gap-2.5 px-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#2563EB]">
                  <span className="text-[11px] font-bold tracking-tight text-white">JJ</span>
                </div>
                <span className="text-[15px] font-semibold text-[#111827]">JobJogger</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain title="MAIN" items={navMain} />
        <NavMain title="PREP" items={navPrep} />
      </SidebarContent>

      <SidebarFooter className="border-t border-[#E5E7EB]">
        {user ? (
          <NavUser user={user} signout={handleSignout} />
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignout}>
                <LogOut className="size-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
