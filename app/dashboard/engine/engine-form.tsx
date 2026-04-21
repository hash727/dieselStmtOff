'use client'
import { saveEngineLog } from '@/app/actions/engine'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Timer, ZapOff, Gauge, Fuel, CalendarDays } from "lucide-react"

const EngineForm = ({
  officeId,
  consumptionRate,
  lastMeter,
  initialBalance,
  defaultDate,
  minDate, 
  maxDate, 
}: {
  officeId: string;
  consumptionRate: number;
  lastMeter: number;
  initialBalance: number;
  defaultDate: Date;
  minDate: string;
  maxDate: string;
}) => {
  const [isPending, startTransition] = useTransition();

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const [times, setTimes] = useState({
    date: formatDate(defaultDate),
    powerOff: "",
    engineOn: "",
    powerOn: "",
    engineOff: "",
    openingDiesel: "",
    openMeter: lastMeter.toFixed(2) || "",
    closeMeter: "",
  });

  useEffect(() => {
    setTimes(prev => ({
      ...prev,
      date: formatDate(defaultDate),
      openMeter: lastMeter.toFixed(2),
      closeMeter: "" 
    }));
  }, [defaultDate, lastMeter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimes(prev => ({ ...prev, [e.target.name]: e.target.value}));
  };

  const durations = useMemo(() => {
    const getMs = (timeStr: string) => timeStr ? new Date(`${times.date}T${timeStr}`).getTime() : 0;
    const pOff = getMs(times.powerOff);
    const pOn = getMs(times.powerOn);
    const eOn = getMs(times.engineOn);
    const eOff = getMs(times.engineOff);

    const calcHrs = (start: number, end: number) => {
      if(!start || !end) return 0;
      let diff = end - start;
      if (diff < 0) diff += 24 * 60 * 60 * 1000; 
      return diff / (1000 * 60 * 60);
    };

    const powerCut = calcHrs(pOff, pOn);
    const engineRun = calcHrs(eOn, eOff);
    const liveConsumption = consumptionRate * engineRun;

    return {
      powerCut: powerCut.toFixed(2),
      engineRun: engineRun.toFixed(2),
      consumption: liveConsumption.toFixed(2)
    };
  }, [times, consumptionRate]);

  useEffect(() => {
    const open = parseFloat(times.openMeter) || 0;
    const runTime = parseFloat(durations.engineRun) || 0;
    if(runTime > 0){
      setTimes(prev => ({
        ...prev,
        closeMeter: (open + runTime).toFixed(2)
      }));
    }
  },[times.openMeter, durations.engineRun]);

  const isMeterInvalid = parseFloat(times.openMeter) < lastMeter;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await saveEngineLog({ success: false, error: null }, formData);
      if (res.success) {
        toast.success("Log added successfully");
        setTimes(prev => ({
          ...prev,
          powerOff: "", engineOn: "", powerOn: "", engineOff: "",
          openMeter: prev.closeMeter,
          closeMeter: ""
        }));
      } else {
        toast.error(res.error || "Failed to save log");
      }
    });
  };
  
  return (
    <form action={handleSubmit} className='space-y-6'>
       <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-5 items-end">
        <input type="hidden" name="officeId" value={officeId} />
        
        {/* Date Field */}
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Date</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <Input 
              type="date" 
              name="date" 
              value={times.date} 
              onChange={handleChange} 
              min={minDate}
              max={maxDate}
              required
              className="pl-9 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Diesel Field */}
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Diesel Opening</Label>
          <div className="relative">
            <Fuel className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <Input 
              type="number" 
              value={initialBalance.toFixed(2)}
              className="pl-9 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 font-mono text-blue-600 dark:text-blue-400 font-semibold"
              readOnly
            />
          </div>
        </div>

        {/* Meter Opening */}
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <Label className={`text-[11px] uppercase tracking-widest font-bold ${isMeterInvalid ? "text-red-500" : "text-slate-500 dark:text-zinc-400"}`}>
              Meter Open
            </Label>
            <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase">
              Prev: {lastMeter.toFixed(2)}
            </span>
          </div>
          <div className="relative">
            <Gauge className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <Input 
              type="number" 
              name="openMeter" 
              className={`pl-9 bg-white dark:bg-zinc-950 font-mono ${isMeterInvalid ? "border-red-500 ring-red-500" : "border-slate-200 dark:border-zinc-800"}`}
              value={lastMeter.toFixed(2)}
              onChange={handleChange} 
            />
          </div>
        </div>

        {/* Meter Closing */}
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Meter Close</Label>
          <Input 
            type="number" 
            name="closeMeter" 
            value={times.closeMeter} 
            onChange={handleChange} 
            placeholder="0.00"
            className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 font-mono text-emerald-600 dark:text-emerald-400 font-bold placeholder:text-slate-300 dark:placeholder:text-zinc-700"
          />
        </div>

        {/* Time Inputs Group */}
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Power Off</Label>
          <Input type="time" name="powerOff" value={times.powerOff} onChange={handleChange} className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800" />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Engine On</Label>
          <Input type="time" name="engineOn" value={times.engineOn} onChange={handleChange} className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800" />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Power On</Label>
          <Input type="time" name="powerOn" value={times.powerOn} onChange={handleChange} className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800" />
        </div>
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Engine Off</Label>
          <Input type="time" name="engineOff" value={times.engineOff} onChange={handleChange} className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800" />
        </div>

        {/* Submit Button */}
        <div className="lg:col-span-1">
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold shadow-sm transition-transform active:scale-[0.98]" disabled={isPending}>
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving</>
            ) : (
              "Save Log"
            )}
          </Button>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800/60">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <ZapOff className="h-3.5 w-3.5 text-red-500" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Power Cut:</span>
          <span className="text-xs font-bold font-mono">{durations.powerCut} hr</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <Timer className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Run:</span>
          <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">{durations.engineRun} hr</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm ml-auto">
          <Fuel className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">Used:</span>
          <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">{durations.consumption} L</span>
        </div>
      </div>
    </form>
  )
}

export default EngineForm;
