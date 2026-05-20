// app/olt/manage/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ListFilter, ShieldCheck } from "lucide-react";
import OltForm from "../_components/olt-form";
import OltTable from "../_components/olt-table";
import { getOlts } from "@/app/actions/olt";
import OltFilters from "../_components/olt-filters";

export default async function ManageOlts() {
    const result = await getOlts();

    const olts = Array.isArray(result) ? result : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100">OLT Inventory</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Configure and audit network nodes</p>
        </div>
        <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
           <ShieldCheck className="h-4 w-4 text-emerald-600" />
           <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">VLAN Auto-Conflict Check Active</span>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
          <TabsTrigger value="list" className="rounded-lg gap-2 text-xs font-bold">
            <ListFilter className="h-3.5 w-3.5" /> View All
          </TabsTrigger>
          <TabsTrigger value="add" className="rounded-lg gap-2 text-xs font-bold">
            <PlusCircle className="h-3.5 w-3.5" /> Register OLT
          </TabsTrigger>
        </TabsList>

        {/* <TabsContent value="list" className="pt-4">
           
           <OltTable olts={olts}/> 
        </TabsContent> */}

        <TabsContent value="add" className="pt-4">
           <OltForm />
        </TabsContent>

        <TabsContent value="list">
            {/* OltFilters now manages the table and the search logic */}
            <OltFilters olts={olts} /> 
      </TabsContent>
      </Tabs>
    </div>
  );
}
