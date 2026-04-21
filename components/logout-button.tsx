// components/logout-button.tsx
'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'

export function LogoutButton() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => signOut()}>
                    <LogOut className='mr-2 h-4 w-4'/>
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
