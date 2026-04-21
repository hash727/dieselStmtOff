// 'use client';

import { Building2, ClipboardList, Factory, Fuel, LayoutDashboard, LogOut, Settings } from 'lucide-react'
import React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'
import { signOut } from 'next-auth/react'
import { SidebarModeToggle } from './theme/sidebar-mode-toggle';
import { auth } from '@/auth';
import { LogoutButton } from './logout-button';
import { OfficeSwitcher } from './office/office-switcher';

const items = [
    {title: "Dashboard", url: "/dashboard", icon: LayoutDashboard},
    {title: "Engine Timings", url: "/dashboard/engine", icon: Factory},
    {title: "Diesel Consumption", url: "/dashboard/diesel", icon: Fuel},
    {title: "Reports", url: "/dashboard/reports", icon: ClipboardList},
    {title: "Settings", url: "/dashboard/settings", icon: Settings},

]


const AppSidebar = async () => {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

  return (
    <Sidebar variant='floating' collapsible='icon'>
                
        <SidebarContent>
            {isAdmin && (
                <SidebarGroup>
                    <SidebarGroupLabel>Administration</SidebarGroupLabel>
                    <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                        <a href="/admin/offices">
                            <Building2 size={16} />
                            <span>Office Management</span>
                        </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            )}
            <SidebarGroup>
                <SidebarGroupLabel>Operations</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
                <OfficeSwitcher />
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
            <SidebarModeToggle />
            <LogoutButton />
        </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar