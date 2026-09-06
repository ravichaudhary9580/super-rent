"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Loader2,
  AlertTriangle,
  BedDouble,
  FileText,
  Wind,
  Snowflake
} from "lucide-react";

export default function TenantPropertyDetails() {
  const routerParams = useParams();
  const id = (routerParams?.id as string) || "";
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasContacted, setHasContacted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/properties/${id}`);
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
  }, [id]);

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
      {property.status && property.status !== "Active" && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
          <span>Listing Preview: Status is currently &quot;{property.status}&quot;. It will become publicly live once approved by Admin.</span>
        </div>
      )}

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
      {property.images && property.images.length > 0 ? (
        <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-slate-950 overflow-hidden group shadow-lg border border-slate-200">
          {/* Main Selected Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover opacity-90 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                  {property.type}
                </span>
                {property.genderPreference && (
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                    {property.genderPreference}
                  </span>
                )}
                {property.occupancy && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-semibold">
                    {property.occupancy}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{property.title}</h2>
              <p className="text-slate-200 text-sm mt-1 flex items-center gap-1 drop-shadow">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" /> {property.location?.nearbyLandmark || loc}
              </p>
            </div>
            
            {property.images.length > 1 && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                {property.images.slice(0, 4).map((img: string, i: number) => (
                  <div key={i} className="relative w-12 h-10 sm:w-14 sm:h-11 rounded-xl overflow-hidden border border-white/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-72 sm:h-96 bg-slate-900 rounded-3xl relative w-full overflow-hidden border border-slate-800 shadow-lg flex flex-col items-center justify-center text-slate-400">
          <Building className="w-16 h-16 text-blue-500/40 mb-3" />
          <span className="text-2xl font-black text-white/80">{property.title}</span>
          <span className="text-sm font-medium text-slate-400 mt-1">{loc}</span>
          <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
            {property.type} Accommodation
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Amenities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Verified Listing
              </span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                {property.type}
              </span>
              {property.genderPreference && (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold">
                  {property.genderPreference}
                </span>
              )}
              {property.sharingOptions && property.sharingOptions.length > 0 ? (
                property.sharingOptions.map((sh: string) => (
                  <span key={sh} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
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
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                  {property.furnishing}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {property.title}
            </h1>
            <p className="flex items-center text-slate-500 font-medium text-sm sm:text-base">
              <MapPin className="h-4 w-4 mr-1 text-slate-400 shrink-0" /> {property.location?.fullAddress || loc}
            </p>

            {property.location?.nearbyLandmark && (
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-800 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <div><span className="font-bold">Nearby Landmark / College:</span> {property.location.nearbyLandmark}</div>
              </div>
            )}

            {property.description && (
              <p className="text-slate-600 text-sm leading-relaxed pt-2 whitespace-pre-line">
                {property.description}
              </p>
            )}
          </div>

          {/* Key Rental Specifications */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Rental Terms & Specifications</h2>
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

          {/* House Rules */}
          {property.rules && property.rules.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">House Rules & Policies</h2>
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
                    Official hostel rates according to room occupancy and cooling features.
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

        {/* Right Column: Sticky Pricing & Contact Owner Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/5 sticky top-8 space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {property.roomPricings && property.roomPricings.length > 0
                  ? "Starting From"
                  : (property.pricingCycle === "Annually" ? "Annual Hostel Fee" : "Monthly Rent")}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center">
                <IndianRupee className="h-8 w-8 text-blue-600 mr-0.5" /> {property.price?.toLocaleString()}
                <span className="text-sm font-semibold text-slate-400 ml-1.5">
                  {property.pricingCycle === "Annually" ? "/ year" : "/ month"}
                </span>
              </div>
              {property.pricingCycle === "Annually" && property.price && (
                <span className="text-xs font-bold text-blue-600 mt-1 block">
                  (~₹{Math.round(Number(property.price) / 12).toLocaleString()} / month)
                </span>
              )}
            </div>

            {/* Deposit & Maintenance Breakdown */}
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
                  <p className="text-xs text-emerald-700 mt-1">
                    Contact: {property.contactPhone || ownerPhone}
                  </p>
                </div>
                <a
                  href={`tel:${property.contactPhone || ownerPhone}`}
                  className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Call Directly
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
              Provider App verified listing. No brokerage fees or hidden charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
