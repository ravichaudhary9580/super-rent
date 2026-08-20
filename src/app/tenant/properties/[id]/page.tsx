"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall, 
  ArrowLeft, 
  Heart, 
  Share2, 
  Building, 
  Wifi, 
  Coffee, 
  Tv, 
  UserCheck,
  Calendar,
  Check,
  Loader2
} from "lucide-react";

export default function TenantPropertyDetails({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasContacted, setHasContacted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/properties/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProperty(data.property);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperty();
  }, [params.id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-bold text-sm">Loading property information...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
          <Building className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-slate-500 text-sm">This listing may have expired or been removed by the owner.</p>
        <Link
          href="/tenant/properties"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </Link>
      </div>
    );
  }

  const loc = typeof property.location === "object"
    ? `${property.location.area}, ${property.location.city}`
    : property.location || "Bangalore";

  const ownerName = property.ownerId?.name || "Verified Owner";
  const ownerPhone = property.ownerId?.phone || "+91 98765 43210";

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/tenant/properties"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span>{copiedLink ? "Copied Link!" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl font-semibold text-xs shadow-sm transition-all ${
              isSaved
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
            <span>{isSaved ? "Saved" : "Save Property"}</span>
          </button>
        </div>
      </div>

      {/* Property Hero Gallery */}
      <div className="h-72 sm:h-96 bg-slate-900 rounded-3xl relative w-full overflow-hidden border border-slate-800 shadow-lg">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40">
          <Building className="w-16 h-16 text-blue-500/40 mb-3" />
          <span className="text-2xl font-black text-white/80">{property.title}</span>
          <span className="text-sm font-medium text-slate-400 mt-1">{loc}</span>
        </div>
        <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
          {property.type} Accommodation
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Amenities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified Listing
              </span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                Student & Working Friendly
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {property.title}
            </h1>
            <p className="flex items-center text-slate-500 font-medium text-sm sm:text-base">
              <MapPin className="h-4 w-4 mr-1 text-slate-400 shrink-0" /> {property.location?.fullAddress || loc}
            </p>

            {property.description && (
              <p className="text-slate-600 text-sm leading-relaxed pt-2">
                {property.description}
              </p>
            )}
          </div>

          {/* Amenities Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
              Included Amenities & Perks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(property.amenities && property.amenities.length > 0 ? property.amenities : ["High-Speed WiFi", "Clean Rooms", "Water Supply", "Power Backup"]).map((item: string) => (
                <div key={item} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Pricing & Contact Owner Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/5 sticky top-8 space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Monthly Rent</span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center">
                <IndianRupee className="h-8 w-8 text-blue-600 mr-0.5" /> {property.price?.toLocaleString()}
                <span className="text-sm font-semibold text-slate-400 ml-1.5">/ month</span>
              </div>
            </div>

            {/* Verified Owner Card */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base shrink-0">
                {ownerName[0]?.toUpperCase() || "O"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{ownerName}</p>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Verified Property Owner
                </p>
              </div>
            </div>

            {/* Direct Contact Action */}
            {hasContacted ? (
              <div className="space-y-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">Inquiry Sent to Owner!</p>
                  <p className="text-xs text-emerald-700 mt-1">Owner Contact: {ownerPhone}</p>
                </div>
                <a
                  href={`tel:${ownerPhone}`}
                  className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Call Owner Directly
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setHasContacted(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <PhoneCall className="h-5 w-5" />
                Contact Owner Now
              </button>
            )}

            <p className="text-center text-[11px] text-slate-400 leading-relaxed">
              SuperRent verified listing. No brokerage fees or hidden charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
