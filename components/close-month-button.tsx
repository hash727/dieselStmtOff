// components/close-month-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { closeMonthlyBalance } from "@/app/actions/engine";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useTransition } from "react";

export default function CloseMonthButton({ officeId, month, year, totalStock }: any) {
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    if (!confirm("Are you sure? This will set next month's opening balance.")) return;
    
    startTransition(async () => {
      const res = await closeMonthlyBalance(officeId, month, year, totalStock);
      if (res.success) toast.success("Month closed successfully!");
      else toast.error(res.error);
    });
  };

  return (
    <Button 
      variant="outline" 
      disabled={isPending}
      onClick={handleClose}
      className="border-red-200 text-red-600 hover:bg-red-50"
    >
      <Lock className="mr-2 h-4 w-4" />
      {isPending ? "Closing..." : "Close Month"}
    </Button>
  );
}
