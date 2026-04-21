import { useTheme } from 'next-themes'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Monitor, Moon, Sun } from 'lucide-react'

// type Props = {}

const ModeToggle = () => {
    const { setTheme } = useTheme()

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant={'outline'} size={'icon'} className='rounded-full'>
                <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 ' />
                <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                <span className='sr-only'>Toggle theme</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => setTheme("light")} className='gap-2'>
                <Sun size={16} /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className='gap-2'>
                <Moon size={16} /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className='gap-2'>
                <Monitor size={16} /> System
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ModeToggle