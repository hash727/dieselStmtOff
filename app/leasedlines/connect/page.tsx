"use client";

import { useState, useRef, useEffect } from "react";
import { executeCiscoCommand } from "@/app/actions/routers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Send, Loader2, Cpu, RotateCcw, Trash2 } from "lucide-react";

export default function CiscoConsole() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLPreElement>(null);

  // Auto-scroll terminal to bottom when output changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, isLoading]);

  const handleRunCommand = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const cmd = input.trim();
    setInput("");
    setIsLoading(true);
    
    // Add command to local history display
    setOutput(prev => prev + `\n# ${cmd}\n`);

    const res = await executeCiscoCommand(cmd);
    
    if (res.success) {
      setOutput(prev => prev + (res.data || "Command executed (No output)"));
    } else {
      setOutput(prev => prev + `!! Error: ${res.error}`);
    }
    setIsLoading(false);
  };

  return (
    <Card className="max-w-4xl mx-auto border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-2">
               <div className="h-3 w-3 rounded-full bg-red-500/80" />
               <div className="h-3 w-3 rounded-full bg-amber-500/80" />
               <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400 flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Cisco Router Shell
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOutput("")}
            className="h-8 w-8 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Terminal Display */}
        <pre 
          ref={scrollRef}
          className="h-[450px] overflow-y-auto p-5 font-mono text-[13px] leading-relaxed bg-[#0c0c0c] text-emerald-400 selection:bg-emerald-500/30"
        >
          {output || <span className="text-zinc-700 italic">Waiting for connection... Type a command below.</span>}
          {isLoading && (
            <div className="flex items-center gap-2 text-amber-500 mt-2 animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing...
            </div>
          )}
        </pre>

        {/* Command Input Bar */}
        <form 
          onSubmit={handleRunCommand}
          className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex gap-3"
        >
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-emerald-600 font-bold font-mono text-sm">{">"}</span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. show ip route"
              disabled={isLoading}
              className="pl-8 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 font-mono text-sm focus-visible:ring-emerald-500"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all active:scale-95 px-6"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
