"use client";

import { importLeasedLines } from "@/app/actions/leasedline";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTransition } from "react";

export default function ImportExcelButton() {
  const [isPending, startTransition] = useTransition();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await importLeasedLines(formData);
      if (res.success) {
        toast.success(`Successfully imported ${res.count} records!`);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleUpload} className="flex items-center gap-2">
      <input 
        type="file" 
        name="file" 
        accept=".xlsx, .xls" 
        required 
        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100" 
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Importing..." : "Upload Excel"}
      </Button>
    </form>
  );
}
