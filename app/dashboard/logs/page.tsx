'use client'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Popover } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { CalendarIcon, Plus } from 'lucide-react'
import React, { useState } from 'react'



const EngineLogsPage = () => {
    const [date, setDate] = useState<Date>(new Date())

    // Local state for instatn display (in a real app this comes from DB)
    const [logs, setLogs] = useState([
        { id: "1", date: "2024-05-20", pOff: "08:00", eOn: "08:05", pOn: "17:00", eOff: "17:05" }
    ])
  return (
    <div className='p-8 max-w-6xl mx-auto space-y-8'>
        <h1 className='text-2xl font-bold tracking-tight'>Daily Operational Logs</h1>

        {/* Entry Row */}
        <div className='bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm'>
            <div className='grid grid-cols-6 gap-4 items-end'>
                <div className='space-y-2'>
                    <label className='text-xs font-semibold uppercase text-slate-500'>Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={'outline'} className='w-full justify-start text-left font-normal'>
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {date? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0'>
                            <Calendar mode='single' selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                {["Power Off", "Engine On", "Power On", "Engine Off"].map((label) => (
                    <div key={label} className='space-y-2'>
                        <label className='text-xs font-semibold uppercase text-slate-500'>{label}</label>
                        <Input type='time' className='bg-white' />
                    </div>
                ))}

                <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                    <Plus className='mr-2 h-4 w-4' /> Add Record
                </Button>
            </div>
        </div>

        {/* Logs Table */}
        <div className='rounded-md border'>
            <Table>
                <TableHeader className='bg-slate-50'>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Power Off</TableHead>
                        <TableHead>Engine On</TableHead>
                        <TableHead>Power On</TableHead>
                        <TableHead>Engine Off</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className='font-medium'>{log.date}</TableCell>
                            <TableCell>{log.pOff}</TableCell>
                            <TableCell>{log.eOn}</TableCell>
                            <TableCell>{log.pOn}</TableCell>
                            <TableCell>{log.eOff}</TableCell>
                            <TableCell className='text-right'>
                                <Button variant={'ghost'} size={'sm'}>Edit</Button>
                            </TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
  )
}

export default EngineLogsPage