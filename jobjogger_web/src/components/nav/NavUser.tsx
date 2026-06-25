import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useSidebar } from '@/hooks/useSidebar'
import { type User } from '@/types/user'
import { LogOut, Settings, UserCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface NavUserProps {
  user: User
  signout: () => Promise<void>
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function NavUser({ user, signout }: NavUserProps) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="rounded-[7px] hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[13px] font-semibold text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                {getInitials(user.name)}
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-[13px] font-medium text-sidebar-foreground">
                  {user.name}
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/60">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-52 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[13px] font-semibold text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                  {getInitials(user.name)}
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <UserCircle className="mr-1 size-4" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link to="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-1 size-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={signout}>
              <LogOut className="mr-1 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
