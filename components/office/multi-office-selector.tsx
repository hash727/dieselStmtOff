// components/multi-office-selector.tsx
"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function MultiOfficeSelector({ offices }: { offices: any[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 border p-4 rounded-lg bg-card">
      <Label className="text-lg font-bold">Select Accessible Offices</Label>
      {offices.map((office) => (
        <div key={office.id} className="flex items-center space-x-3 space-y-0">
          <Checkbox 
            id={office.id} 
            name="officeIds" // Use same name for all to get array in FormData
            value={office.id} 
          />
          <Label htmlFor={office.id} className="cursor-pointer">
            {office.name} — <span className="text-muted-foreground text-xs">{office.location}</span>
          </Label>
        </div>
      ))}
    </div>
  )
}
