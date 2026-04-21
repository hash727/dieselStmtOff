// components/settings/reset-stock-form.tsx
'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateOpeningBalance } from "@/app/actions/engine"; // You'll create this action
import { useState } from "react";
import { toast } from "sonner";

export default function ResetStockForm({ officeId, currentMonth, currentYear, isReadOnly }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await updateOpeningBalance(formData);
    if (res.success) toast.success("Opening balance updated!");
    else toast.error(res.error);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="officeId" value={officeId} />
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Month</Label>
          <Input type="number" disabled={isReadOnly} name="month" defaultValue={currentMonth} min={1} max={12} />
        </div>
        <div className="space-y-2">
          <Label>Year</Label>
          <Input type="number" disabled={isReadOnly} name="year" defaultValue={currentYear} />
        </div>
        <div className="space-y-2">
          <Label>New Opening Stock (L)</Label>
          <Input type="number" disabled={isReadOnly} step="0.01" name="amount" placeholder="0.00" required />
        </div>
      </div>
      
      {isReadOnly && (
        <Button type="submit" variant="destructive" disabled={loading}>
          {loading ? "Updating..." : "Force Correct Stock"}
        </Button> 
      )}
      
    </form>
  );
}
