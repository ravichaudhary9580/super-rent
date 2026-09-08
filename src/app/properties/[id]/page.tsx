"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall, 
  Loader2, 
  Building, 
  ArrowLeft,
  AlertTriangle,
  BedDouble,
  FileText,
  Wind,
  Snowflake
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PropertyDetails() {
  const routerParams = useParams();
  const id = (routerParams?.id as string) || "";
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contacted, setContacted] = useState(false);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/properties/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProperty(data.property);
          setSelectedImgIdx(0);
          fetch("/api/leads/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ propertyId: id, action: "view" })
          }).catch(() => {});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperty();
  }, [id]);

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
    : property.location || "Greater Noida";

  const images = property.images && property.images.length > 0 ? property.images : [];
  const currentImage = images[selectedImgIdx] || images[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 dashboard-page-enter">
      {/* Navigation Top Bar */}
      <div className="bg-slate-900 px-4 sm:px-8 py-3 border-b border-slate-800 flex items-center justify-between text-white text-xs">
        <Link href="/properties" className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to All Properties
        </Link>
        <span className="text-slate-400 font-medium hidden sm:inline">Greater Noida Student & Executive Housing</span>
      </div>

      {property.status && property.status !== "Active" && (
        <div className="bg-amber-400 text-amber-950 px-4 py-2 text-xs font-black text-center flex items-center justify-center gap-2 border-b border-amber-500">
          <AlertTriangle className="w-4 h-4 text-amber-950 shrink-0" />
          <span>Listing Preview: Status is currently &quot;{property.status}&quot;. It is not visible to public tenants until approved by Admin.</span>
        </div>
      )}

      {/* Image Header */}
      {images.length > 0 ? (
        <div className="relative w-full h-80 sm:h-96 bg-slate-950 overflow-hidden group">
          {/* Main Selected Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentImage}
            src={currentImage}
            alt={property.title}
            className="w-full h-full object-cover opacity-90 transition-all duration-500 animate-in fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          
          <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                {property.type}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-2 drop-shadow-md">{property.title}</h2>
              <p className="text-slate-200 text-sm mt-1 flex items-center gap-1 drop-shadow">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" /> {loc}
              </p>
            </div>
            
            {/* Clickable Image Thumbnails in Banner */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                {images.map((img: string, i: number) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImgIdx(i)}
                    className={`relative w-12 h-10 sm:w-14 sm:h-11 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImgIdx === i ? "border-blue-500 scale-105 ring-2 ring-blue-400/50" : "border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-72 sm:h-96 bg-slate-900 relative w-full overflow-hidden flex items-center justify-center text-slate-400">
          <div className="text-center">
            <Building className="w-16 h-16 text-blue-500/40 mx-auto mb-2" />
            <h2 className="text-2xl font-black text-white">{property.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{loc}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {property.type}
                </span>
                {property.genderPreference && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {property.genderPreference}
                  </span>
                )}
                {property.sharingOptions && property.sharingOptions.length > 0 ? (
                  property.sharingOptions.map((sh: string) => (
                    <span key={sh} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{sh}</span>
                    </span>
                  ))
                ) : property.occupancy ? (
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {property.occupancy}
                  </span>
                ) : null}
                {property.furnishing && (
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {property.furnishing}
                  </span>
                )}
                <span className="flex items-center text-emerald-600 text-sm font-semibold ml-auto">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Verified Listing
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{property.title}</h1>
              <p className="flex items-center text-slate-500 text-sm sm:text-base">
                <MapPin className="h-5 w-5 mr-1 text-slate-400 shrink-0" /> {property.location?.fullAddress || loc}
              </p>

              {property.location?.nearbyLandmark && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-800 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <div><span className="font-bold">Nearby Landmark:</span> {property.location.nearbyLandmark}</div>
                </div>
              )}
            </div>

            {/* Key Rental Specifications */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Rental Highlights & Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Available From</span>
                  <span className="text-sm font-bold text-slate-900">{property.availableFrom || "Immediately"}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Notice Period</span>
                  <span className="text-sm font-bold text-slate-900">{property.noticePeriod || "1 Month"}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Food / Mess</span>
                  <span className="text-sm font-bold text-slate-900">{property.foodIncluded || "Optional"}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Maintenance</span>
                  <span className="text-sm font-bold text-slate-900">{property.maintenance || "Included"}</span>
                </div>
              </div>

              {/* Room Sharing Options */}
              {((property.sharingOptions && property.sharingOptions.length > 0) || property.occupancy) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
                    Room Sharing Options Available
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {property.sharingOptions && property.sharingOptions.length > 0 ? (
                      property.sharingOptions.map((sh: string) => (
                        <div key={sh} className="px-3.5 py-1.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 flex items-center gap-1.5 shadow-2xs">
                          <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                          <span>{sh}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                        {property.occupancy}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {property.description && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
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

            {/* House Rules */}
            {property.rules && property.rules.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">House Rules & Guidelines</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.rules.map((rule: string) => (
                    <div key={rule} className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-amber-900 text-xs font-semibold">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Seater & AC / Non-AC Rates Breakdown */}
            {property.roomPricings && property.roomPricings.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <BedDouble className="w-5 h-5 text-blue-600" /> Room Seater &amp; AC / Non-AC Rates
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Exact hostel rates according to room occupancy and cooling features.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 self-start sm:self-auto">
                    Billed {property.pricingCycle === "Annually" ? "Annually (Per Year)" : "Monthly"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[480px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-extrabold uppercase tracking-wider">
                        <th className="py-3 px-4 rounded-l-xl">Room Sharing / Seater</th>
                        <th className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5">
                            <Wind className="w-3.5 h-3.5 text-slate-500" /> Non-AC Room
                          </span>
                        </th>
                        <th className="py-3 px-4 rounded-r-xl">
                          <span className="inline-flex items-center gap-1.5">
                            <Snowflake className="w-3.5 h-3.5 text-blue-500" /> AC Room
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {property.roomPricings.map((tier: any, i: number) => {
                        const hasNonAc = tier.nonAcPrice !== null && tier.nonAcPrice !== undefined && Number(tier.nonAcPrice) > 0;
                        const hasAc = tier.acPrice !== null && tier.acPrice !== undefined && Number(tier.acPrice) > 0;
                        const cycleSuffix = property.pricingCycle === "Annually" ? "/year" : "/mo";

                        return (
                          <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <BedDouble className="w-4 h-4" />
                              </span>
                              <span>{tier.seater}</span>
                            </td>
                            <td className="py-4 px-4">
                              {hasNonAc ? (
                                <div className="font-extrabold text-slate-900 flex items-center">
                                  <IndianRupee className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
                                  {Number(tier.nonAcPrice).toLocaleString()}
                                  <span className="text-xs font-normal text-slate-400 ml-1">{cycleSuffix}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium italic">Option not available</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {hasAc ? (
                                <div className="flex items-center gap-2">
                                  <div className="font-extrabold text-blue-700 flex items-center">
                                    <IndianRupee className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
                                    {Number(tier.acPrice).toLocaleString()}
                                    <span className="text-xs font-normal text-blue-400 ml-1">{cycleSuffix}</span>
                                  </div>
                                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                                    AC
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-medium italic">Option not available</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Contact Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/5 sticky top-24 space-y-5">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {property.roomPricings && property.roomPricings.length > 0
                    ? "Starting From"
                    : (property.pricingCycle === "Annually" ? "Annual Hostel Fee" : "Monthly Rent")}
                </span>
                <div className="text-3xl font-extrabold text-slate-900 flex items-center">
                  <IndianRupee className="h-7 w-7 mr-0.5 text-blue-600" /> {property.price?.toLocaleString()}
                  <span className="text-sm font-semibold text-slate-400 ml-1">
                    {property.pricingCycle === "Annually" ? "/ year" : "/ month"}
                  </span>
                </div>
                {property.pricingCycle === "Annually" && property.price && (
                  <span className="text-xs font-bold text-blue-600 mt-1 block">
                    (~₹{Math.round(Number(property.price) / 12).toLocaleString()} / month)
                  </span>
                )}
              </div>

              {/* Deposit & Maintenance Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Security Deposit:</span>
                  <span className="font-bold text-slate-900">
                    {property.deposit ? `₹${Number(property.deposit).toLocaleString()}` : "Zero Deposit"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Maintenance:</span>
                  <span className="font-bold text-slate-900">{property.maintenance || "Included in rent"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Notice Period:</span>
                  <span className="font-bold text-slate-900">{property.noticePeriod || "1 Month"}</span>
                </div>
              </div>
              
              {contacted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">Owner Notified!</p>
                  <p className="text-sm font-black text-emerald-800">
                    {property.contactPhone || property.ownerId?.phone || "+91 98765 43210"}
                  </p>
                  <a
                    href={`tel:${property.contactPhone || property.ownerId?.phone || ""}`}
                    className="block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                  >
                    Call Now
                  </a>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setContacted(true);
                    fetch("/api/leads/track", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ propertyId: id, action: "contact" })
                    }).catch(() => {});
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <PhoneCall className="h-5 w-5" />
                  Contact Owner / Caretaker
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
