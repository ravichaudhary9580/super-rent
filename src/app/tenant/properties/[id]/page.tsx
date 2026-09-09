"use client";

import { useState, useEffect, useCallback } from "react";
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
  Building2,
  UserCheck,
  Check, 
  Loader2, 
  AlertTriangle, 
  BedDouble, 
  FileText, 
  Wind, 
  Snowflake,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Utensils,
  Clock,
  Sparkles,
  Layers,
  Phone,
  MessageSquare,
  Home
} from "lucide-react";

export default function TenantPropertyDetails() {
  const routerParams = useParams();
  const id = (routerParams?.id as string) || "";
  
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasContacted, setHasContacted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Gallery Hero State
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImgIdx, setLightboxImgIdx] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  // Seater & AC/Non-AC Selection State
  const [selectedSeater, setSelectedSeater] = useState<string>("");
  const [coolingPreference, setCoolingPreference] = useState<"ac" | "nonAc">("ac");

  const handleContactOwner = async () => {
    setHasContacted(true);
    try {
      await fetch("/api/leads/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: id, action: "contact" })
      });
    } catch (e) {
      console.error("Failed to track contact attempt:", e);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/properties/${id}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.property;
          setProperty(p);
          setSelectedImgIdx(0);

          // Initialize room seater selection if roomPricings available
          if (p.roomPricings && p.roomPricings.length > 0) {
            const firstWithPrice = p.roomPricings.find((r: any) => r.acPrice || r.nonAcPrice) || p.roomPricings[0];
            setSelectedSeater(firstWithPrice.seater || "");
            if (firstWithPrice.acPrice) {
              setCoolingPreference("ac");
            } else if (firstWithPrice.nonAcPrice) {
              setCoolingPreference("nonAc");
            }
          }

          // Track property view action for lead engine
          fetch("/api/leads/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ propertyId: id, action: "view" })
          }).catch(() => {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  // Lightbox navigation functions
  const openLightbox = (index: number) => {
    setLightboxImgIdx(index);
    setZoomScale(1);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomScale(1);
  };

  const nextLightboxImage = useCallback(() => {
    if (!property?.images || property.images.length === 0) return;
    setLightboxImgIdx((prev) => (prev + 1) % property.images.length);
    setZoomScale(1);
  }, [property]);

  const prevLightboxImage = useCallback(() => {
    if (!property?.images || property.images.length === 0) return;
    setLightboxImgIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
    setZoomScale(1);
  }, [property]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") nextLightboxImage();
      else if (e.key === "ArrowLeft") prevLightboxImage();
      else if (e.key === "+" || e.key === "=") setZoomScale((prev) => Math.min(prev + 0.5, 3));
      else if (e.key === "-") setZoomScale((prev) => Math.max(prev - 0.5, 1));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, nextLightboxImage, prevLightboxImage]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-slate-500 font-bold text-sm">Loading complete property details...</p>
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

  const isHostel = property.type === "Hostel";
  const isPG = property.type === "PG";
  const isFlat = property.type === "Flat";
  const isRoom = property.type === "Room";

  const loc = typeof property.location === "object"
    ? `${property.location.area || ""}${property.location.area && property.location.city ? ", " : ""}${property.location.city || ""}`
    : property.location || "Greater Noida";

  const ownerName = property.ownerId?.name || "Verified Owner";
  const ownerBusiness = property.ownerId?.businessName || property.ownerId?.hostelName || "";
  const ownerAvatar = property.ownerId?.image || "";

  const images = property.images && property.images.length > 0 ? property.images : [];
  const currentImage = images[selectedImgIdx] || images[0];

  // Dynamic Calculation of Selected Price
  const roomPricingsList = property.roomPricings || [];
  const currentTier = roomPricingsList.find((r: any) => r.seater === selectedSeater) || roomPricingsList[0];

  let displayPrice = property.price || 0;
  let priceNote = "";

  if (currentTier) {
    if (coolingPreference === "ac" && currentTier.acPrice) {
      displayPrice = Number(currentTier.acPrice);
      priceNote = `${currentTier.seater} • AC Room`;
    } else if (coolingPreference === "nonAc" && currentTier.nonAcPrice) {
      displayPrice = Number(currentTier.nonAcPrice);
      priceNote = `${currentTier.seater} • Non-AC Room`;
    } else if (currentTier.acPrice) {
      displayPrice = Number(currentTier.acPrice);
      priceNote = `${currentTier.seater} • AC Room`;
    } else if (currentTier.nonAcPrice) {
      displayPrice = Number(currentTier.nonAcPrice);
      priceNote = `${currentTier.seater} • Non-AC Room`;
    }
  }

  // Determine billing cycle & label
  const isAnnual = property.pricingCycle === "Annually" || (isHostel && property.pricingCycle !== "Monthly");
  const billingCycleLabel = isAnnual ? "/ year" : "/ month";
  const monthlyEquivalent = isAnnual ? Math.round(displayPrice / 12) : displayPrice;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Status Notice if Pending or Rejected */}
      {property.status && property.status !== "Active" && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" />
          <span>
            Listing Status: &quot;{property.status}&quot;. It will become publicly visible once verified and approved by the Provider App admin team.
          </span>
        </div>
      )}

      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/tenant/properties"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span>{copiedLink ? "Copied Link!" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer ${
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
      {images.length > 0 ? (
        <div className="relative w-full h-80 sm:h-96 rounded-3xl bg-slate-950 overflow-hidden group shadow-lg border border-slate-200">
          {/* Main Selected Photo - Clickable to open Lightbox */}
          <div 
            onClick={() => openLightbox(selectedImgIdx)}
            className="w-full h-full cursor-zoom-in relative"
            title="Click to view fullscreen, zoom, and browse photos"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={currentImage}
              src={currentImage}
              alt={property.title}
              className="w-full h-full object-cover opacity-90 transition-all duration-500 animate-in fade-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

            {/* Hover Zoom Prompt */}
            <div className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen &amp; Zoom</span>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
            <div className="pointer-events-auto">
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
            
            {images.length > 1 && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 pointer-events-auto">
                {images.slice(0, 5).map((img: string, i: number) => (
                  <button
                    key={img}
                    onClick={() => {
                      setSelectedImgIdx(i);
                    }}
                    className={`relative w-12 h-10 sm:w-14 sm:h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImgIdx === i ? "border-blue-500 scale-105 ring-2 ring-blue-400/50" : "border-white/40 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {images.length > 5 && (
                  <button
                    onClick={() => openLightbox(5)}
                    className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black flex items-center justify-center transition-all cursor-pointer"
                  >
                    +{images.length - 5}
                  </button>
                )}
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
        {/* Left Column: Details, Specifications, Rates & Amenities */}
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
              {property.furnishing && (
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                  {property.furnishing}
                </span>
              )}
              {isHostel && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Student &amp; Executive Hostel
                </span>
              )}
              {isPG && (
                <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-indigo-600" /> Co-living PG
                </span>
              )}
              {isFlat && (
                <span className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" /> Rental Flat / Apartment
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {property.title}
            </h1>
            
            <p className="flex items-center text-slate-500 font-medium text-sm sm:text-base">
              <MapPin className="h-4 w-4 mr-1 text-slate-400 shrink-0" /> {property.location?.fullAddress || loc}
              {property.location?.pincode ? ` - ${property.location.pincode}` : ""}
            </p>

            {property.location?.nearbyLandmark && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-800 font-medium flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-extrabold">Nearby Landmark / College Campus: </span> 
                  {property.location.nearbyLandmark}
                </div>
              </div>
            )}

            {property.description && (
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">About This Accommodation</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {property.description}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Seater & AC Pricing Configurator (For Hostels & PGs with room pricings) */}
          {roomPricingsList.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-6 sm:p-8 rounded-3xl border border-indigo-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                      Room &amp; Rate Selector
                    </span>
                    <span className="text-xs font-bold text-indigo-900">
                      {isHostel ? "Hostel Seater Options" : "Room Occupancy Options"}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Select Your Room Seater &amp; Cooling Type
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose your room occupancy and whether you want AC or Non-AC cooling to view exact fees.
                  </p>
                </div>

                <div className="flex items-center bg-white p-1 rounded-2xl border border-indigo-200 shadow-2xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCoolingPreference("ac")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      coolingPreference === "ac"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>AC Room</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoolingPreference("nonAc")}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      coolingPreference === "nonAc"
                        ? "bg-slate-800 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5" />
                    <span>Non-AC Room</span>
                  </button>
                </div>
              </div>

              {/* Seater Option Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {roomPricingsList.map((tier: any) => {
                  const isSelected = selectedSeater === tier.seater;
                  const priceToDisplay = coolingPreference === "ac" 
                    ? (tier.acPrice || tier.nonAcPrice) 
                    : (tier.nonAcPrice || tier.acPrice);
                  const isAcAvailable = Boolean(tier.acPrice && Number(tier.acPrice) > 0);
                  const isNonAcAvailable = Boolean(tier.nonAcPrice && Number(tier.nonAcPrice) > 0);

                  return (
                    <button
                      key={tier.seater}
                      type="button"
                      onClick={() => setSelectedSeater(tier.seater)}
                      className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? "bg-white border-indigo-600 shadow-md shadow-indigo-600/10 scale-[1.02]"
                          : "bg-white/70 hover:bg-white border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <div>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black mb-2">
                          <BedDouble className="w-4 h-4" />
                        </div>
                        <h4 className="font-black text-sm text-slate-900 leading-tight">
                          {tier.seater}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          {isAcAvailable && (
                            <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded">
                              AC
                            </span>
                          )}
                          {isNonAcAvailable && (
                            <span className="text-[9px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              Non-AC
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          {isAnnual ? "Annual Fee" : "Monthly"}
                        </span>
                        <span className="text-base font-black text-indigo-950 flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 text-indigo-600 mr-0.5" />
                          {priceToDisplay ? Number(priceToDisplay).toLocaleString() : "N/A"}
                        </span>
                        {isAnnual && priceToDisplay && (
                          <span className="text-[10px] text-slate-500 font-medium block">
                            ~₹{Math.round(Number(priceToDisplay) / 12).toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Seater Callout Alert */}
              <div className="p-4 bg-white rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    Currently Viewing: <strong className="text-indigo-900">{priceNote || selectedSeater}</strong> at{" "}
                    <strong className="text-emerald-700">₹{displayPrice.toLocaleString()} {billingCycleLabel}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {isHostel ? "Includes Accommodation, WiFi & Electricity" : "Direct owner rate"}
                </span>
              </div>
            </div>
          )}

          {/* Key Rental Specifications & Policies */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {isHostel ? "Hostel Rules & Operational Specifications" : isFlat ? "Flat Rental Terms & Specifications" : "Rental Terms & Specifications"}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Available From</span>
                <span className="text-sm font-black text-slate-900">{property.availableFrom || "Immediately"}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Notice Period</span>
                <span className="text-sm font-black text-slate-900">{property.noticePeriod || "1 Month"}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Food / Mess</span>
                <span className="text-sm font-black text-slate-900">{property.foodIncluded || (isHostel ? "3 Meals Included" : "Optional")}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Maintenance</span>
                <span className="text-sm font-black text-slate-900">{property.maintenance || "Included"}</span>
              </div>
            </div>

            {/* Room Sharing Options Available */}
            {((property.sharingOptions && property.sharingOptions.length > 0) || property.occupancy) && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
                  Room Sharing / Seater Configurations Available
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

          {/* Included Amenities & Perks */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Included Amenities &amp; Facilities</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(property.amenities && property.amenities.length > 0 ? property.amenities : [
                "High-Speed WiFi", 
                "Air Conditioner (AC)", 
                "Geyser / Hot Water", 
                "24x7 Power Backup", 
                "Daily Housekeeping", 
                "RO Drinking Water", 
                "Biometric & CCTV Security", 
                "Study Table & Chair"
              ]).map((item: string) => (
                <div key={item} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules & Policies */}
          {property.rules && property.rules.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>House Rules &amp; Policies</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.rules.map((rule: string) => (
                  <div key={rule} className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-amber-900 text-xs font-semibold">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Room Seater & AC / Non-AC Rates Breakdown Table */}
          {roomPricingsList.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-blue-600" /> Complete Seater Rate Breakdown
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Complete price card for all seater room types with Non-AC vs AC options.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 self-start sm:self-auto">
                  Billed {isAnnual ? "Annually (Per Academic Year)" : "Monthly"}
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
                    {roomPricingsList.map((tier: any, i: number) => {
                      const hasNonAc = tier.nonAcPrice !== null && tier.nonAcPrice !== undefined && Number(tier.nonAcPrice) > 0;
                      const hasAc = tier.acPrice !== null && tier.acPrice !== undefined && Number(tier.acPrice) > 0;

                      return (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                              <BedDouble className="w-4 h-4" />
                            </span>
                            <div>
                              <span className="block">{tier.seater}</span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                {tier.seater.includes("Single") ? "1 Bed Private" : tier.seater.includes("Double") ? "2 Beds Twin" : "Shared Room"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {hasNonAc ? (
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center">
                                  <IndianRupee className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
                                  {Number(tier.nonAcPrice).toLocaleString()}
                                  <span className="text-xs font-normal text-slate-400 ml-1">{billingCycleLabel}</span>
                                </div>
                                {isAnnual && (
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    (~₹{Math.round(Number(tier.nonAcPrice) / 12).toLocaleString()}/mo)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic">Option not available</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {hasAc ? (
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-extrabold text-blue-700 flex items-center">
                                    <IndianRupee className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
                                    {Number(tier.acPrice).toLocaleString()}
                                    <span className="text-xs font-normal text-blue-400 ml-1">{billingCycleLabel}</span>
                                  </div>
                                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                                    AC
                                  </span>
                                </div>
                                {isAnnual && (
                                  <span className="text-[11px] text-blue-600/80 font-medium">
                                    (~₹{Math.round(Number(tier.acPrice) / 12).toLocaleString()}/mo)
                                  </span>
                                )}
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
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {isHostel ? (isAnnual ? "Annual Hostel Fee" : "Hostel Fee") : isFlat ? "Monthly Rent" : "Starting Rent"}
                </span>
                {priceNote && (
                  <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md truncate max-w-[170px]">
                    {priceNote}
                  </span>
                )}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center">
                <IndianRupee className="h-8 w-8 text-blue-600 mr-0.5" /> {displayPrice.toLocaleString()}
                <span className="text-sm font-semibold text-slate-400 ml-1.5">
                  {billingCycleLabel}
                </span>
              </div>
              {isAnnual && (
                <span className="text-xs font-bold text-blue-600 mt-1 block">
                  (~₹{monthlyEquivalent.toLocaleString()} / month equivalent)
                </span>
              )}
            </div>

            {/* Quick Seater & Cooling Selector inside the sidebar */}
            {roomPricingsList.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Choose Seater:</span>
                  <select
                    value={selectedSeater}
                    onChange={(e) => setSelectedSeater(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    {roomPricingsList.map((r: any) => (
                      <option key={r.seater} value={r.seater}>
                        {r.seater}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1 border-t border-slate-200/60">
                  <span>Room Type:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCoolingPreference("ac")}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        coolingPreference === "ac" ? "bg-blue-600 text-white" : "bg-white border text-slate-600"
                      }`}
                    >
                      AC
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoolingPreference("nonAc")}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        coolingPreference === "nonAc" ? "bg-slate-800 text-white" : "bg-white border text-slate-600"
                      }`}
                    >
                      Non-AC
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                <span className="font-bold text-slate-900">{property.maintenance || "Included in fee"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Notice Period:</span>
                <span className="font-bold text-slate-900">{property.noticePeriod || "1 Month"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Food / Mess:</span>
                <span className="font-bold text-slate-900">{property.foodIncluded || (isHostel ? "3 Meals Included" : "Optional")}</span>
              </div>
            </div>

            {/* Verified Owner Card */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base shrink-0 overflow-hidden">
                {ownerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ownerAvatar} alt={ownerName} className="w-full h-full object-cover" />
                ) : (
                  <span>{ownerName[0]?.toUpperCase() || "O"}</span>
                )}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {ownerBusiness || ownerName}
                </p>
                {ownerBusiness && ownerName && (
                  <p className="text-[11px] text-slate-500 truncate">Manager: {ownerName}</p>
                )}
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Verified Property Owner
                </p>
              </div>
            </div>

            {/* Direct Contact Action */}
            {hasContacted ? (
              <div className="space-y-2 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center animate-in fade-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-black text-emerald-950">Inquiry Received!</p>
                <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                  Owner will contact you shortly.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleContactOwner}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <PhoneCall className="h-5 w-5" />
                <span>Contact Owner</span>
              </button>
            )}

            <p className="text-center text-[11px] text-slate-400 leading-relaxed">
              Provider App verified listing. No brokerage fees or hidden charges.
            </p>
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL WITH ZOOM & NEXT */}
      {isLightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar: Counter & Controls */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-extrabold bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md">
                Photo {lightboxImgIdx + 1} of {images.length}
              </span>
              <span className="text-xs text-slate-300 hidden sm:inline">
                {property.title}
              </span>
            </div>

            {/* Zoom & Action Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(prev - 0.5, 1))}
                disabled={zoomScale <= 1}
                className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded-xl transition-all cursor-pointer"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-black min-w-[45px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(prev + 0.5, 3))}
                disabled={zoomScale >= 3}
                className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded-xl transition-all cursor-pointer"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={closeLightbox}
                className="p-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl transition-all cursor-pointer ml-2"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image Viewport with Next/Prev Arrows */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
            {/* Previous Button */}
            <button
              type="button"
              onClick={prevLightboxImage}
              className="absolute left-2 sm:left-6 z-20 p-3 bg-black/50 hover:bg-black/80 text-white rounded-2xl backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95"
              title="Previous Photo (←)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Active Image with CSS Transform Zoom */}
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[lightboxImgIdx]}
                alt={`${property.title} photo ${lightboxImgIdx + 1}`}
                style={{ transform: `scale(${zoomScale})` }}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl transition-transform duration-200 select-none shadow-2xl"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextLightboxImage}
              className="absolute right-2 sm:right-6 z-20 p-3 bg-black/50 hover:bg-black/80 text-white rounded-2xl backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95"
              title="Next Photo (→)"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 max-w-full">
            {images.map((img: string, i: number) => (
              <button
                key={img}
                onClick={() => {
                  setLightboxImgIdx(i);
                  setZoomScale(1);
                }}
                className={`relative w-14 h-12 sm:w-18 sm:h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  lightboxImgIdx === i ? "border-blue-500 scale-105 ring-2 ring-blue-400" : "border-white/30 opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
