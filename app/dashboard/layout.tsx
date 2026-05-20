import { auth } from '@/auth'
import AppSidebar from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import React from 'react'
import { OfficeSwitcher } from '@/components/office/office-switcher' // We'll create this

const DashboardLayout = async ({children}: {children: React.ReactNode}) => {
    const session = await auth()
    const user = session?.user

    if(!user?.assignedOffices?.length && user?.role !== "ADMIN"){
        redirect("/onboarding");
    }

    const activeOfficeId = user?.activeOfficeId || user?.officeId;
    const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

    // FIX: Extract only the string IDs from the array of objects
    const assignedOfficeIds = user.assignedOffices.map((office: any) => 
        typeof office === 'string' ? office : office.id
    );
    // 1. Fetch current office name
    // 2. If Admin, fetch ALL offices; if User, fetch only ASSIGNED offices
    const [currentOffice, availableOffices] = await Promise.all([
        prisma.office.findUnique({
            where: { id: activeOfficeId },
            select: { name: true }
        }),
        isAdmin 
            ? prisma.office.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
            : prisma.office.findMany({ 
                where: { 
                    id: { 
                        in: assignedOfficeIds 
                    } 
                }, 
                select: { id: true, name: true } 
              })
    ]);

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar role={session?.user?.role}/>
                <main className='w-full bg-slate-50/50 min-h-screen'>
                    <header className='flex h-16 items-center justify-between border-b bg-slate-100 dark:bg-slate-900 px-6'>
                        <div className='flex items-center gap-4'>
                            <SidebarTrigger />
                            
                            {/* 3. Dropdown Switcher for Admin/Multi-office users */}
                            <OfficeSwitcher 
                                offices={availableOffices || []} 
                                currentOfficeName={currentOffice?.name}
                                currentOfficeId={activeOfficeId}
                            />
                        </div>
                        
                        <div className='flex items-center gap-3'>
                            {isAdmin && (
                                <span className='text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase'>
                                    Admin Mode
                                </span>
                            )}
                            <div className='text-[10px] text-muted-foreground font-mono bg-white/50 px-2 py-1 rounded border border-slate-200'>
                                ID: {activeOfficeId?.slice(-6)}
                            </div>
                        </div>
                    </header>
                    <div className='p-6 dark:bg-zinc-800/80'>
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </TooltipProvider>
    )
}

export default DashboardLayout
