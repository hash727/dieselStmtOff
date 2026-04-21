"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface OfficeContextType {
  activeOfficeId: string;
  isUpdating: boolean;
  switchOffice: (id: string) => void;
}

const OfficeContext = createContext<OfficeContextType | undefined>(undefined);

export function OfficeProvider({ children, initialOfficeId }: { children: React.ReactNode, initialOfficeId: string }) {
  const [activeOfficeId, setActiveOfficeId] = useState(initialOfficeId);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const switchOffice = (id: string) => {
    setActiveOfficeId(id);
    startTransition(() => {
      // 1. You can call a server action here to update the DB session/cookie if needed
      // 2. Force Next.js to re-fetch Server Component data for the new ID
      router.refresh();
    });
  };

  return (
    <OfficeContext.Provider value={{ activeOfficeId, isUpdating: isPending, switchOffice }}>
      {children}
    </OfficeContext.Provider>
  );
}

export const useOffice = () => {
  const context = useContext(OfficeContext);
  if (!context) throw new Error("useOffice must be used within OfficeProvider");
  return context;
};
