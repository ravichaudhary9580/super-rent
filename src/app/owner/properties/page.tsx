"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Building, 
  Plus, 
  MoreHorizontal, 
  ExternalLink, 
  Loader2, 
  X, 
  Edit3, 
  Trash2, 
  UploadCloud, 
  Image as ImageIcon, 
  Check, 
  MapPin, 
  IndianRupee, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Home, 
  Users, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon,
  AlertCircle,
  Eye,
  Camera,
  Star,
  Info,
  ChevronRight,
  ChevronLeft,
  BedDouble,
  Wind,
  Snowflake,
  Utensils,
  Phone,
  User,
  UserCheck,
  HeartHandshake,
  DoorClosed,
  Building2
} from "lucide-react";
import Link from "next/link";


const STANDARD_AMENITIES = [
  "High-Speed WiFi",
  "Air Conditioner (AC)",
  "Geyser / Hot Water",
  "24x7 Power Backup",
  "3 Meals Daily",
  "Attached Washroom",
  "Daily Housekeeping",
  "RO Drinking Water",
  "Refrigerator",
  "Washing Machine / Laundry",
  "Biometric & CCTV Security",
  "Study Table & Chair",
  "Wardrobe / Almirah",
  "Balcony",
  "Covered Parking",
  "Elevator / Lift",
  "Fitness Gym",
  "Smart TV / Lounge"
];

const STANDARD_RULES = [
  "No Smoking inside premises",
  "Gate closes at 10:30 PM",
  "Visitors allowed during daytime only",
  "Quiet study hours after 10 PM",
  "No loud parties or music",
  "Pets not allowed",
  "Notice period required before vacating"
];

const HOSTEL_SHARING_OPTIONS = [
  { id: "Single Room", label: "Single Room", sub: "1 Bed / Private" },
  { id: "Double Sharing", label: "Double Sharing", sub: "2 Beds / Twin" },
  { id: "Triple Sharing", label: "Triple Sharing", sub: "3 Beds" },
  { id: "Four Sharing", label: "Four Sharing", sub: "4 Beds" },
  { id: "Dormitory", label: "Dormitory", sub: "5+ Beds" },
];

const FLAT_ROOM_OPTIONS = [
  "Single Private Room",
  "Shared Room",
  "1 RK / Studio",
  "1 BHK Flat",
  "2 BHK Flat",
  "3 BHK Flat",
  "4 BHK Flat"
];

const MODAL_TABS = [
  { key: "basic", label: "Basic Info", step: 1, icon: Home },
  { key: "pricing", label: "Pricing & Seaters", step: 2, icon: IndianRupee },
  { key: "location", label: "Location & Address", step: 3, icon: MapPin },
  { key: "amenities", label: "Amenities", step: 4, icon: Sparkles },
  { key: "photos", label: "Photos", step: 5, icon: Camera },
  { key: "rules", label: "Rules & Caretaker", step: 6, icon: Info },
] as const;

const INITIAL_FORM = {
  title: "",
  type: "Hostel",
  price: "",
  pricingCycle: "Annually" as "Monthly" | "Annually",
  deposit: "",
  maintenance: "Included",
  noticePeriod: "1 Month",
  genderPreference: "Anyone",
  occupancy: "Double Sharing, Triple Sharing",
  sharingOptions: ["Double Sharing", "Triple Sharing"] as string[],
  roomPricings: [
    { seater: "Single Room", acPrice: "", nonAcPrice: "" },
    { seater: "Double Sharing", acPrice: "", nonAcPrice: "" },
    { seater: "Triple Sharing", acPrice: "", nonAcPrice: "" },
    { seater: "Four Sharing", acPrice: "", nonAcPrice: "" },
  ] as Array<{ seater: string; acPrice: string | number; nonAcPrice: string | number }>,
  furnishing: "Fully Furnished",
  foodIncluded: "Optional",
  availableFrom: "Immediately",
  contactPhone: "",
  city: "Greater Noida",
  area: "",
  fullAddress: "",
  pincode: "",
  nearbyLandmark: "",
  description: "",
  amenities: [] as string[],
  rules: [] as string[],
  images: [] as string[],
  status: "Pending"
};

