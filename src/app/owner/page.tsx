import { Building, DollarSign, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default function OwnerDashboard() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Owner Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Here is the overview of your properties and generated leads.</p>
        </div>
        <Link href="/owner/properties" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
          <Building className="h-4 w-4" />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { title: "Active Listings", value: "3", icon: <Building className="h-6 w-6" />, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Total Leads Generated", value: "48", icon: <Users className="h-6 w-6" />, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Hot Leads", value: "12", icon: <TrendingUp className="h-6 w-6" />, color: "text-orange-600", bg: "bg-orange-50" },
          { title: "Purchased Leads", value: "5", icon: <DollarSign className="h-6 w-6" />, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((metric) => (
          <div key={metric.title} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 sm:block">
            <div className={`w-12 h-12 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center sm:mb-4 shrink-0`}>
              {metric.icon}
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">{metric.value}</h3>
              <p className="text-slate-500 font-medium text-xs sm:text-sm">{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50/80 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-blue-900 mb-1.5">You have 12 Hot Leads waiting!</h2>
          <p className="text-blue-700 text-xs sm:text-sm max-w-2xl leading-relaxed">Tenants are highly interested in your properties right now. Unlock their contact info to reach out and close the deal before they book elsewhere.</p>
        </div>
        <Link href="/owner/leads" className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all shrink-0">
          Go to Marketplace
        </Link>
      </div>
    </div>
  );
}
