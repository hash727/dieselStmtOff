"use client";

import { clearLeasedLines } from "@/app/actions/leasedline";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export default function ClearDataButton() {
  const [isPending, startTransition] = useTransition();

  const handleClear = () => {
    const confirmed = confirm(
      "WARNING: This will permanently delete ALL leased line records. This action cannot be undone. Proceed?"
    );

    if (confirmed) {
      startTransition(async () => {
        const res = await clearLeasedLines();
        if (res.success) {
          toast.success("Database cleared successfully.");
        } else {
          toast.error(res.error);
        }
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleClear} 
      disabled={isPending}
      className="flex gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? "Clearing..." : "Clear All Data"}
    </Button>
  );
}
