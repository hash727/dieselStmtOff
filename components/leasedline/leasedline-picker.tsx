"use client";

import { useState, useRef } from "react";
import { Check, ChevronsUpDown, Search, Activity, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ProfessionalPingTool from "./professional-ping-tool"; // The component we made earlier

export default function LeasedLinePicker({ leasedLines }: { leasedLines: any[] }) {
  const [open, setOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const diagSectionRef = useRef<HTMLDivElement>(null);

  const handleSelect = (currentValue: string) => {
    const line = leasedLines.find((l) => l.lcId === currentValue);
    setSelectedLine(line);
    setOpen(false);
    
    // Smooth scroll to the diagnostic tool
    setTimeout(() => {
        diagSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="space-y-10">
      {/* --- SELECTION SECTION --- */}
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-2">
          <Search className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Select Customer Link</h2>
        <p className="text-sm text-muted-foreground">Choose a leased line from the inventory to begin a deep-link diagnostic test.</p>
        
        <div className="pt-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-12 text-lg shadow-sm border-slate-300 dark:border-zinc-800"
              >
                {selectedLine ? selectedLine.customerName : "Search LCID, Name, or TIP/BSNL..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Try 'TIP' or 'BSNL' or Customer Name..." />
                <CommandList>
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    {leasedLines.map((line) => (
                      <CommandItem
                        key={line.id}
                        value={`${line.customerName} ${line.lcId} ${line.bsnlTip}`}
                        onSelect={() => handleSelect(line.lcId)}
                        className="flex justify-between items-center py-3"
                      >
                        <div className="flex items-center gap-3">
                          {/* 2. Visual Indicator for TIP vs BSNL in list */}
                          <div className={`h-2 w-2 rounded-full ${line.bsnlTip === 'BSNL' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                          <div>
                            <p className="font-bold leading-none">{line.customerName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">
                              {line.lcId} | {line.bsnlTip}
                            </p>
                          </div>
                        </div>
                        <Check className={cn("h-4 w-4", selectedLine?.lcId === line.lcId ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* --- DIAGNOSTIC SECTION --- */}
      {selectedLine && (
        <div ref={diagSectionRef} className="pt-10 border-t dark:border-zinc-800 animate-in slide-in-from-bottom-10 duration-700">
           <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                   selectedLine.bsnlTip === 'BSNL' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                 }`}>
                    <Activity className={`h-5 w-5 ${selectedLine.bsnlTip === 'BSNL' ? 'text-blue-600' : 'text-orange-600'}`} />
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{selectedLine.customerName}</h3>
                        {/* 3. Vendor Badge */}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter ${
                            selectedLine.bsnlTip === 'BSNL' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'
                        }`}>
                            {selectedLine.bsnlTip}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">Target: {selectedLine.wanIp}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-slate-100 text-slate-700">{selectedLine.serviceType}</Badge>
                <Badge className="bg-slate-100 text-slate-700">{selectedLine.bandwidth}</Badge>
              </div>
           </div>
           
           {/* Passing the selected IP to the professional tool we built */}
           <ProfessionalPingTool prefilledIp={selectedLine.wanIp} />
        </div>
      )}
    </div>
  );
}

function Badge({ children, variant, className }: any) {
    return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>{children}</span>
}
