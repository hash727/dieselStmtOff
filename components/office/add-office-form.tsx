// components/add-office-form.tsx
"use client"

import { useTransition } from "react"
import { createOffice } from "@/app/actions/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner" // Or your preferred toast library

export default function AddOfficeForm() {
  const [isPending, startTransition] = useTransition()

  const clientAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await createOffice(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Office created successfully!")
      }
    })
  }

  return (
    <Card className="max-w-md mx-auto bg-card shadow-lg border-muted">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2 text-primary">
          <Building2 size={24} />
          <CardTitle>Add New Office</CardTitle>
        </div>
        <CardDescription>
          Register a new exchange or branch office in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={clientAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Office Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                placeholder="e.g., Main City Exchange"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location / Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                name="location"
                placeholder="e.g., Downtown, Sector 4"
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Office...
              </>
            ) : (
              "Create Office"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
