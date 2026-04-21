"use client";

import React, { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, History, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { updateEngineProfile } from "@/app/actions/engine";

export default function ServiceHistory({ 
  engine, 
  officeId, 
  isReadOnly 
}: { 
  engine: any, 
  officeId: string,
  isReadOnly: boolean 
}) {
  const [isPending, startTransition] = useTransition();

  const handleServiceUpdate = (formData: FormData) => {
    startTransition(async () => {
      // We reuse your existing updateEngineProfile action
      // but focus on the service fields
      const res = await updateEngineProfile(officeId, {
        ...engine,
        lastServiceDate: formData.get("lastServiceDate"),
        lastServiceHours: parseFloat(formData.get("lastServiceHours") as string),
      });

      if (res.success) {
        toast.success("B-Check Record Updated Successfully");
      } else {
        toast.error("Failed to update service record");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-900/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-amber-600" />
            <CardTitle>Record New B-Check</CardTitle>
          </div>
          <CardDescription>Update the engine records after a formal maintenance service.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleServiceUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Service Date</Label>
              <Input type="date" disabled={isReadOnly} name="lastServiceDate" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-2">
              <Label>Meter Reading at Service</Label>
              <Input type="number" disabled={isReadOnly} step="0.1" name="lastServiceHours" placeholder="Current Meter" required />
            </div>
            {!isReadOnly && (
              <Button type="submit" disabled={isPending} className="bg-amber-600 hover:bg-amber-700">
                {isPending ? "Updating..." : "Confirm B-Check"}
              </Button>
            )}
            
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" />
            <CardTitle>Current Service Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Recorded Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Last B-Check Date</TableCell>
                <TableCell>{engine?.lastServiceDate ? new Date(engine.lastServiceDate).toLocaleDateString('en-GB') : 'No Record'}</TableCell>
                <TableCell><CheckCircle2 className="h-4 w-4 text-emerald-500" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Last Service Meter</TableCell>
                <TableCell>{engine?.lastServiceHours || 0} Hrs</TableCell>
                <TableCell><CheckCircle2 className="h-4 w-4 text-emerald-500" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
