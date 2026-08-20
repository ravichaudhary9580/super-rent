"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <main className="min-h-screen w-full bg-slate-950">{children}</main>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dashboard-scaled">
      <Sidebar role="admin" />
      <main className="flex-1 w-full overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
