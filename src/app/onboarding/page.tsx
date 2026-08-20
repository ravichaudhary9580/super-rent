"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building, User, Phone, Lock, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [role, setRole] = useState<"tenant" | "owner" | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  const [step, setStep] = useState<"role" | "phone" | "otp">("role");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const hasPhone = !!(session?.user as any)?.phone;
  const isReady = status !== "loading";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // If they explicitly don't require onboarding, redirect to their dashboard
    if (status === "authenticated" && (session as any)?.requiresOnboarding === false) {
      router.push(`/${(session.user as any)?.role || "tenant"}`);
    }
  }, [status, session, router]);

  if (!isReady || status === "unauthenticated") {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const handleRoleSelection = (selectedRole: "tenant" | "owner") => {
    setRole(selectedRole);
    if (hasPhone) {
      submitOnboarding(selectedRole, null, null);
    } else {
      setStep("phone");
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return setError("Please enter a valid phone number");
    
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
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
    
    if (role) {
      submitOnboarding(role, phone, otp);
    }
  };

  const submitOnboarding = async (finalRole: string, finalPhone: string | null, finalOtp: string | null) => {
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: finalRole, phone: finalPhone, otp: finalOtp }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      
      // Update NextAuth session cookie so middleware unblocks them
      await update();
      
      // Redirect to the newly selected role dashboard
      window.location.href = `/${finalRole}`; 
      
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 border border-slate-100">
        
        {step === "role" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">How will you use SuperRent?</h1>
              <p className="text-slate-500 text-lg">Select your primary goal to personalize your experience.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <button 
                onClick={() => handleRoleSelection("tenant")}
                disabled={isLoading}
                className="group relative flex flex-col items-center text-center p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl hover:border-blue-500 hover:bg-blue-50/50 transition-all disabled:opacity-50"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">I am a Tenant</h3>
                <p className="text-slate-500">I want to search for PGs, Hostels, and Flats to rent.</p>
                {role === "tenant" && isLoading && <Loader2 className="absolute top-4 right-4 w-5 h-5 text-blue-600 animate-spin" />}
              </button>

              <button 
                onClick={() => handleRoleSelection("owner")}
                disabled={isLoading}
                className="group relative flex flex-col items-center text-center p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all disabled:opacity-50"
              >
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">I am an Owner</h3>
                <p className="text-slate-500">I want to list properties and find high-quality leads.</p>
                {role === "owner" && isLoading && <Loader2 className="absolute top-4 right-4 w-5 h-5 text-indigo-600 animate-spin" />}
              </button>
            </div>
          </div>
        )}

        {(step === "phone" || step === "otp") && (
          <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Verify your Number</h1>
              <p className="text-slate-500">Please enter your phone number to receive property inquiries and notifications.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-lg"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-70 text-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
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
                      className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold tracking-widest text-2xl text-center"
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-500 text-center">
                    Code sent to <span className="font-bold text-slate-700">{phone}</span>. <button type="button" onClick={() => setStep("phone")} className="text-blue-600 hover:underline">Edit</button>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-md font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 text-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Complete Setup"}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
