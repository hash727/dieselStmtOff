"use client";

import React, { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateEngineProfile } from "@/app/actions/engine";
import { Settings2, Save } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

export default function EngineProfileForm({ initialData, officeId, isReadOnly }: { initialData: any, officeId: string, isReadOnly: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const data = {
      make: formData.get("make"),
      capacity: formData.get("capacity"),
      serialNumber: formData.get("serialNumber"),
      consumptionRate: formData.get("consumptionRate"),
      installationDate: formData.get("installationDate"),
    };

    startTransition(async () => {
      const res = await updateEngineProfile(officeId, data);
      if (res.success) {
        toast.success("Engine Profile Updated");
      } else {
        toast.error(res.error || "Update failed");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>DG Set Make</Label>
          <Input name="make" disabled={isReadOnly} defaultValue={initialData?.make} placeholder="e.g. Kirloskar / Cummins" required />
        </div>

        <div className="space-y-2">
          <Label>Capacity (KVA)</Label>
          <Input name="capacity" disabled={isReadOnly} defaultValue={initialData?.capacity} placeholder="e.g. 15 KVA / 62.5 KVA" required />
        </div>

        <div className="space-y-2">
          <Label>Engine Serial Number</Label>
          <Input name="serialNumber" disabled={isReadOnly} defaultValue={initialData?.serialNumber} placeholder="Unique Sl. No." required />
        </div>

        <div className="space-y-2">
          <Label className="text-blue-600 font-bold">Consumption Rate (Liters/Hour)</Label>
          <Input 
            name="consumptionRate" 
            disabled={isReadOnly}
            type="number" 
            step="0.01" 
            defaultValue={initialData?.consumptionRate} 
            placeholder="0.00" 
            required 
            className="border-blue-200 focus-visible:ring-blue-500"
          />
          <p className="text-[10px] text-muted-foreground italic">Important: This rate multiplies with Engine Run Hours to calculate Diesel Used.</p>
        </div>

        <div className="space-y-2">
          <Label>Installation Date</Label>
          <Input 
            name="installationDate" 
            disabled={isReadOnly}
            type="date" 
            defaultValue={initialData?.installationDate ? new Date(initialData.installationDate).toISOString().split('T')[0] : ""} 
          />
        </div>
      </div>

   

    {/* // ... inside your form or card */}
    <CardFooter className="border-t bg-slate-50/50 px-6 py-3 justify-between items-center">
      <p className="text-[10px] text-muted-foreground italic">
        Last modified by: <span className="font-bold text-slate-700">{initialData?.updatedBy?.name || "System"}</span>
      </p>
      <p className="text-[10px] text-muted-foreground italic">
        On: {initialData?.updatedAt ? new Date(initialData.updatedAt).toLocaleString('en-GB') : "N/A"}
      </p>
    </CardFooter>

      <div className="pt-4 border-t flex justify-end">
        {!isReadOnly && (
          <Button type="submit" disabled={isPending} className="flex gap-2">
            <Save className="h-4 w-4" />
            {isPending ? "Saving Changes..." : "Save Profile"}
          </Button>
        )}
      </div>
    </form>
  );
}
