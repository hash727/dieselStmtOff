"use client";
import { useRouter, usePathname } from "next/navigation"; // 1. Added usePathname

export default function ReportFilter({ currentMonth, currentYear }: { currentMonth: number; currentYear: number }) {
  const router = useRouter();
  const pathname = usePathname(); // 2. Get current URL path

  const handleUpdate = (e: React.ChangeEvent<HTMLSelectElement>, type: 'month' | 'year') => {
    const params = new URLSearchParams(window.location.search);
    params.set(type, e.target.value);
    
    // 3. Navigate to current path with new parameters
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-4">
      <select 
        value={currentMonth} 
        onChange={(e) => handleUpdate(e, 'month')}
        className="border rounded p-2 text-sm bg-white dark:bg-zinc-900"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i+1} value={i+1}>
            {new Date(0, i).toLocaleString('en', { month: 'long' })}
          </option>
        ))}
      </select>
      <select 
        value={currentYear} 
        onChange={(e) => handleUpdate(e, 'year')}
        className="border rounded p-2 text-sm bg-white dark:bg-zinc-900"
      >
        {[2024, 2025, 2026].map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
