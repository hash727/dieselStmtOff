// app/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";
import { ShieldCheck, UserCircle } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-10 px-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-8">
        <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
          <UserCircle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-zinc-100 uppercase">
            User Settings
          </h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" /> Identity & Access Management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <div className="space-y-6">
           <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <p className="text-[9px] font-black uppercase text-slate-400 mb-4 tracking-widest">Account Status</p>
              <div className="flex items-center gap-2 mb-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Live Production Session</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase">
                Registered as {session.user?.role} level personnel for SDOP Internal Infrastructure.
              </p>
           </div>
        </div>

        {/* Form Area */}
        <div className="md:col-span-2">
           <ProfileForm user={session.user} />
        </div>
      </div>
    </div>
  );
}
