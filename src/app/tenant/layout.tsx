import { Sidebar } from "@/components/Sidebar";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dashboard-scaled">
      <Sidebar role="tenant" />
      <main className="flex-1 w-full overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
