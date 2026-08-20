"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ShieldCheck, Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return setError("Please enter your admin phone number");
    if (!password) return setError("Please enter your admin password");

    setIsLoading(true);
    setError("");

    try {
      // Ensure admin user is seeded in database
      await fetch("/api/admin/seed", { method: "POST" });

      const res = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error || "Invalid admin credentials");
      }

      // Successful admin login -> redirect directly to admin dashboard
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Lighting Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-8 backdrop-blur-xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Portal
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Sign In</h1>
          <p className="text-slate-400 text-sm mt-1">Authenticate with your Admin Phone & Password.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-extrabold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          {/* Phone Number */}
          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Admin Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="tel"
                placeholder="+91 99999 99999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-bold text-base"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-12 py-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-bold text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl shadow-xl font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all text-base disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-950" /> : <span>Sign In as Admin</span>}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

      </div>
    </div>
  );
}
