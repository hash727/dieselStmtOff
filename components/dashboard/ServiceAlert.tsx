// components/dashboard/ServiceAlert.tsx
import { getEngineServiceStatus } from "@/lib/actions/service-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wrench } from "lucide-react";

export default async function ServiceAlert({ officeId }: { officeId: string }) {
  const status = await getEngineServiceStatus(officeId);

  if (!status?.isWarning) return null;

  return (
    <Alert variant={status.isUrgent ? "destructive" : "default"} className="mb-6">
      <Wrench className="h-4 w-4" />
      <AlertTitle>{status.isUrgent ? "B-Check Overdue!" : "Service Approaching"}</AlertTitle>
      <AlertDescription>
        DG has run <strong>{status.hoursSinceService} hours</strong> since last service. 
        Scheduled maintenance (B-Check) is required every 500 hours or 6 months.
      </AlertDescription>
    </Alert>
  );
}
