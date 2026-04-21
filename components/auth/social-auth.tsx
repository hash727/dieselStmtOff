'use client'
import React from 'react'
import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';
import { Chrome, Facebook } from 'lucide-react';



const SocialAuth = () => {
    const handleSignIn = (provider: "google" | "facebook") => {
        signIn(provider, { callbackUrl: "/dashboard" })
    }
  return (
    <div className='grid grid-cols-2 gap-4'>
        {/* Google Button */}
        <Button
            variant={'outline'}
            type='button'
            onClick={() => handleSignIn("google")}
            className='w-full flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50'
        >
            <Chrome className='h-4 w-4 text-red-500' />
            <span className='text-xs'>Google</span>
        </Button>

        {/* Facebook Button */}
        <Button
            variant={'outline'}
            type='button'
            onClick={() => handleSignIn("facebook")}
            className='w-full flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50'
        >
            <Facebook className='h-4 w-4 text-red-500' />
            <span className='text-xs'>Facebook</span>
        </Button>
    </div>
  )
}

export default SocialAuth