"use client";

import { useState, useEffect } from "react";
import { Search, Shield, User as UserIcon, Loader2, Phone, Mail } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedRole !== "all") params.set("role", selectedRole);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 text-sm mt-1">View registered tenants, property owners, and system administrators.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or email..." 
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full focus:outline-none focus:border-blue-500 text-sm font-medium" 
            />
          </form>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            {["all", "tenant", "owner", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedRole === r
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {r === "all" ? "All Users" : r}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">Loading user accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-semibold">
              No users found matching your search.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-right">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-slate-400 text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-300" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        user.role === 'owner' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3.5 h-3.5" />}
                        {user.role === 'owner' && <UserIcon className="w-3.5 h-3.5" />}
                        {user.role || 'tenant'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-medium text-right">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
