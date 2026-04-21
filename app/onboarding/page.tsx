// app/onboarding/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import OnboardingForm from "./onboarding-form";
import { redirect } from "next/navigation";
import { getOnboardingOffices } from "../actions/onboarding";


const onboardingPage = async () => {
  const session = await auth();
  // BACKSTOP: If the user already has offices, don't even render this page
  // if (session?.user?.assignedOffices && session.user.assignedOffices.length > 0) {
  //   redirect("/dashboard/engine");
  
  // 1. Check session FIRST before calling any other functions
  if (!session?.user) {
    redirect("/login");
  }

   // 1. If the user is a standard "USER", they should NEVER be here.
  // Send them to the dashboard immediately.
  if (session?.user?.role === "USER") {
    redirect("/dashboard/engine");
  }

  // 2. Only redirect ADMINS/STAFF if they already have an office
  if (session?.user?.activeOfficeId) {
    redirect("/dashboard/engine");
  }

  const offices = await getOnboardingOffices();
  

  console.log("Onboarding Session: ", session);

  if(!session?.user) redirect("/login");
  // if(session.user.officeId) redirect("/dashboard/engine")

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Select Your Office</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {session?.user?.role === "ADMIN" 
              ? "As an Admin, you can select from all available offices." 
              : "Please select your assigned office to begin logging."}
          </p>
        </div>

        {/* This is your client component form */}
        <OnboardingForm offices={offices} />
      </div>
    </div>
  );
}

export default onboardingPage;
