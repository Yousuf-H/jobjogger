import type { ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavIcon = ComponentType<{ className?: string }>

type NavMainProps = {
  title?: string
  items: {
    title: string
    url: string
    icon?: NavIcon
    badge?: number
  }[]
}

export function NavMain({ title, items }: NavMainProps) {
  const location = useLocation()

  return (
    <SidebarGroup>
      {title && (
        <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/50 px-2 mb-1">
          {title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.url)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className="rounded-[7px] text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon className="shrink-0" />}
                    <span>{item.title}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="ml-auto rounded-full border border-sidebar-border bg-sidebar-accent px-1.5 text-[10px] font-normal leading-4 text-sidebar-foreground/60">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
