// app/olt/layout.tsx
import { OltSidebar } from "./_components/olt-sidebar";

// 1. Ensure the function name is Capitalised
// 2. Ensure "export default" is at the start or end
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar persists on all OLT routes */}
      <OltSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/30 dark:bg-zinc-900/10">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
