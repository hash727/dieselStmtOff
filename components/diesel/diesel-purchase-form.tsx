"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PlusCircle, Fuel, Loader2, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { addDieselPurchase } from "@/app/actions/engine";


export default function DieselPurchaseForm({ officeId }: { officeId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      // Connects directly to your updated Prisma transaction server action
      const res = await addDieselPurchase(null, formData);
      if (res.success) {
        toast.success(res.message || "Diesel purchase invoice logged successfully!");
        setOpen(false); 
      } else {
        toast.error(res.error || "Failed to log purchase details");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Diesel Refill Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-emerald-600" />
            Record Fleet Card Purchase
          </DialogTitle>
          <DialogDescription>
            Log explicit voucher parameters to link transaction logs directly to your multi-page PDF statements.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4 pt-2">
          {/* Hidden reference keeping transaction safely tied to this exchange branch */}
          <input type="hidden" name="officeId" value={officeId} />
          
          <div className="grid grid-cols-2 gap-4">
            {/* 1. Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className="flex items-center gap-1">
                <Receipt className="h-3 w-3 text-muted-foreground" /> Invoice No.
              </Label>
              <Input 
                id="invoiceNumber" 
                name="invoiceNumber" 
                placeholder="e.g. IOCL-99812" 
                required 
              />
            </div>

            {/* 2. Fleet Card ID */}
            <div className="space-y-2">
              <Label htmlFor="fleetCardNumber" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3 text-muted-foreground" /> Fleet Card ID
              </Label>
              <Input 
                id="fleetCardNumber" 
                name="fleetCardNumber" 
                placeholder="e.g. 7004-1102"
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 3. Date of Purchase */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input 
                id="purchaseDate" 
                name="purchaseDate" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]} 
                required 
              />
            </div>

            {/* 4. Time of Purchase */}
            <div className="space-y-2">
              <Label htmlFor="purchaseTime">Purchase Time</Label>
              <Input 
                id="purchaseTime" 
                name="purchaseTime" 
                type="time" 
                defaultValue={new Date().toTimeString().slice(0,5)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 5. Fuel Volume */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Liters)</Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                required 
              />
            </div>

            {/* 6. Invoice Cost Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Total Bill Amount (₹)</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                placeholder="Rs. 0.00" 
                required 
              />
            </div>
          </div>

          {/* 7. SAP ERP Document Reference */}
          <div className="space-y-2">
            <Label htmlFor="sapDocumentNo">SAP Document Number <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
            <Input 
              id="sapDocumentNo" 
              name="sapDocumentNo" 
              placeholder="e.g. 100029348" 
            />
          </div>

          {/* 8. Descriptive Operational Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
            <Textarea 
              id="remarks" 
              name="remarks" 
              placeholder="Log engine condition details or voucher anomalies here..." 
              className="resize-none h-20 text-xs"
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-medium" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Commiting Records to Database...
              </>
            ) : "Commit Purchase & Update Stock"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