export default function MyProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "location" | "amenities" | "photos" | "rules">("basic");
  const [visitedTabs, setVisitedTabs] = useState<string[]>(["basic"]);

  // Filter & Layout states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Image Upload helper states
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [customRuleInput, setCustomRuleInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showModal || !!deleteTarget) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showModal, deleteTarget]);

  const fetchMyProperties = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/properties?ownerOnly=true");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("Failed to load owner properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormError("");
    setActiveTab("basic");
    setVisitedTabs(["basic"]);
    setShowModal(true);
  };

  const openEditModal = (property: any) => {
    setEditingId(property._id || property.id);
    const loadedSharing = Array.isArray(property.sharingOptions) && property.sharingOptions.length > 0
      ? property.sharingOptions
      : (property.occupancy 
          ? property.occupancy.split(",").map((s: string) => s.trim()).filter(Boolean)
          : ["Double Sharing", "Triple Sharing"]);

    setFormData({
      title: property.title || "",
      type: property.type || "Hostel",
      price: property.price ? String(property.price) : "",
      pricingCycle: property.pricingCycle || (property.type === "Hostel" ? "Annually" : "Monthly"),
      deposit: property.deposit ? String(property.deposit) : "",
      maintenance: property.maintenance || "Included",
      noticePeriod: property.noticePeriod || "1 Month",
      genderPreference: property.genderPreference || "Anyone",
      occupancy: property.occupancy || loadedSharing.join(", "),
      sharingOptions: loadedSharing,
      roomPricings: Array.isArray(property.roomPricings) && property.roomPricings.length > 0
        ? property.roomPricings.map((rp: any) => ({
            seater: rp.seater || "",
            acPrice: rp.acPrice !== null && rp.acPrice !== undefined ? String(rp.acPrice) : "",
            nonAcPrice: rp.nonAcPrice !== null && rp.nonAcPrice !== undefined ? String(rp.nonAcPrice) : "",
          }))
        : (loadedSharing.length > 0
            ? loadedSharing.map((s: string) => ({ seater: s, acPrice: "", nonAcPrice: "" }))
            : [
                { seater: "Single Room", acPrice: "", nonAcPrice: "" },
                { seater: "Double Sharing", acPrice: "", nonAcPrice: "" },
                { seater: "Triple Sharing", acPrice: "", nonAcPrice: "" },
                { seater: "Four Sharing", acPrice: "", nonAcPrice: "" },
              ]),
      furnishing: property.furnishing || "Fully Furnished",
      foodIncluded: property.foodIncluded || "Optional",
      availableFrom: property.availableFrom || "Immediately",
      contactPhone: property.contactPhone || "",
      city: property.location?.city || "Greater Noida",
      area: property.location?.area || "",
      fullAddress: property.location?.fullAddress || "",
      pincode: property.location?.pincode || "",
      nearbyLandmark: property.location?.nearbyLandmark || "",
      description: property.description || "",
      amenities: property.amenities || [],
      rules: property.rules || [],
      images: property.images || [],
      status: property.status || "Pending"
    });
    setFormError("");
    setActiveTab("basic");
    setVisitedTabs(["basic", "pricing", "location", "amenities", "photos", "rules"]);
    setShowModal(true);
  };

  // Direct Image File Upload via API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setFormError("");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("folder", "properties");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.fileUrl) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, data.fileUrl]
            }));
            continue;
          }
        }
        
        // Fallback to local Data URL if S3 is not reachable or throws
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, reader.result as string]
            }));
          }
        };
        reader.readAsDataURL(file);
      } catch (uploadErr) {
        console.warn("Upload fallback applied:", uploadErr);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, reader.result as string]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    }

    setIsUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (formData.images.includes(trimmed)) {
      return setFormError("This image URL is already added");
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, trimmed] }));
    setImageUrlInput("");
  };


  // Room sharing options toggle for hostels & PGs
  const toggleSharingOption = (opt: string) => {
    setFormData(prev => {
      const exists = prev.sharingOptions.includes(opt);
      const updated = exists
        ? prev.sharingOptions.filter(o => o !== opt)
        : [...prev.sharingOptions, opt];

      let updatedPricings = [...prev.roomPricings];
      if (!exists && !updatedPricings.some(rp => rp.seater === opt)) {
        updatedPricings.push({ seater: opt, acPrice: "", nonAcPrice: "" });
      }

      return {
        ...prev,
        sharingOptions: updated,
        occupancy: updated.length > 0 ? updated.join(", ") : "",
        roomPricings: updatedPricings
      };
    });
  };

  // Seater & AC / Non-AC Pricing handlers
  const handleRoomPricingChange = (index: number, field: "acPrice" | "nonAcPrice" | "seater", val: string) => {
    setFormData(prev => {
      const updated = [...prev.roomPricings];
      updated[index] = { ...updated[index], [field]: val };

      // Calculate lowest entered price as suggested base starting price
      const validPrices: number[] = [];
      updated.forEach(tier => {
        if (tier.acPrice && !isNaN(Number(tier.acPrice)) && Number(tier.acPrice) > 0) {
          validPrices.push(Number(tier.acPrice));
        }
        if (tier.nonAcPrice && !isNaN(Number(tier.nonAcPrice)) && Number(tier.nonAcPrice) > 0) {
          validPrices.push(Number(tier.nonAcPrice));
        }
      });

      const autoLowest = validPrices.length > 0 ? String(Math.min(...validPrices)) : prev.price;

      return {
        ...prev,
        roomPricings: updated,
        price: prev.price === "" || prev.price === "0" ? autoLowest : prev.price
      };
    });
  };

  const handleAddRoomPricingTier = () => {
    const defaultName = `Seater Option ${formData.roomPricings.length + 1}`;
    setFormData(prev => ({
      ...prev,
      roomPricings: [
        ...prev.roomPricings,
        { seater: defaultName, acPrice: "", nonAcPrice: "" }
      ]
    }));
  };

  const handleRemoveRoomPricing = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roomPricings: prev.roomPricings.filter((_, idx) => idx !== index)
    }));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      const selected = newImages.splice(index, 1)[0];
      newImages.unshift(selected);
      return { ...prev, images: newImages };
    });
  };

  // Amenities toggle
  const toggleAmenity = (item: string) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== item)
          : [...prev.amenities, item]
      };
    });
  };

  const handleAddCustomAmenity = () => {
    const val = customAmenityInput.trim();
    if (!val) return;
    if (!formData.amenities.includes(val)) {
      setFormData(prev => ({ ...prev, amenities: [...prev.amenities, val] }));
    }
    setCustomAmenityInput("");
  };

  // Rules toggle
  const toggleRule = (item: string) => {
    setFormData(prev => {
      const exists = prev.rules.includes(item);
      return {
        ...prev,
        rules: exists
          ? prev.rules.filter(r => r !== item)
          : [...prev.rules, item]
      };
    });
  };

  const handleAddCustomRule = () => {
    const val = customRuleInput.trim();
    if (!val) return;
    if (!formData.rules.includes(val)) {
      setFormData(prev => ({ ...prev, rules: [...prev.rules, val] }));
    }
    setCustomRuleInput("");
  };

  // Save / Update property
  const handleSaveProperty = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.title.trim() || !formData.price || !formData.area.trim() || !formData.city.trim()) {
      switchTab("basic");
      return setFormError("Please fill out all required fields: Title, Rent, City, and Area");
    }

    setIsSubmitting(true);
    setFormError("");

    const payload = {
      title: formData.title.trim(),
      type: formData.type,
      price: Number(formData.price),
      pricingCycle: formData.pricingCycle,
      deposit: formData.deposit ? Number(formData.deposit) : 0,
      maintenance: formData.maintenance.trim() || "Included",
      noticePeriod: formData.noticePeriod.trim() || "1 Month",
      genderPreference: formData.genderPreference,
      occupancy: formData.sharingOptions.length > 0 
        ? formData.sharingOptions.join(", ") 
        : (formData.occupancy.trim() || "Single / Sharing"),
      sharingOptions: formData.sharingOptions.length > 0
        ? formData.sharingOptions
        : (formData.occupancy ? [formData.occupancy.trim()] : []),
      roomPricings: formData.roomPricings
        .filter(rp => rp.seater && (rp.acPrice !== "" || rp.nonAcPrice !== ""))
        .map(rp => ({
          seater: String(rp.seater).trim(),
          acPrice: rp.acPrice !== "" && !isNaN(Number(rp.acPrice)) ? Number(rp.acPrice) : null,
          nonAcPrice: rp.nonAcPrice !== "" && !isNaN(Number(rp.nonAcPrice)) ? Number(rp.nonAcPrice) : null,
        })),
      furnishing: formData.furnishing,
      foodIncluded: formData.foodIncluded,
      availableFrom: formData.availableFrom.trim() || "Immediately",
      contactPhone: formData.contactPhone.trim(),
      description: formData.description.trim(),
      location: {
        city: formData.city.trim(),
        area: formData.area.trim(),
        fullAddress: formData.fullAddress.trim() || `${formData.area.trim()}, ${formData.city.trim()}`,
        pincode: formData.pincode.trim(),
        nearbyLandmark: formData.nearbyLandmark.trim(),
      },
      amenities: formData.amenities,
      rules: formData.rules,
      images: formData.images,
      status: editingId 
        ? (formData.status === "Rejected" ? "Pending" : formData.status) 
        : "Pending"
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/properties/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save property listing");

      setShowModal(false);
      setFormData(INITIAL_FORM);
      setEditingId(null);
      await fetchMyProperties();
    } catch (err: any) {
      setFormError(err.message || "Failed to save listing");
    } finally {
      setIsSubmitting(false);
    }
  };



  // Delete property
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const propId = deleteTarget._id || deleteTarget.id;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/properties/${propId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => (p._id || p.id) !== propId));
        setDeleteTarget(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete property");
      }
    } catch (err) {
      console.error("Failed to delete property:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = 
      !searchTerm ||
      prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location?.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location?.nearbyLandmark?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "All" || prop.type === typeFilter;
    const matchesStatus = statusFilter === "All" || prop.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats calculation
  const totalCount = properties.length;
  const pendingCount = properties.filter(p => !p.status || p.status === "Pending").length;
  const activeCount = properties.filter(p => p.status === "Active").length;
  const rejectedCount = properties.filter(p => p.status === "Rejected").length;
  const avgRent = totalCount > 0 
    ? Math.round(properties.reduce((acc, p) => acc + (Number(p.price) || 0), 0) / totalCount)
    : 0;

  const tabKeys = ["basic", "pricing", "location", "amenities", "photos", "rules"] as const;
  const currentStepIdx = Math.max(0, tabKeys.indexOf(activeTab as any));
  const progressPercent = Math.round(((currentStepIdx + 1) / tabKeys.length) * 100);

  const switchTab = (key: typeof activeTab) => {
    setActiveTab(key);
    setVisitedTabs((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const isTabComplete = (key: string) => {
    // A step can only show complete if visited by the user or editing existing listing
    if (!visitedTabs.includes(key) && !editingId) {
      return false;
    }

    switch (key) {
      case "basic":
        return Boolean(formData.title?.trim() && formData.type && formData.sharingOptions?.length > 0);
      case "pricing":
        return Boolean(formData.price && Number(formData.price) > 0);
      case "location":
        return Boolean(formData.city?.trim() && formData.area?.trim());
      case "amenities":
        return Boolean(formData.amenities && formData.amenities.length > 0);
      case "photos":
        return Boolean(formData.images && formData.images.length > 0);
      case "rules":
        return Boolean(
          (formData.rules && formData.rules.length > 0) || 
          Boolean(formData.contactPhone?.trim())
        );
      default:
        return false;
    }
  };

  const handlePrevTab = () => {
    if (currentStepIdx > 0) {
      switchTab(tabKeys[currentStepIdx - 1]);
    }
  };

  const handleNextTab = () => {
    if (currentStepIdx < tabKeys.length - 1) {
      switchTab(tabKeys[currentStepIdx + 1]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== "rules") {
      handleNextTab();
      return;
    }
    handleSaveProperty(e);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
              Owner Portal
            </span>
            <span className="text-xs font-semibold text-slate-400">• Full Property Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Properties & Listings</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your rental listings, upload photos, specify amenities, and reach high-intent tenants.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Properties</span>
            <Building className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">In your portfolio</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-2">{pendingCount}</p>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting admin approval</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase">Live Listings</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">{activeCount}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Visible to tenants</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-200 bg-rose-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase">Rejected</span>
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-900 mt-2">{rejectedCount}</p>
          <span className="text-[11px] text-rose-700 font-medium">Needs correction</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, area, landmark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns & View Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Hostel">Hostel</option>
              <option value="PG">PG</option>
              <option value="Flat">Flat</option>
              <option value="Room">Room</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review ({pendingCount})</option>
              <option value="Active">Live ({activeCount})</option>
              <option value="Rejected">Rejected ({rejectedCount})</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm font-bold" : "text-slate-500"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-blue-600 shadow-sm font-bold" : "text-slate-500"}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">Loading your properties...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 sm:p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {properties.length === 0 ? "No properties listed yet" : "No properties match your filters"}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            {properties.length === 0 
              ? "List your PG, hostel, room, or flat to start receiving high-intent leads and verified tenant inquiries."
              : "Try clearing your search query or adjusting the type and status filters."}
          </p>
          {properties.length === 0 ? (
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl transition-all shadow-md shadow-blue-600/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Property</span>
            </button>
          ) : (
            <button
              onClick={() => { setSearchTerm(""); setTypeFilter("All"); setStatusFilter("All"); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const propId = prop._id || prop.id;
            const loc = typeof prop.location === "object"
              ? `${prop.location.area || ""}${prop.location.area && prop.location.city ? ", " : ""}${prop.location.city || ""}`
              : prop.location || "N/A";
            
            const firstImage = prop.images && prop.images.length > 0 ? prop.images[0] : null;
            const imageCount = prop.images?.length || 0;

            return (
              <div 
                key={propId} 
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo Banner with Badges */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  {firstImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={firstImage} 
                      alt={prop.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <Building className="w-10 h-10 mb-1 opacity-40" />
                      <span className="text-xs font-semibold">No photos uploaded</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-xs font-black text-slate-800 shadow-sm">
                      {prop.type}
                    </span>
                    {prop.genderPreference && (
                      <span className="px-2.5 py-1 bg-blue-600/90 backdrop-blur-md rounded-lg text-[11px] font-bold text-white shadow-sm">
                        {prop.genderPreference}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {imageCount > 0 && (
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] font-bold text-white flex items-center gap-1">
                        <Camera className="w-3 h-3" /> {imageCount}
                      </span>
                    )}
                    {prop.status === "Active" ? (
                      <span
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm"
                        title="Approved & Live to Public"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                      </span>
                    ) : prop.status === "Rejected" ? (
                      <span
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-rose-600/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm"
                        title="Rejected by Admin - Please update details"
                      >
                        <AlertCircle className="w-3 h-3" /> Rejected
                      </span>
                    ) : (
                      <span
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-amber-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm"
                        title="Awaiting Admin Review. Listing will become live once approved."
                      >
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                  </div>

                  {(prop.sharingOptions && prop.sharingOptions.length > 0) ? (
                    <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 max-w-[85%]">
                      {prop.sharingOptions.map((sh: string) => (
                        <span key={sh} className="px-2 py-0.5 bg-black/75 backdrop-blur-md rounded-md text-[10px] font-bold text-white shadow-xs">
                          {sh}
                        </span>
                      ))}
                    </div>
                  ) : prop.occupancy ? (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] font-semibold text-white">
                      {prop.occupancy}
                    </div>
                  ) : null}
                </div>

                {/* Details Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-extrabold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {prop.title}
                      </h3>
                    </div>

                    <p className="flex items-center text-slate-500 text-xs font-medium mb-3">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                      <span className="truncate">{prop.location?.nearbyLandmark || loc}</span>
                    </p>

                    {/* Price & Terms */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {prop.pricingCycle === "Annually" ? "Annual Fee" : "Monthly Rent"}
                        </span>
                        <div className="text-lg font-black text-slate-900 flex items-center">
                          <IndianRupee className="w-4 h-4 text-blue-600 mr-0.5" />
                          {Number(prop.price).toLocaleString()}
                          <span className="text-xs font-medium text-slate-400 ml-1">
                            {prop.pricingCycle === "Annually" ? "/yr" : "/mo"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Deposit</span>
                        <span className="text-xs font-bold text-slate-700">
                          {prop.deposit ? `₹${Number(prop.deposit).toLocaleString()}` : "Zero Deposit"}
                        </span>
                      </div>
                    </div>

                    {/* Amenities chips preview */}
                    {prop.amenities && prop.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {prop.amenities.slice(0, 3).map((a: string) => (
                          <span key={a} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium">
                            {a}
                          </span>
                        ))}
                        {prop.amenities.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md text-[11px] font-bold">
                            +{prop.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/properties/${propId}`}
                      target="_blank"
                      className="px-3 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="View public page"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live View</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(prop)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(prop)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Type & Occupancy</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Rent & Deposit</th>
                  <th className="py-4 px-6">Photos</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {filteredProperties.map((prop) => {
                  const propId = prop._id || prop.id;
                  const loc = typeof prop.location === "object"
                    ? `${prop.location.area}, ${prop.location.city}`
                    : prop.location || "N/A";
                  const firstImage = prop.images && prop.images.length > 0 ? prop.images[0] : null;

                  return (
                    <tr key={propId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {firstImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={firstImage} alt={prop.title} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="w-6 h-6 text-slate-400 m-auto mt-3" />
                            )}
                          </div>
                          <div>
                            <span className="block text-slate-900 font-bold">{prop.title}</span>
                            <span className="text-xs text-slate-400">{prop.genderPreference || "Anyone"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md mr-1.5">
                          {prop.type}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {prop.sharingOptions && prop.sharingOptions.length > 0 ? (
                            prop.sharingOptions.map((sh: string) => (
                              <span key={sh} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                {sh}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">{prop.occupancy || "Single"}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">{prop.location?.area || "N/A"}</p>
                        <p className="text-[11px] text-slate-400">{prop.location?.city}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">
                          ₹{Number(prop.price).toLocaleString()}{prop.pricingCycle === "Annually" ? "/yr" : "/mo"}
                        </span>
                        <span className="text-[11px] text-slate-400">Dep: ₹{Number(prop.deposit || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                          <Camera className="w-3 h-3 text-slate-500" />
                          <span>{prop.images?.length || 0}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {prop.status === "Active" ? (
                          <span
                            className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 inline-flex items-center gap-1.5"
                            title="Approved & Live to Public"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Live
                          </span>
                        ) : prop.status === "Rejected" ? (
                          <span
                            className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-rose-100 text-rose-800 inline-flex items-center gap-1.5"
                            title="Rejected by admin. Edit to resubmit."
                          >
                            <AlertCircle className="w-3 h-3 text-rose-600" /> Rejected
                          </span>
                        ) : (
                          <span
                            className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-amber-100 text-amber-800 inline-flex items-center gap-1.5"
                            title="Pending Admin Review. Will go live once approved."
                          >
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Link 
                            href={`/properties/${propId}`} 
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50"
                            title="Live View"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => openEditModal(prop)}
                            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                            title="Edit Listing"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteTarget(prop)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE ADD / EDIT PROPERTY MODAL */}
      {mounted && showModal && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2.5 sm:p-4 md:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: "100vw", 
            height: "100vh", 
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zoom: 1
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="relative w-full max-w-4xl lg:max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 h-[96vh] sm:h-[94vh] max-h-[920px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-5 sm:px-7 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/90 via-white to-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-900/20 shrink-0"
                  style={{ background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" }}
                >
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {editingId ? "Edit Property Listing" : "Add New Property Listing"}
                    </h2>
                    <span 
                      className="text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider"
                      style={{ 
                        backgroundColor: "rgba(76, 60, 199, 0.08)", 
                        color: "#4c3cc7", 
                        borderColor: "rgba(76, 60, 199, 0.2)" 
                      }}
                    >
                      {formData.type || "Hostel"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                    Provide complete details to attract verified students and working professionals.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Form Progress</span>
                  <span className="text-xs font-black" style={{ color: "#4c3cc7" }}>
                    Step {currentStepIdx + 1} of 6 • {progressPercent}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Accent Progress Line */}
            <div className="w-full bg-slate-100 h-1 relative overflow-hidden shrink-0">
              <div 
                className="h-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${progressPercent}%`, 
                  background: "linear-gradient(90deg, #4c3cc7, #6c5ce2, #9333ea)" 
                }}
              />
            </div>

            {/* Step Navigation Tabs Rail */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 border-b border-slate-100 bg-slate-50/60 overflow-x-auto text-xs font-bold [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
              {MODAL_TABS.map((tab, idx) => {
                const isActive = activeTab === tab.key;
                const isComplete = isTabComplete(tab.key);
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => switchTab(tab.key as any)}
                    className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl whitespace-nowrap transition-all duration-200 shrink-0 border cursor-pointer ${
                      isActive 
                        ? "bg-white shadow-xs ring-2" 
                        : "bg-transparent border-transparent hover:bg-white/80 hover:border-slate-200 text-slate-600"
                    }`}
                    style={isActive ? { borderColor: "rgba(76, 60, 199, 0.4)", "--tw-ring-color": "rgba(76, 60, 199, 0.15)" } as any : undefined}
                  >
                    <div 
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                        isActive 
                          ? "text-white shadow-xs" 
                          : isComplete 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
                      }`}
                      style={isActive ? { background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" } : undefined}
                    >
                      {isComplete && !isActive ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                    </div>
                    <span 
                      className={`text-xs transition-colors ${
                        isActive ? "font-black" : "font-semibold text-slate-700"
                      }`}
                      style={isActive ? { color: "#4c3cc7" } : undefined}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Error Message Box */}
            {formError && (
              <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-7 space-y-6 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">

                {/* TAB 1: BASIC INFO */}
                {activeTab === "basic" && (
                  <div className="space-y-6 animate-in fade-in">
                    
                    {/* Property Title */}
                    <div className="p-4 sm:p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <span>Property Name / Title</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">Keep it punchy & clear</span>
                      </div>
                      <div className="relative">
                        <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Stanford Luxury Boys Hostel & PG near Knowledge Park 2"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#4c3cc7] focus:ring-4 focus:ring-[#4c3cc7]/10 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Property Type Visual Cards */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                        Property Type <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: "Hostel", title: "Hostel", desc: "Student & Working (Sharing)", icon: Building2 },
                          { id: "PG", title: "Paying Guest (PG)", desc: "Furnished room with food", icon: Home },
                          { id: "Room", title: "Private Room", desc: "Independent room / RK", icon: BedDouble },
                          { id: "Flat", title: "Flat / Apartment", desc: "1, 2, 3 BHK complete unit", icon: Building },
                        ].map((item) => {
                          const Icon = item.icon;
                          const isSelected = formData.type === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                const newType = item.id;
                                const defaultSharing = (newType === "Hostel" || newType === "PG")
                                  ? ["Double Sharing", "Triple Sharing"]
                                  : ["1 BHK Flat"];
                                setFormData({ 
                                  ...formData, 
                                  type: newType,
                                  pricingCycle: newType === "Hostel" ? "Annually" : formData.pricingCycle,
                                  sharingOptions: defaultSharing,
                                  occupancy: defaultSharing.join(", ")
                                });
                              }}
                              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                                isSelected
                                  ? "bg-[#4c3cc7]/5 border-[#4c3cc7] shadow-sm ring-2 ring-[#4c3cc7]/15"
                                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div 
                                  className={`p-2 rounded-xl transition-colors ${
                                    isSelected 
                                      ? "bg-[#4c3cc7]/10 text-[#4c3cc7]" 
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div 
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                    isSelected 
                                      ? "bg-[#4c3cc7] text-white border-[#4c3cc7]" 
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <div>
                                <span className={`block text-xs font-black ${isSelected ? "text-[#4c3cc7]" : "text-slate-900"}`}>
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium block mt-0.5 leading-tight">
                                  {item.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gender Preference Visual Pills */}
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                        Gender Preference
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: "Anyone", label: "Anyone / Co-ed", icon: Users },
                          { id: "Boys", label: "Boys Only", icon: User },
                          { id: "Girls", label: "Girls Only", icon: UserCheck },
                          { id: "Coliving", label: "Coliving Community", icon: HeartHandshake },
                          { id: "Family", label: "Family Friendly", icon: Home },
                        ].map((gen) => {
                          const Icon = gen.icon;
                          const isSelected = formData.genderPreference === gen.id;
                          return (
                            <button
                              key={gen.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, genderPreference: gen.id as any })}
                              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? "bg-[#4c3cc7] text-white border-[#4c3cc7] shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{gen.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ROOM SHARING CONFIGURATIONS */}
                    {(formData.type === "Hostel" || formData.type === "PG") ? (
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/30 via-slate-50/60 to-white border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <label className="block text-xs font-black text-slate-900 uppercase tracking-wide">
                              Available Room Sharing Options <span className="text-red-500">*</span>
                            </label>
                            <p className="text-[11px] text-slate-500">
                              Hostels often have multiple sharing options. Select all room types available at your property.
                            </p>
                          </div>
                          {formData.sharingOptions.length > 0 && (
                            <span 
                              className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border self-start sm:self-auto shrink-0"
                              style={{ 
                                backgroundColor: "rgba(76, 60, 199, 0.08)", 
                                color: "#4c3cc7",
                                borderColor: "rgba(76, 60, 199, 0.2)"
                              }}
                            >
                              {formData.sharingOptions.length} option{formData.sharingOptions.length > 1 ? "s" : ""} selected
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {HOSTEL_SHARING_OPTIONS.map((opt) => {
                            const isSelected = formData.sharingOptions.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => toggleSharingOption(opt.id)}
                                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                                  isSelected
                                    ? "bg-white border-[#4c3cc7] shadow-xs ring-2 ring-[#4c3cc7]/15"
                                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={`text-xs font-black ${isSelected ? "text-[#4c3cc7]" : "text-slate-900"}`}>
                                    {opt.label}
                                  </span>
                                  <div 
                                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                                      isSelected ? "bg-[#4c3cc7] text-white font-black" : "border border-slate-300"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                </div>
                                <span className={`text-[10px] font-medium ${isSelected ? "text-[#4c3cc7]/80" : "text-slate-400"}`}>
                                  {opt.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {formData.sharingOptions.length === 0 && (
                          <p className="text-xs text-amber-700 font-bold flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Please select at least one sharing option for your hostel.</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2.5">
                        <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                          Flat / Room Configuration <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {FLAT_ROOM_OPTIONS.map((opt) => {
                            const isSelected = formData.sharingOptions.includes(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleSharingOption(opt)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  isSelected
                                    ? "bg-[#4c3cc7] text-white border-[#4c3cc7] shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Furnishing & Available From */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Furnishing Status</label>
                        <select
                          value={formData.furnishing}
                          onChange={(e) => setFormData({ ...formData, furnishing: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cc7]"
                        >
                          <option value="Fully Furnished">Fully Furnished (Bed, Wardrobe, Table, AC)</option>
                          <option value="Semi-Furnished">Semi-Furnished</option>
                          <option value="Unfurnished">Unfurnished</option>
                        </select>
                      </div>

                      <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Available From</label>
                        <input
                          type="text"
                          placeholder="e.g. Immediately or 1st of Next Month"
                          value={formData.availableFrom}
                          onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cc7]"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                        Detailed Overview / Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe room amenities, ventilation, proximity to universities, daily meals, transport access, rules..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-3.5 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4c3cc7] focus:bg-white focus:ring-4 focus:ring-[#4c3cc7]/10"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: PRICING & SEATER MATRIX */}
                {activeTab === "pricing" && (
                  <div className="space-y-6 animate-in fade-in">
                    
                    {/* Billing Frequency Segmented Control */}
                    <div 
                      className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      style={{ 
                        backgroundColor: "rgba(76, 60, 199, 0.04)", 
                        borderColor: "rgba(76, 60, 199, 0.2)" 
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                            Pricing Billing Frequency
                          </span>
                          {formData.type === "Hostel" && (
                            <span 
                              className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                              style={{ background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" }}
                            >
                              Hostel Default: Annually
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {formData.type === "Hostel"
                            ? "Hostels are usually charged Annually (per year), but you can choose Monthly if required."
                            : "Choose whether your rent amount is billed Monthly or Annually."}
                        </p>
                      </div>

                      <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, pricingCycle: "Annually" })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            formData.pricingCycle === "Annually"
                              ? "text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                          style={formData.pricingCycle === "Annually" ? { background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" } : undefined}
                        >
                          Annually (Per Year)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, pricingCycle: "Monthly" })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            formData.pricingCycle === "Monthly"
                              ? "text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                          style={formData.pricingCycle === "Monthly" ? { background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" } : undefined}
                        >
                          Monthly (Per Month)
                        </button>
                      </div>
                    </div>

                    {/* Seater & AC / Non-AC Rates Matrix */}
                    {(formData.type === "Hostel" || formData.type === "PG") && (
                      <div className="p-4 sm:p-6 bg-slate-50/80 border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                <BedDouble className="w-4 h-4" style={{ color: "#4c3cc7" }} />
                                <span>Seater & AC / Non-AC Pricing Rates</span>
                              </span>
                              <span 
                                className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                                style={{ 
                                  backgroundColor: "rgba(76, 60, 199, 0.08)", 
                                  color: "#4c3cc7",
                                  borderColor: "rgba(76, 60, 199, 0.2)"
                                }}
                              >
                                {formData.pricingCycle === "Annually" ? "₹ / Year" : "₹ / Month"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Set specific rates according to seater configuration (Single, Double, Triple, 4-Sharing) and AC vs Non-AC cooling.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddRoomPricingTier}
                            className="self-start sm:self-center px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                            style={{ color: "#4c3cc7" }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Seater
                          </button>
                        </div>

                        {/* Tiers List */}
                        <div className="space-y-3">
                          {formData.roomPricings.map((tier, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                            >
                              {/* Seater Title */}
                              <div className="flex items-center gap-3 min-w-[200px]">
                                <div 
                                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border"
                                  style={{ 
                                    backgroundColor: "rgba(76, 60, 199, 0.08)", 
                                    borderColor: "rgba(76, 60, 199, 0.2)",
                                    color: "#4c3cc7"
                                  }}
                                >
                                  <BedDouble className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={tier.seater}
                                    onChange={(e) => handleRoomPricingChange(idx, "seater", e.target.value)}
                                    placeholder="e.g. Double Sharing"
                                    className="text-xs font-black text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-[#4c3cc7] outline-none w-full py-0.5"
                                  />
                                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                                    {formData.pricingCycle === "Annually" ? "Annual Tariff" : "Monthly Tariff"}
                                  </span>
                                </div>
                              </div>

                              {/* AC & Non-AC Rates Input Boxes */}
                              <div className="grid grid-cols-2 gap-3 flex-1 max-w-md">
                                {/* Non-AC Rate */}
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1.5 mb-1">
                                    <Wind className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Non-AC Rate (₹)</span>
                                  </label>
                                  <div className="relative">
                                    <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                      type="number"
                                      placeholder={formData.pricingCycle === "Annually" ? "80000" : "7000"}
                                      value={tier.nonAcPrice}
                                      onChange={(e) => handleRoomPricingChange(idx, "nonAcPrice", e.target.value)}
                                      className="w-full pl-7 pr-2 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#4c3cc7] focus:ring-2 focus:ring-[#4c3cc7]/10 transition-all"
                                    />
                                  </div>
                                </div>

                                {/* AC Rate */}
                                <div>
                                  <label 
                                    className="text-[10px] font-bold uppercase flex items-center gap-1.5 mb-1"
                                    style={{ color: "#4c3cc7" }}
                                  >
                                    <Snowflake className="w-3.5 h-3.5" style={{ color: "#4c3cc7" }} />
                                    <span>AC Rate (₹)</span>
                                  </label>
                                  <div className="relative">
                                    <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#4c3cc7" }} />
                                    <input
                                      type="number"
                                      placeholder={formData.pricingCycle === "Annually" ? "95000" : "8500"}
                                      value={tier.acPrice}
                                      onChange={(e) => handleRoomPricingChange(idx, "acPrice", e.target.value)}
                                      className="w-full pl-7 pr-2 py-2 text-xs font-bold rounded-xl focus:bg-white focus:outline-none focus:border-[#4c3cc7] focus:ring-2 focus:ring-[#4c3cc7]/10 transition-all"
                                      style={{ 
                                        backgroundColor: "rgba(76, 60, 199, 0.05)", 
                                        borderColor: "rgba(76, 60, 199, 0.25)",
                                        color: "#2a2079"
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Delete Seater Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveRoomPricing(idx)}
                                className="self-end md:self-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                title="Remove seater option"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <p className="text-[11px] text-slate-500 italic flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Tip: Leave a box empty if that specific combination (e.g. Non-AC) is not available for that seater.</span>
                        </p>
                      </div>
                    )}

                    {/* Starting Base Price & Deposit Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Starting Price Input */}
                      <div 
                        className="p-4 sm:p-5 rounded-2xl border space-y-2"
                        style={{ 
                          backgroundColor: "rgba(76, 60, 199, 0.03)", 
                          borderColor: "rgba(76, 60, 199, 0.2)" 
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                            {formData.type === "Hostel" || formData.type === "PG"
                              ? (formData.pricingCycle === "Annually" ? "Starting Annual Fee (₹/year)" : "Starting Monthly Rent (₹/month)")
                              : (formData.pricingCycle === "Annually" ? "Annual Hostel Fee (₹/year)" : "Monthly Rent (₹/month)")} <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Base Rate</span>
                        </div>
                        <div className="relative">
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#4c3cc7" }} />
                          <input
                            type="number"
                            required
                            placeholder={formData.pricingCycle === "Annually" ? "95000" : "8500"}
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:border-[#4c3cc7] focus:ring-4 focus:ring-[#4c3cc7]/10"
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {formData.pricingCycle === "Annually" && formData.price 
                            ? `Displays as 'From ₹${Number(formData.price).toLocaleString()} / year' (~₹${Math.round(Number(formData.price) / 12).toLocaleString()} / mo)`
                            : "Base starting price displayed on cards and search results"}
                        </span>
                      </div>

                      {/* Security Deposit */}
                      <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                            Security Deposit (₹)
                          </label>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Refundable</span>
                        </div>
                        <div className="relative">
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="number"
                            placeholder="e.g. 10000 (Enter 0 for Zero Deposit)"
                            value={formData.deposit}
                            onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#4c3cc7] focus:ring-4 focus:ring-[#4c3cc7]/10"
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Refundable deposit collected at check-in time
                        </span>
                      </div>
                    </div>

                    {/* Secondary Pricing Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Maintenance Charges</label>
                        <input
                          type="text"
                          placeholder="e.g. Included or ₹500/mo"
                          value={formData.maintenance}
                          onChange={(e) => setFormData({ ...formData, maintenance: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cc7]"
                        />
                      </div>

                      <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notice Period</label>
                        <select
                          value={formData.noticePeriod}
                          onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cc7]"
                        >
                          <option value="1 Month">1 Month</option>
                          <option value="15 Days">15 Days</option>
                          <option value="2 Months">2 Months</option>
                          <option value="Immediate / No Notice">No Notice Required</option>
                        </select>
                      </div>

                      <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Food / Mess Plan</label>
                        <select
                          value={formData.foodIncluded}
                          onChange={(e) => setFormData({ ...formData, foodIncluded: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cc7]"
                        >
                          <option value="3 Meals Included">3 Meals Included (Daily)</option>
                          <option value="2 Meals Included">2 Meals (Breakfast & Dinner)</option>
                          <option value="Optional">Optional / Mess Extra</option>
                          <option value="Self Cooking Available">Self Cooking Kitchen</option>
                          <option value="Not Included">Not Included</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: LOCATION & ADDRESS */}
                {activeTab === "location" && (
                  <div className="space-y-5 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
                        <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                          City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Greater Noida"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#4c3cc7] focus:ring-4 focus:ring-[#4c3cc7]/10"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
                        <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                          Area / Sector / Neighborhood <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Knowledge Park II or Pari Chowk"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#4c3cc7] focus:ring-4 focus:ring-[#4c3cc7]/10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                        Nearby Landmark or College
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Opposite Sharda University Gate 2 or Near Pari Chowk Metro"
                        value={formData.nearbyLandmark}
                        onChange={(e) => setFormData({ ...formData, nearbyLandmark: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#4c3cc7] focus:ring-4 focus:ring-[#4c3cc7]/10"
                      />
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Helps students & tenants instantly identify location relative to their campus or office.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
                        <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                          Complete Street Address
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Plot 14, Knowledge Park II, Greater Noida, UP"
                          value={formData.fullAddress}
                          onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#4c3cc7]"
                        />
                      </div>
                      <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-1.5">
                        <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">Pincode</label>
                        <input
                          type="text"
                          placeholder="201310"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#4c3cc7]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: AMENITIES */}
                {activeTab === "amenities" && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                          Select Property Amenities
                        </h4>
                        <span 
                          className="text-[11px] font-black px-2.5 py-0.5 rounded-full border"
                          style={{ 
                            backgroundColor: "rgba(76, 60, 199, 0.08)", 
                            color: "#4c3cc7",
                            borderColor: "rgba(76, 60, 199, 0.2)"
                          }}
                        >
                          {formData.amenities.length} selected
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">Click any facility to toggle it for this property:</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {STANDARD_AMENITIES.map((amenity) => {
                          const isSelected = formData.amenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-white border-[#4c3cc7] shadow-xs ring-2 ring-[#4c3cc7]/15"
                                  : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <span className={isSelected ? "text-[#4c3cc7] font-black" : "text-slate-800"}>
                                {amenity}
                              </span>
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0 ml-1.5" style={{ color: "#4c3cc7" }} />
                              ) : (
                                <Plus className="w-4 h-4 text-slate-300 shrink-0 ml-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Custom Amenity */}
                    <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                        Add Custom Amenity
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Badminton Court, Study Lamp, TT Table..."
                          value={customAmenityInput}
                          onChange={(e) => setCustomAmenityInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomAmenity(); } }}
                          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4c3cc7]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomAmenity}
                          className="px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                          style={{ background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: PHOTOS & MEDIA */}
                {activeTab === "photos" && (
                  <div className="space-y-6 animate-in fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                          Property Photos ({formData.images.length})
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">First photo is your cover image</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Upload high-resolution photos of bedrooms, washrooms, dining, and exterior to maximize bookings.
                      </p>
                    </div>

                    {/* Upload Dropzone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* File Upload Area */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-[#4c3cc7] bg-slate-50/60 hover:bg-[#4c3cc7]/5 p-6 rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2.5 group"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs"
                          style={{ 
                            backgroundColor: "rgba(76, 60, 199, 0.1)", 
                            color: "#4c3cc7" 
                          }}
                        >
                          {isUploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          {isUploadingImage ? "Uploading Photos..." : "Upload Photos from Device"}
                        </p>
                        <p className="text-[11px] text-slate-400">Click to browse JPG, PNG, WEBP files</p>
                      </div>

                      {/* URL Paste Area */}
                      <div className="bg-slate-50/70 border border-slate-200/90 p-6 rounded-3xl space-y-3 flex flex-col justify-center">
                        <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                          Or Add Direct Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddImageUrl(); } }}
                            className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4c3cc7]"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-4 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
                            style={{ background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" }}
                          >
                            Add URL
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">Paste any public web image address</span>
                      </div>
                    </div>

                    {/* Uploaded Photos Grid */}
                    <div>
                      {formData.images.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-xs font-medium bg-slate-50/40">
                          No photos uploaded yet. Upload property photos above to make your listing live.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                          {formData.images.map((imgUrl, idx) => (
                            <div 
                              key={idx} 
                              className="relative group h-36 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-xs"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                              {/* Cover Badge */}
                              {idx === 0 ? (
                                <div 
                                  className="absolute top-2 left-2 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase shadow-md flex items-center gap-1"
                                  style={{ background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" }}
                                >
                                  <Star className="w-3 h-3 fill-white" /> Cover
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverImage(idx)}
                                  className="absolute top-2 left-2 bg-black/70 hover:bg-[#4c3cc7] text-white px-2 py-0.5 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                                >
                                  Set Cover
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-md transition-all opacity-80 hover:opacity-100 active:scale-95"
                                title="Delete photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 6: RULES & CARETAKER */}
                {activeTab === "rules" && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                        Caretaker / Contact Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. +91 98765 43210 (Default is your account phone)"
                          value={formData.contactPhone}
                          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#4c3cc7] focus:ring-4 focus:ring-[#4c3cc7]/10"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Direct contact number provided to interested tenants for visits.
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1">
                        House Rules & Guidelines
                      </h4>
                      <p className="text-xs text-slate-500 mb-3">Select guidelines that apply to this property:</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {STANDARD_RULES.map((rule) => {
                          const isSelected = formData.rules.includes(rule);
                          return (
                            <button
                              key={rule}
                              type="button"
                              onClick={() => toggleRule(rule)}
                              className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-white border-[#4c3cc7] shadow-xs ring-2 ring-[#4c3cc7]/15"
                                  : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <span className={isSelected ? "text-[#4c3cc7] font-black" : "text-slate-800"}>
                                {rule}
                              </span>
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0 ml-1.5" style={{ color: "#4c3cc7" }} />
                              ) : (
                                <Plus className="w-4 h-4 text-slate-300 shrink-0 ml-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Custom Rule */}
                    <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                        Add Custom Rule
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Non-veg food allowed on weekends only..."
                          value={customRuleInput}
                          onChange={(e) => setCustomRuleInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomRule(); } }}
                          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4c3cc7]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomRule}
                          className="px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                          style={{ background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" }}
                        >
                          Add Rule
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls (Sticky & Pinned) */}
              <div className="px-4 sm:px-7 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3.5 sm:px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  {activeTab !== "basic" && (
                    <button
                      type="button"
                      onClick={handlePrevTab}
                      className="px-3.5 sm:px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-400 sm:hidden">
                    {currentStepIdx + 1}/6
                  </span>

                  {/* Show "Next Step" on steps 1-5, and ONLY show "Publish Listing" / "Save Changes" on the final tab (rules) */}
                  {activeTab !== "rules" ? (
                    <button
                      type="button"
                      onClick={handleNextTab}
                      className="px-5 sm:px-6 py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-indigo-950/20 cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" }}
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 sm:px-7 py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-indigo-950/20 cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #4c3cc7, #6c5ce2)" }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Listing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{editingId ? "Save Changes" : "Publish Listing"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {mounted && deleteTarget && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          style={{ 
            position: "fixed", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            width: "100vw", 
            height: "100vh", 
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zoom: 1
          }}
        >
          <div 
            className="fixed inset-0"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          />
          <div 
            className="relative z-10 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Delete Property Listing?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-800">&quot;{deleteTarget.title}&quot;</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Keep Listing
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Yes, Delete</span>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
