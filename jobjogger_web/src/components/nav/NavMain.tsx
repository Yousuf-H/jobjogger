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
        <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] px-2 mb-1">
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
                  className="rounded-[7px] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151] data-[active=true]:bg-[#EFF6FF] data-[active=true]:text-[#2563EB] data-[active=true]:font-medium"
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon className="shrink-0" />}
                    <span>{item.title}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="ml-auto rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-1.5 text-[10px] font-normal leading-4 text-[#6B7280]">
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
