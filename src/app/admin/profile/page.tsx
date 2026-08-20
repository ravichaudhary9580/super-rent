import { Shield } from "lucide-react";

export default function AdminProfile() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto md:mx-0 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Platform super administrator identity and access status.</p>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="h-24 w-24 bg-purple-100 text-purple-700 rounded-3xl flex items-center justify-center text-3xl font-black shrink-0 shadow-lg shadow-purple-600/10">
            AD
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900">System Administrator</h2>
            <p className="text-slate-500 text-sm font-medium">admin@superrent.com</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-purple-200">
                <Shield className="w-3.5 h-3.5" /> SUPER ADMIN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
