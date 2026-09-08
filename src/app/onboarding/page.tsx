"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Building, 
  Building2,
  User, 
  Phone, 
  Lock, 
  Loader2, 
  MapPin, 
  GraduationCap, 
  IndianRupee, 
  ArrowRight, 
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [role, setRole] = useState<"tenant" | "owner" | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  // Tenant Questionnaire Fields
  const [city, setCity] = useState("Greater Noida");
  const [location, setLocation] = useState("");
  const [college, setCollege] = useState("");
  const [budget, setBudget] = useState("10000");
  const [gender, setGender] = useState<"any" | "male" | "female">("any");

  // Owner Questionnaire Fields
  const [ownerName, setOwnerName] = useState("");
  const [ownerCity, setOwnerCity] = useState("Greater Noida");
  const [ownerLocation, setOwnerLocation] = useState("");
  const [hostelName, setHostelName] = useState("");

  const [step, setStep] = useState<"role" | "phone" | "otp" | "tenant_questionnaire" | "owner_questionnaire">("role");
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

    // Prepopulate name and check if role was already set
    if (status === "authenticated" && session?.user) {
      if (session.user.name && !ownerName) {
        setOwnerName(session.user.name);
      }
      const existingRole = (session.user as any)?.role;
      if (existingRole === "owner" && step === "role") {
        setRole("owner");
        setStep("owner_questionnaire");
      } else if (existingRole === "tenant" && step === "role") {
        setRole("tenant");
        setStep("tenant_questionnaire");
      }
    }
  }, [status, session, router, step, ownerName]);

  if (!isReady || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleRoleSelection = (selectedRole: "tenant" | "owner") => {
    setRole(selectedRole);
    if (selectedRole === "tenant") {
      if (hasPhone) {
        setStep("tenant_questionnaire");
      } else {
        setStep("phone");
      }
    } else {
      // Owner path - always collect details before landing
      if (hasPhone) {
        setStep("owner_questionnaire");
      } else {
        setStep("phone");
      }
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
    
    if (role === "tenant") {
      setStep("tenant_questionnaire");
    } else if (role === "owner") {
      setStep("owner_questionnaire");
    }
  };

  const handleTenantQuestionnaireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) {
      return setError("Please enter or select a target city");
    }
    if (!location.trim()) {
      return setError("Please specify a nearby address, sector, or area");
    }
    submitOnboarding("tenant", phone || null, otp || null, {
      city: city.trim(),
      location: location.trim(),
      college: college.trim(),
      budget,
      gender
    });
  };

  const handleOwnerQuestionnaireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      return setError("Please enter your full name");
    }
    if (!ownerCity.trim()) {
      return setError("Please enter or select your primary operating city");
    }
    if (!ownerLocation.trim()) {
      return setError("Please specify your area, campus, or locality (e.g. Knowledge Park, Pari Chowk)");
    }
    if (!hostelName.trim()) {
      return setError("Please enter your Hostel or PG brand name");
    }

    submitOnboarding(
      "owner",
      phone || null,
      otp || null,
      undefined,
      {
        name: ownerName.trim(),
        city: ownerCity.trim(),
        location: ownerLocation.trim(),
        hostelName: hostelName.trim(),
        businessName: hostelName.trim()
      }
    );
  };

  const submitOnboarding = async (
    finalRole: string,
    finalPhone: string | null,
    finalOtp: string | null,
    tenantDetails?: { city: string; location: string; college?: string; budget?: string; gender?: string },
    ownerDetails?: { 
      name?: string; 
      city: string; 
      location: string; 
      hostelName: string; 
      businessName: string; 
    }
  ) => {
    setIsLoading(true);
    setError("");
    
    try {
      const payload: any = { role: finalRole, phone: finalPhone, otp: finalOtp };
      if (tenantDetails) {
        Object.assign(payload, tenantDetails);
      }
      if (ownerDetails) {
        Object.assign(payload, ownerDetails);
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete onboarding");
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

  const POPULAR_CITIES = ["Greater Noida", "Noida", "Delhi", "Gurgaon", "Bangalore"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 border border-slate-100">
        
        {/* Step 1: Role Selection */}
        {step === "role" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Provider App"
                className="w-16 h-16 rounded-2xl mx-auto mb-4 object-contain shadow-lg shadow-purple-500/15"
              />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">How will you use Provider App?</h1>
              <p className="text-slate-500 text-lg">Select your primary goal to personalize your experience.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <button 
                onClick={() => handleRoleSelection("tenant")}
                disabled={isLoading}
                className="group relative flex flex-col items-center text-center p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl hover:border-blue-500 hover:bg-blue-50/50 transition-all disabled:opacity-50 cursor-pointer"
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
                className="group relative flex flex-col items-center text-center p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all disabled:opacity-50 cursor-pointer"
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

        {/* Step 2: Phone Verification (if required) */}
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
                  className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-70 text-lg cursor-pointer"
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
                    Code sent to <span className="font-bold text-slate-700">{phone}</span>.{" "}
                    <button type="button" onClick={() => setStep("phone")} className="text-blue-600 hover:underline cursor-pointer">Edit</button>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-md font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 text-lg cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Step 3: Owner Details Questionnaire (Before landing on /owner) */}
        {step === "owner_questionnaire" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center pb-1">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md shadow-indigo-500/10">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="inline-block bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-200/60 mb-1.5">
                Owner Setup • Step 2 of 2
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Tell us about your property & business
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Provide your hostel or PG details so prospective tenants and leads can locate you easily.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleOwnerQuestionnaireSubmit} className="space-y-4 sm:space-y-5">
              {/* Owner / Manager Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Owner / Manager Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Operating City */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Operating City *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setOwnerCity(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        ownerCity.toLowerCase() === c.toLowerCase()
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greater Noida"
                    value={ownerCity}
                    onChange={(e) => setOwnerCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Area / Campus / Locality */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Locality / Sector / Campus Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Knowledge Park III, Pari Chowk, Sector 62, North Campus"
                  value={ownerLocation}
                  onChange={(e) => setOwnerLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Hostel or PG Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hostel / PG Business Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starlight Luxury Boys PG & Hostel"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Welcome Bonus Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-800 font-bold">
                  ₹500 welcome credit will be credited to your lead purchasing wallet upon setup!
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-4 px-5 rounded-2xl shadow-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-70 text-base active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Complete Setup & Launch Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Tenant Preference Questionnaire */}
        {step === "tenant_questionnaire" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center pb-2">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Where are you looking to stay?</h1>
              <p className="text-slate-500 text-sm mt-1">Help us match you with verified hostels and PGs in your target area.</p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleTenantQuestionnaireSubmit} className="space-y-5">
              {/* City Selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Target City *
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        city.toLowerCase() === c.toLowerCase()
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Greater Noida"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Nearby Address / Area */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nearby Address / Locality / Sector *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Knowledge Park III, Pari Chowk, Sector 62"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* College / Workplace (Optional) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  College / University / Workplace <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Sharda University, Galgotias, Bennett"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Budget & Gender Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Estimated Monthly Budget
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="10000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                    Accommodation Type
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {[
                      { id: "any", label: "Any" },
                      { id: "male", label: "Boys" },
                      { id: "female", label: "Girls" }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id as any)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                          gender === g.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-4 px-5 rounded-2xl shadow-lg font-black text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70 text-base active:scale-[0.99] cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Complete Setup & Explore Properties</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
