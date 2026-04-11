import type { ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavIcon = ComponentType<{ className?: string }>

type NavMainProps = {
  items: {
    title: string
    url: string
    icon?: NavIcon
    badge?: number
  }[]
}

export function NavMain({ items }: NavMainProps) {
  const location = useLocation()

  return (
    <SidebarGroup>
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
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="bg-amber-500 text-white ml-auto rounded-full px-1.5 py-0.5 text-xs font-medium leading-none">
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
