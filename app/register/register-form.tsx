'use client'

import { signIn } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useActionState } from 'react'
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { registerUser } from "../actions/register"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SocialAuth from "@/components/auth/social-auth"

interface Office {
    id: string;
    name: string
}

const RegisterForm = ( {offices}: {offices: Office[]}) => {
    // state will contain errros retured from server action
    const [state, formAction, isPending] = useActionState(registerUser, null)
    
  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
        <Card className='w-full max-w-md shadow-lg'>
            <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl font-bold'>Create an account</CardTitle>
                <CardDescription>Enter your details to register your office</CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4'>
                {/* Social Logins */}
                <div className='grid grid-cols-2 gap-4'>
                    {/* <Button variant={'outline'} onClick={() => signIn('google')}>Google</Button>
                    <Button variant={'outline'} onClick={() => signIn('facebook')}>Facebook</Button> */}
                    <SocialAuth />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><Separator /></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                {/* Credentials Form */}
                <form action={formAction} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor='username'>Username</Label>
                        <Input id="username" name="username" placeholder="harishkumar" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor='office'>Office ID</Label>
                        {/* <Input id="office" name="officeId" placeholder="Main-Exchange-bly" required /> */}
                        <Select name="officeId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an office" />
                            </SelectTrigger>
                            <SelectContent>
                                {offices.map((office) => (
                                    <SelectItem key={office.id} value={office.id}>
                                        {office.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {state?.errors?.officeId && (
                            <p className="text-xs text-destructive">{state.errors.officeId}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor='password'>Password</Label>
                        <Input id="password" name="password" type="password" required />
                        {state?.errors?.password && (
                            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="grid gap-2">
                        <Label htmlFor='confirmPassword'>Confirm Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        {state?.errors?.confirmPassword && (
                            <p className="text-xs text-destructive">{state.errors.confirmPassword[0]}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                        Create Account
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}

export default RegisterForm