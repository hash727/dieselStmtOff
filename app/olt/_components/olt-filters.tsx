// app/olt/_components/olt-filters.tsx
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Filter, Monitor } from "lucide-react";
import OltTable from "./olt-table";
import { Button } from "@/components/ui/button";

export default function OltFilters({ olts }: { olts: any[] }) {
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("ALL");

  const filteredOlts = useMemo(() => {
    return olts.filter((olt) => {
      const searchStr = search.toLowerCase();
      const matchesSearch = 
        olt.name.toLowerCase().includes(searchStr) ||
        olt.ip.includes(searchStr) ||
        olt.franchisee.toLowerCase().includes(searchStr) ||
        (olt.description?.toLowerCase().includes(searchStr)); // Now searches Description
      
      const matchesArea = areaFilter === "ALL" || olt.area === areaFilter;
      
      return matchesSearch && matchesArea;
    });
  }, [search, areaFilter, olts]);

  const clearFilters = () => {
    setSearch("");
    setAreaFilter("ALL");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        
        {/* Search Input with Clear Button */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search Name, IP, TIP or Notes..." 
            className="pl-10 pr-10 bg-slate-50 dark:bg-zinc-900/50 border-none rounded-xl font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-slate-500" />
            </button>
          )}
        </div>

        {/* Sector Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
            {["ALL", "URBAN", "RURAL"].map((f) => (
              <button
                key={f}
                onClick={() => setAreaFilter(f)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                  areaFilter === f 
                  ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-md" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {(search || areaFilter !== "ALL") && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Showing {filteredOlts.length} of {olts.length} Registered Nodes
        </p>
      </div>

      <OltTable olts={filteredOlts} />
    </div>
  );
}
