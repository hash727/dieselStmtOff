// app/leasedline/layout.tsx
import { LeasedLineSidebar } from "./_components/sidebar";
import { LeasedLineHeader } from "./_components/header";

export default function LeasedLineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <LeasedLineSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Shared Header with Breadcrumb & Mobile Menu */}
        <LeasedLineHeader />

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/30 dark:bg-zinc-900/10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
