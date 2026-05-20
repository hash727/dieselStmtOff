// app/_components/app-sidebar.tsx
"use client";

import { 
  Building2, ClipboardList, Factory, Fuel, 
  LayoutDashboard, Settings, ShieldCheck, Zap,
  Cpu, Activity, FileText, MonitorDot, ChevronRight
} from 'lucide-react'
import React from 'react'
import { 
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, 
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu, 
  SidebarMenuButton, SidebarMenuItem, SidebarHeader 
} from './ui/sidebar'
import { SidebarModeToggle } from './theme/sidebar-mode-toggle';
import { LogoutButton } from './logout-button';
import { OfficeSwitcher } from './office/office-switcher';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const dieselItems = [
    {title: "Core Overview", url: "/dashboard", icon: LayoutDashboard},
    {title: "Engine Logs", url: "/dashboard/engine", icon: Factory},
    {title: "Fuel Ledger", url: "/dashboard/diesel", icon: Fuel},
    {title: "Operational Reports", url: "/dashboard/reports", icon: ClipboardList},
]

const oltItems = [
    {title: "Fiber Dashboard", url: "/olt/dashboard", icon: MonitorDot},
    {title: "Manage Inventory", url: "/olt/manage", icon: Settings},
    {title: "Manual Diagnostic", url: "/olt/manual-ping", icon: Activity},
    {title: "Audit Reports", url: "/olt/reports", icon: FileText},
]

const AppSidebar = ({ role }: { role?: string }) => {
    const pathname = usePathname();
    const isAdmin = role === "ADMIN";
    const isManager = role === "MANAGER" || isAdmin;

  return (
    <Sidebar variant='floating' collapsible='icon' className="border-r border-slate-200 dark:border-zinc-800">
        
        {/* BRAND HEADER - Matches OltSidebar exactly */}
        <SidebarHeader className="pt-6 px-6">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
                    <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
                    <h2 className="text-sm font-black tracking-tighter text-slate-900 dark:text-zinc-100 uppercase truncate">SDOP Core</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Command Hub</p>
                </div>
            </div>
        </SidebarHeader>

        <SidebarContent className="px-4 mt-4 space-y-6">
            
            {/* 1. DIESEL OPERATIONS */}
            <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                    Diesel Statements
                </SidebarGroupLabel>
                <SidebarMenu className="gap-1">
                    {dieselItems.map((item) => {
                        const isActive = pathname === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton 
                                    asChild 
                                    className={cn(
                                        "h-12 px-3 rounded-xl transition-all group/item",
                                        isActive 
                                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400" 
                                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900"
                                    )}
                                >
                                    <Link href={item.url} className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3">
                                            <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "group-hover/item:text-slate-900 dark:group-hover/item:text-zinc-100")} />
                                            <span className="font-bold text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4 animate-in slide-in-from-left-1 group-data-[collapsible=icon]:hidden" />}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroup>

            {/* 2. OLT INFRASTRUCTURE - Matches OltSidebar logic */}
            {isManager && (
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">
                        Fiber Ops
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {oltItems.map((item) => {
                            const isActive = pathname.startsWith(item.url);
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild 
                                        className={cn(
                                            "h-12 px-3 rounded-xl transition-all group/item",
                                            isActive 
                                                ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                                                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900"
                                        )}
                                    >
                                        <Link href={item.url} className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "group-hover/item:text-emerald-500")} />
                                                <span className="font-bold text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                                            </div>
                                            {isActive && <ChevronRight className="h-4 w-4 animate-in slide-in-from-left-1 group-data-[collapsible=icon]:hidden" />}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {/* STATION SWITCHER - Pushed to bottom of content area */}
            {/* <div className="mt-auto pt-4 group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                    Station
                </SidebarGroupLabel>
                <OfficeSwitcher />
            </div> */}
        </SidebarContent>

        {/* FOOTER */}
        <SidebarFooter className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/50">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-4">
                <SidebarModeToggle />
                <div className="group-data-[collapsible=icon]:hidden">
                    <LogoutButton />
                </div>
            </div>
        </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar;
