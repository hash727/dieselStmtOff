import { prisma } from '@/lib/prisma'
import React from 'react'
import RegisterForm from './register-form';


const RegisterPage = async () => {
    // Fetch all offices from local DB
    const offices = await prisma.office.findMany({
        select: {
            id: true,
            name: true
        }
    });

  return (
    <div className='min-h-screen items-center justify-center bg-slate-50'>
        <RegisterForm offices={offices} />
    </div>
  )
}

export default RegisterPage