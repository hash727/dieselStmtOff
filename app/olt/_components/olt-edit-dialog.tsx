// app/olt/_components/olt-edit-dialog.tsx
"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateOlt } from "@/app/actions/olt";
import { toast } from "sonner";
import { Loader2, Save, Shield, ShieldCheck } from "lucide-react";

export function OltEditDialog({ olt, isOpen, onOpenChange }: any) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData);

    startTransition(async () => {
      const res = await updateOlt(olt.id, values);
      if (res.success) {
        toast.success("OLT Configuration Updated");
        onOpenChange(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 uppercase tracking-tighter font-black">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Edit OLT: {olt?.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">OLT Name</Label>
            <Input name="name" defaultValue={olt?.name} className="h-9 font-bold" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">IP Address</Label>
            <Input name="ip" defaultValue={olt?.ip} className="h-9 font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">SSH Username</Label>
            <Input name="sshUsername" defaultValue={olt?.sshUsername} className="h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">SSH Password</Label>
            <Input name="sshPassword" type="password" placeholder="•••••••• (Leave blank to keep current)" className="h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">Outer VLAN</Label>
            <Input name="outerVlan" type="number" defaultValue={olt?.outerVlan} className="h-9 font-mono" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400">Location</Label>
            <Input name="location" defaultValue={olt?.location} className="h-9" />
          </div>
          
          <div className="col-span-2 pt-4 flex justify-end gap-3 border-t mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Commit Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
