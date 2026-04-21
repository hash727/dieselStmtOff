"use client";

import { useTransition } from "react";
import { updateUserOffices } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingForm({ offices }: { offices: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleFormAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateUserOffices(formData);
      // We only handle errors here. 
      // If successful, the server's redirect() will automatically move the page.
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <form action={handleFormAction} className="space-y-6">
      <div className="grid gap-3 border rounded-xl p-4 bg-card shadow-sm">
        {offices.map((office) => (
          <div key={office.id} className="flex items-center space-x-3 p-2">
            <input 
              type="checkbox" 
              name="officeIds" 
              value={office.id} 
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            <label className="text-sm font-medium cursor-pointer flex-1">
              {office.name}
            </label>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving & Redirecting...
          </>
        ) : (
          "Complete Setup"
        )}
      </Button>
    </form>
  );
}
