"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileCode, CalendarDays } from "lucide-react";
import CompleteExportPdfButton from "@/components/reports/complete-export-pdf-button";
import { MultiSelectOffices } from "./multiselection-offices";


interface ReportToolbarProps {
  statementWithBalance: any[];
  officeName: string;
  exchangeList: any[];
  activeOffice: any;
  engineMake: any;
  engineCapacity: any;
  engineInstalDate: any;
  selectedMonth: number;
  selectedYear: number;
  fleetCardNumber: string;
}

export default function ReportToolbar({
  statementWithBalance,
  officeName,
  exchangeList = [],
  activeOffice,
  engineMake,
  engineCapacity,
  engineInstalDate,
  selectedMonth,
  selectedYear,
  fleetCardNumber
}: ReportToolbarProps) {
  const currentYear = new Date().getFullYear();
  const nextYearShort = String(currentYear + 1).slice(-2);
  
  // 1. Core States
  const [lrNo, setLrNo] = useState(`BSNL/KTK-BLY/OP/Corr on legal/${currentYear}-${nextYearShort}/DG-09`);
  
  // DYNAMIC COMPILATION: Converts raw calendar integers into "MonthName-YYYY" (e.g. "May-2026")
  const monthLabel = new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long' });
  const monthReportString = `${monthLabel}-${currentYear}`;

  // Initialize checklist state with all office IDs pre-selected by default
  const [selectedOfficeIds, setSelectedOfficeIds] = useState<string[]>([]);

  // Synchronise state options when server data changes
  useEffect(() => {
    if (exchangeList.length > 0) {
      setSelectedOfficeIds(exchangeList.map((ex) => ex.id));
    }
  }, [exchangeList]);

  // Extract a minimalist identification mapping configuration for the selector dropdown
  const multiSelectOptions = exchangeList.map((ex) => ({
    id: ex.id,
    name: ex.officeName || "Unknown Station",
  }));

  // DYNAMIC IN-MEMORY FILTER: Keep only user-selected offices for Page 2 rendering calculations
  const filteredExchangeList = exchangeList.filter((ex) => selectedOfficeIds.includes(ex.id));

  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).replace(/\//g, "-");

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-end gap-4 w-full justify-end bg-slate-50/50 p-3 rounded-lg border border-dashed">
      
      {/* Selector Checkbox Input Controller Block */}
      <div className="space-y-1.5 w-full sm:w-auto text-left">
        <Label className="text-xs font-semibold text-slate-700">
          Filter Included Exchanges (Page 2 Summary)
        </Label>
        <MultiSelectOffices 
          options={multiSelectOptions}
          selectedIds={selectedOfficeIds}
          onChange={setSelectedOfficeIds}
        />
      </div>

      {/* Dispatch letter number input field */}
      <div className="space-y-1.5 w-full sm:w-64 text-left">
        <Label htmlFor="lrNoInput" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <FileCode className="h-3.5 w-3.5 text-sky-600" />
          Dispatch Letter Number (Lr. No.)
        </Label>
        <Input
          id="lrNoInput"
          type="text"
          value={lrNo}
          onChange={(e) => setLrNo(e.target.value)}
          placeholder="e.g. BSNL/BLY/2026-27/DG"
          className="h-9 font-mono text-xs shadow-sm bg-background"
        />
      </div>

      {/* Structured date indicator bubble */}
      <div className="hidden lg:flex flex-col space-y-1.5 text-left">
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
          Letter Date
        </Label>
        <div className="h-9 px-3 border rounded-md bg-background text-xs font-mono flex items-center justify-center text-muted-foreground shadow-sm">
          {todayFormatted}
        </div>
      </div>

      {/* Download Execution Button Pipeline */}
      <CompleteExportPdfButton
        data={statementWithBalance} 
        officeName={officeName}
        // CRITICAL FIX: Pass the filtered list. Page 2 row maps and subdivision aggregates adjust instantly!
        exchangeList={filteredExchangeList} 
        summary={{
          openingBalance: typeof statementWithBalance?.[0] === 'object' && statementWithBalance?.[0] !== null
            ? (statementWithBalance[0] as any).runningBalance || 0 
            : 0, 
          fleetCardNumber: fleetCardNumber,
          engineMake,
          engineCapacity,
          engineInstalDate,
          currentStock: activeOffice.stockBalance,
          totalRuntime: activeOffice.totalEngineRun,
          totalConsumption: activeOffice.totalConsumption,
          lrNo: lrNo,
          date: todayFormatted,
          monthReport: monthReportString
        }}
      />
    </div>
  );
}
