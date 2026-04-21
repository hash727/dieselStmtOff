// app/dashboard/settings/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import EngineProfileForm from "@/components/settings/engine-profile-form";
import ServiceHistory from "@/components/settings/service-history";
import ResetStockForm from "@/components/settings/reset-stock-form";
import { redirect } from "next/navigation";
import ConsumptionGuide from "@/components/settings/consumption-guide";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await auth();
  const officeId = session?.user?.activeOfficeId;
  const userRole = session?.user?.role;

  if (!officeId) redirect("/onboarding");

  // Check if the user has permission to edit
  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";

  // Get current month details for the Reset Form
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const engine = await prisma.engine.findUnique({
    where: { officeId },
    include: {
        updatedBy: {
            select: {
                name: true,
            },
        },
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage DG profiles and system baseline</p>
        </div>
        {!canEdit && (
          <Badge variant="outline" className="text-amber-600 bg-amber-50">View Only Mode</Badge>
        )}
      </div>

      {!canEdit && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Restricted Access</AlertTitle>
          <AlertDescription>
            You are in view-only mode. Contact your SSA Admin or Manager to change these settings.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="engine" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-zinc-900">
          <TabsTrigger value="engine">Engine Profile</TabsTrigger>
          <TabsTrigger value="service">B-Check Log</TabsTrigger>
          <TabsTrigger value="users">User Access</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* 1. Engine Profile Tab */}
        <TabsContent value="engine">
          <Card>
            <CardHeader>
              <CardTitle>DG Set Specifications</CardTitle>
              <CardDescription>Technical details used for fuel and runtime audits.</CardDescription>
            </CardHeader>
            <CardContent>
              <EngineProfileForm 
                initialData={engine} 
                officeId={officeId} 
                isReadOnly={!canEdit}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <ConsumptionGuide />

          </div>

        </TabsContent>

        {/* 2. Service/B-Check Tab */}
        <TabsContent value="service">
          <ServiceHistory 
            engine={engine} 
            officeId={officeId} 
            isReadOnly={!canEdit}
          />
        </TabsContent>

        {/* 3. User Access (Placeholder) */}
        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>Staff Access</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground italic">
              User permissions are managed by the SSA Admin.
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Advanced/Reset Tab */}
        <TabsContent value="advanced">
          <div className="space-y-6">
            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader>
                <CardTitle className="text-red-600">Initial Stock Correction</CardTitle>
                <CardDescription>
                  Manually adjust the opening balance for a specific month. 
                  Use this if the physical tank dip reading differs from the digital ledger.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Pass current month/year to pre-fill the form */}
                <ResetStockForm 
                    officeId={officeId} 
                    currentMonth={currentMonth} 
                    currentYear={currentYear} 
                    isReadOnly={!canEdit}
                  />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Audit</CardTitle>
                <CardDescription>View system-wide calculated stock vs manual overrides.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Current Office ID: <code className="bg-slate-100 p-1 rounded">{officeId}</code></p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
