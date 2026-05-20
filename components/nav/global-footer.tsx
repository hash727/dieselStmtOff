// components/nav/global-footer.tsx
import { ShieldCheck, Network, Globe } from "lucide-react";

export function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 px-4 mt-auto z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* LEFT: Branding & Copyright */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-zinc-900 rounded">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <span className=" text-[10px] font-black uppercase tracking-widest text-slate-500">
              <p>© {currentYear} SDOP Section • Internal Infrastructure</p>
              <p className="text-[8px]">Developed by: Harish Kumar JTO, SDOP, BSNL, Bellary</p>
            </span>
          </div>

          {/* MIDDLE: System Specs */}
          <div className="flex items-center gap-6 opacity-50">
            <div className="flex items-center gap-1.5">
              <Network className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Production v1.4.2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Regional Node: South</span>
            </div>
          </div>

          {/* RIGHT: Security Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-widest">
              Secure Session Active
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
