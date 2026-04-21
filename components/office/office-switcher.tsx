"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setActiveOffice } from "@/app/actions/office-actions"; // Create this server action
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useSession } from "next-auth/react";

export function OfficeSwitcher({ offices = [], currentOfficeName, currentOfficeId }: any) {
  const { update } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSelect = (id: string) => {
    startTransition(async () => {
      const res = await setActiveOffice(id); // Action to update user.activeOfficeId in DB/Session
      if(res?.success){

         // 4. Update the Client Session (Triggers your JWT 'update' logic)
        await update({ activeOfficeId: id });

        router.refresh();
        // window.location.reload();
      }
    });
  };

  return (
    <Select onValueChange={onSelect} defaultValue={currentOfficeId} disabled={isPending}>
      <SelectTrigger className="w-[250px] bg-transparent border-none font-bold text-slate-700 dark:text-slate-200 focus:ring-0 p-0 h-auto">
        <SelectValue placeholder={currentOfficeName || "Select Office"} />
      </SelectTrigger>
      <SelectContent>
        {offices.map((office: any) => (
          <SelectItem key={office.id} value={office.id}>
            {office.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
