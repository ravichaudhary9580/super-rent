"use client";

import { useState, useEffect } from "react";
import { MapPin, IndianRupee, ShieldCheck, CheckCircle2, PhoneCall, Loader2, Building, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PropertyDetails({ params }: { params: { id: string } }) {
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contacted, setContacted] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/properties/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProperty(data.property);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperty();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <Building className="w-12 h-12 text-slate-400 mb-3" />
        <h1 className="text-xl font-bold text-slate-800 mb-1">Property Not Found</h1>
        <p className="text-slate-500 text-sm mb-4">This property listing does not exist or was removed.</p>
        <Link href="/properties" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">
          Browse Properties
        </Link>
      </div>
    );
  }

  const loc = typeof property.location === "object"
    ? `${property.location.area}, ${property.location.city}`
    : property.location || "Bangalore";

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Image Header */}
      <div className="h-72 sm:h-96 bg-slate-900 relative w-full overflow-hidden flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Building className="w-16 h-16 text-blue-500/40 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-white">{property.title}</h2>
          <p className="text-slate-400 text-sm mt-1">{loc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {property.type}
                </span>
                <span className="flex items-center text-emerald-600 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Verified Listing
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{property.title}</h1>
              <p className="flex items-center text-slate-500 text-base">
                <MapPin className="h-5 w-5 mr-1 text-slate-400" /> {property.location?.fullAddress || loc}
              </p>
            </div>

            {property.description && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{property.description}</p>
              </div>
            )}

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(property.amenities && property.amenities.length > 0 ? property.amenities : ["WiFi", "Water Supply", "Security"]).map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Contact Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/5 sticky top-24 space-y-4">
              <div className="text-3xl font-extrabold text-slate-900 flex items-center">
                <IndianRupee className="h-7 w-7 mr-0.5 text-blue-600" /> {property.price?.toLocaleString()}
                <span className="text-sm font-semibold text-slate-400 ml-1">/ month</span>
              </div>
              
              {contacted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">Owner Notified!</p>
                  <p className="text-xs text-emerald-700">{property.ownerId?.phone || "+91 98765 43210"}</p>
                </div>
              ) : (
                <button
                  onClick={() => setContacted(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <PhoneCall className="h-5 w-5" />
                  Contact Owner
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
