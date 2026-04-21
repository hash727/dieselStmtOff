"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PlusCircle, Fuel, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addDieselRefill } from "@/app/actions/engine";

export default function DieselRefillForm({ officeId }: { officeId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const res = await addDieselRefill(null, formData);
      if (res.success) {
        toast.success(res.message || "Diesel refill recorded!");
        setOpen(false); // Close modal on success
      } else {
        toast.error(res.error || "Failed to save refill");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Diesel Refill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-emerald-600" />
            Record Fuel Addition
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <input type="hidden" name="officeId" value={officeId} />
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Liters)</Label>
            <Input 
              id="quantity" 
              name="quantity" 
              type="number" 
              step="0.01" 
              placeholder="e.g. 100.50" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                name="time" 
                type="time" 
                defaultValue={new Date().toTimeString().slice(0,5)} 
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Refill Details"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
