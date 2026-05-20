// app/profile/profile-form.tsx
"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Mail, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "../actions/profile";

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (formData: FormData) => {
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      
      if (res.success) {
        toast.success("Identity profile updated successfully", {
          description: "Your session has been synchronized with the master database.",
        });
      } else {
        toast.error(res.error || "Update failed");
      }
    });
  };

  return (
    <form action={handleUpdate} className="space-y-6">
      <div className="grid gap-6 p-8 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        
        {/* Name Field */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Full Name</Label>
          <div className="relative">
            <Fingerprint className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              name="name" 
              defaultValue={user?.name || ""} 
              className="pl-10 h-11 bg-slate-50 dark:bg-zinc-900 border-none rounded-xl font-bold" 
            />
          </div>
        </div>

        {/* Email Field (Read Only usually for SSO) */}
        <div className="space-y-2 opacity-60">
          <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              disabled 
              value={user?.email || ""} 
              className="pl-10 h-11 bg-slate-100 dark:bg-zinc-900/50 border-none rounded-xl font-mono text-xs" 
            />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase italic">Email is managed via SSO Provider</p>
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-blue-500/20"
        >
          {isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Commit Changes
        </Button>
      </div>
    </form>
  );
}
