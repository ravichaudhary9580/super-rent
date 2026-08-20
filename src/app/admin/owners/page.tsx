"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Search, 
  PlusCircle, 
  Wallet, 
  DollarSign, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  X,
  Building
} from "lucide-react";

export default function AdminOwnersManagement() {
  const [owners, setOwners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  
  // Modal State for Adding Wallet Credits
  const [selectedOwner, setSelectedOwner] = useState<any | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(500);
  const [creditNote, setCreditNote] = useState<string>("Admin Promotional Credit");
  const [isSubmittingCredit, setIsSubmittingCredit] = useState<boolean>(false);

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/owners");
      if (res.ok) {
        const data = await res.json();
        setOwners(data.owners || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleGrantCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwner) return;

    try {
      setIsSubmittingCredit(true);
      setMessage("");

      const res = await fetch("/api/admin/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: selectedOwner._id || selectedOwner.id,
          amount: creditAmount,
          note: creditNote
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add credit");

      setMessage(`Successfully added ₹${creditAmount} credit to ${selectedOwner.name}'s wallet!`);
      await fetchOwners();
      
      setTimeout(() => {
        setSelectedOwner(null);
        setMessage("");
      }, 1500);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmittingCredit(false);
    }
  };

  const filteredOwners = owners.filter(
    (o) =>
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBalance = owners.reduce((acc, curr) => acc + (curr.walletBalance || 0), 0);
  const totalSpent = owners.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);
  const totalPurchases = owners.reduce((acc, curr) => acc + (curr.purchasesCount || 0), 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Hostel & PG Owner Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage property buyers, monitor wallet balances, and issue promotional lead credits.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Owners</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{owners.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Owner Balances</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">₹{totalBalance.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Lead Sales</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">₹{totalSpent.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Leads Unlocked</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalPurchases}</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Controls Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search owners by name, phone, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing {filteredOwners.length} Registered Owners
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Loading owner accounts & wallet balances...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Property Owner</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Wallet Balance</th>
                  <th className="py-4 px-6">Properties & Leads</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      No property owners found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Owner Identity */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                            {owner.name[0]?.toUpperCase() || "O"}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{owner.name}</p>
                            <p className="text-xs text-blue-600 font-semibold">Verified Owner</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6 space-y-1">
                        <p className="text-xs text-slate-700 flex items-center gap-1 font-bold">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {owner.phone}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {owner.email}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" /> {owner.location}
                        </p>
                        <p className="text-xs text-slate-400">{owner.city}</p>
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-black text-sm">
                          <Wallet className="w-4 h-4 text-emerald-600" />
                          <span>₹{owner.walletBalance?.toLocaleString("en-IN") || 0}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Total Spent: ₹{owner.totalSpent || 0}</p>
                      </td>

                      {/* Properties & Leads Count */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-500" /> {owner.propertiesCount} Hostels
                          </span>
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
                            {owner.purchasesCount} Leads Bought
                          </span>
                        </div>
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedOwner(owner)}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-1.5 shadow-sm shadow-blue-600/20 active:scale-95"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Add Wallet Credit</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant Wallet Credit Modal */}
      {selectedOwner && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedOwner(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Grant Owner Wallet Credit</h3>
              <p className="text-slate-500 text-sm mt-1">Issue bonus lead purchasing credits for <strong>{selectedOwner.name}</strong>.</p>
            </div>

            <form onSubmit={handleGrantCredit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Credit Amount</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCreditAmount(amt)}
                      className={`py-3 rounded-2xl font-black text-base border transition-all ${
                        creditAmount === amt
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  placeholder="Enter custom amount..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-extrabold text-slate-900 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Credit Description / Note</label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="e.g. Promotional Bonus Credit"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCredit}
                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {isSubmittingCredit ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                <span>{isSubmittingCredit ? "Crediting Wallet..." : `Issue ₹${creditAmount} Wallet Credit`}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
