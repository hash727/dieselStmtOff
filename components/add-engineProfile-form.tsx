'use client'

import React from 'react'
import { useForm } from "@tanstack/react-form"

import { EngineFormValues, engineProfileSchema } from "@/lib/validation";
import { updateEngineProfile } from "@/app/actions/engine";
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, CalendarIcon, Info, Loader2, PenLine, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { getServiceStatus } from '@/lib/service-status';


type EngineProfileFormProps = {
    officeId: string;
    initialData: EngineFormValues | null | undefined;
    isReadOnly: boolean;
}

const EngineProfileForm = ({ 
    officeId, 
    initialData,
    isReadOnly, 
}: EngineProfileFormProps) => {
   
    const form = useForm({
        defaultValues: {
            make: initialData?.make ?? "",
            capacity: initialData?.capacity ?? "",
            serialNumber: initialData?.serialNumber ?? "",
            consupmtionRate: initialData?.consumptionRate ?? 0,
            installationDate: initialData?.installationDate ? new Date(initialData.installationDate) : undefined as Date | undefined,
            lastServiceDate: initialData?.lastServiceDate ? new Date(initialData.lastServiceDate) : undefined as Date | undefined,
        },
        onSubmit: async ({ value }) => {
            const result = await updateEngineProfile(officeId, value);
            if(result.success){
                toast.success("Engine Profile updated!");
            }else {
                toast.error(result.error)
            }
        },
    });
    // async function onSubmit(values: EngineFormValues){
    //     console.log(values);
    //     updateEngineProfile(officeId, values)
    // }
  return (
    <form
        onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
        }}
        className='space-y-8 max-w-3xl p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm'
    >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-5">
            <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-blue-500" />
                    Engine Technical Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Specifications and maintenance history of the generator.</p>
            </div>
            {isReadOnly && (
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-900 text-slate-500 px-2 py-1 rounded uppercase tracking-widest border border-slate-200 dark:border-zinc-800">
                    Read Only
                </span>
            )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
            {/* Make Field */}
            <form.Field name="make">
                {(field) => (
                    <div className='space-y-2.5'>
                        <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold" htmlFor={field.name}>Engine Make / Brand</Label>
                        <Input
                            id={field.name}
                            disabled={isReadOnly}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g. Cummins / Perkins"
                            className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 transition-colors"
                        />   
                        {field.state.meta.errors.length > 0 && (
                             <p className="text-[10px] font-medium text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Capacity Field */}
            <form.Field name="capacity">
                {(field) => (
                    <div className='space-y-2.5'>
                        <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold" htmlFor={field.name}>Capacity (kVA / kW)</Label>
                        <Input
                            id={field.name}
                            disabled={isReadOnly}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g. 50KVA"
                            className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 font-mono"
                        />   
                        {field.state.meta.errors.length > 0 && (
                             <p className="text-[10px] font-medium text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Serial Number Field */}
            <form.Field name="serialNumber">
                {(field) => (
                    <div className='space-y-2.5'>
                        <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold" htmlFor={field.name}>Serial Number</Label>
                        <Input
                            id={field.name}
                            disabled={isReadOnly}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g. DG-99021"
                            className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 font-mono"
                        />   
                        {field.state.meta.errors.length > 0 && (
                             <p className="text-[10px] font-medium text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Consumption Rate Field */}
            <form.Field name="consupmtionRate">
                {(field) => (
                    <div className='space-y-2.5'>
                        <div className="flex justify-between items-center">
                            <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold" htmlFor={field.name}>Consumption (L/Hr)</Label>
                            <Info className="h-3 w-3 text-slate-300" />
                        </div>
                        <Input
                            id={field.name}
                            type="number"
                            disabled={isReadOnly}
                            step="0.10"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(Number(e.target.value))}
                            className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 font-mono text-blue-600 dark:text-blue-400 font-bold"
                        />   
                        {field.state.meta.errors.length > 0 && (
                             <p className="text-[10px] font-medium text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Installation Date */}
            <form.Field name="installationDate">
                {(field) => (
                    <div className='flex flex-col space-y-2.5'>
                        <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Installation Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    disabled={isReadOnly}
                                    className={cn(
                                        "justify-start text-left font-normal bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800",
                                        !field.state.value && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className='mr-2 h-4 w-4 opacity-50' />
                                    {field.state.value ? format(field.state.value, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950' align="start">
                                <Calendar
                                    mode='single'
                                    selected={field.state.value}
                                    onSelect={(date) => field.handleChange(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            </form.Field>


            {/* Last Service Date */}
            <form.Field name="lastServiceDate">
                {(field) => (
                    <div className='flex flex-col space-y-2.5'>
                        <Label className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-bold">Last Service Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    disabled={isReadOnly}
                                    className={cn(
                                        "justify-start text-left font-normal bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800",
                                        !field.state.value && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className='mr-2 h-4 w-4 opacity-50' />
                                    {field.state.value ? format(field.state.value, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950' align="start">
                                <Calendar
                                    mode='single'
                                    selected={field.state.value}
                                    onSelect={(date) => field.handleChange(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}
            </form.Field>
        </div>

        {!isReadOnly && (
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-900">
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                    {([canSubmit, isSubmitting]) => (
                        <Button 
                            type="submit" 
                            disabled={!canSubmit || isSubmitting}
                            className="w-full md:w-auto px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold transition-transform active:scale-[0.98] shadow-sm"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                            ) : (
                                <><PenLine className="mr-2 h-4 w-4" /> Save Profile Changes</>
                            )}
                        </Button>
                    )}
                </form.Subscribe>
    
          
                {/* Alert for service */}
                <form.Subscribe selector={(state) => [state.values.lastServiceDate]}>
                    {([lastServiceDate]) => {
                        const { isOverdue, nextDate } = getServiceStatus(lastServiceDate);

                        if (!isOverdue) return null;

                        return (
                            <div className="flex items-start gap-3 p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="mt-0.5">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold leading-none tracking-tight">Maintenance Overdue</p>
                                    <p className="text-xs leading-relaxed opacity-90">
                                        Last service was over 6 months ago. Next service was due around{" "}
                                        <span className="font-bold underline decoration-amber-500/30">
                                            {nextDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>.
                                    </p>
                                </div>
                            </div>
                        )
                    }}
                </form.Subscribe>

            </div>
        )}
    </form>
  )
}

export default EngineProfileForm