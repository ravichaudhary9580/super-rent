"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Phone, Lock, User, Loader2, ArrowRight } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "signup" || urlMode === "login") {
      setMode(urlMode);
    }
  }, [searchParams]);

  const toggleMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError("");
    setStep("phone");
  };

  const handleDirectLogin = async (loginPhone: string, userName?: string) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        name: userName || (loginPhone.includes("1122334455") ? "Test Tenant" : "Test Owner"),
        phone: loginPhone,
        otp: "123456",
        redirect: true,
        callbackUrl: "/onboarding",
      });

      if (res?.error) throw new Error(res.error);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !name.trim()) {
      return setError("Please enter your full name");
    }
    if (phone.length < 10) {
      return setError("Please enter a valid phone number");
    }

    // Auto-bypass OTP for test numbers
    if (phone.includes("1122334455") || phone.includes("6677889900")) {
      return handleDirectLogin(phone, mode === "signup" ? name.trim() : undefined);
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, mode }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return setError("Please enter the 6-digit OTP");
    
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        name: mode === "signup" ? name.trim() : undefined,
        phone,
        otp,
        redirect: true,
        callbackUrl: "/onboarding", // Middleware will route correctly if onboarded
      });
      
      if (res?.error) throw new Error(res.error);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800 transition-all">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {mode === "signup"
              ? "Join SuperRent to search properties and manage leads."
              : "Sign in to access your properties or dashboard."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            {/* Full Name Input (Sign Up Mode Only) */}
            {mode === "signup" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === "signup"}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl shadow-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 active:scale-[0.99]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{mode === "signup" ? "Create Account & Send OTP" : "Send OTP"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Enter 6-Digit OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold tracking-widest text-xl text-center"
                />
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                Code sent to <span className="font-bold text-slate-800 dark:text-slate-200">{phone}</span>.{" "}
                <button type="button" onClick={() => setStep("phone")} className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                  Edit Number
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl shadow-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 active:scale-[0.99]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>{mode === "signup" ? "Verify & Complete Signup" : "Verify & Sign In"}</span>
              )}
            </button>
          </form>
        )}

        {/* Quick Test Accounts */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
            Quick Test Logins (No OTP)
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setPhone("1122334455");
                handleDirectLogin("1122334455", "Test Tenant");
              }}
              className="py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-semibold flex flex-col items-center justify-center transition-all"
            >
              <span>👤 Test Tenant</span>
              <span className="text-[10px] text-blue-500 font-mono mt-0.5">1122334455</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setPhone("6677889900");
                handleDirectLogin("6677889900", "Test Owner");
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-semibold flex flex-col items-center justify-center transition-all"
            >
              <span>🏠 Test Owner</span>
              <span className="text-[10px] text-emerald-500 font-mono mt-0.5">6677889900</span>
            </button>
          </div>
        </div>

        {/* Account Mode Switcher Footer */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 text-center space-y-3">
          {mode === "login" ? (
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => toggleMode("signup")}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create Account
              </button>
            </p>
          ) : (
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => toggleMode("login")}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}

          <div>
            <a href="/admin/login" className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              Super Admin Portal →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
