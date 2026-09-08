"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Building,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Edit3,
  Camera,
  Wallet,
  DollarSign,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  ExternalLink,
  X,
  Lock
} from "lucide-react";

import { convertToWebP } from "@/lib/imageUtils";

interface OwnerProfileData {
  name: string;
  businessName: string;
  hostelName: string;
  email: string;
  phone: string;
  image: string;
  city: string;
  location: string;
  bio: string;
  whatsappOptIn: boolean;
}

interface OwnerStats {
  walletBalance: number;
  totalSpent: number;
  propertiesCount: number;
  purchasedLeadsCount: number;
}

const INITIAL_STATE: OwnerProfileData = {
  name: "",
  businessName: "",
  hostelName: "",
  email: "",
  phone: "",
  image: "",
  city: "",
  location: "",
  bio: "",
  whatsappOptIn: true,
};

export default function OwnerProfile() {
  const { data: session, update: updateSession } = useSession();
  const [formData, setFormData] = useState<OwnerProfileData>(INITIAL_STATE);
  const [originalData, setOriginalData] = useState<OwnerProfileData>(INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<OwnerStats>({
    walletBalance: 500,
    totalSpent: 0,
    propertiesCount: 0,
    purchasedLeadsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleCancelEdit = () => {
    setFormData(originalData);
    setHasChanges(false);
    setIsEditing(false);
    setErrorMessage("");
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/user/profile");
        const data = await res.json();

        if (res.ok && data.user) {
          const u = data.user;
          const bName = u.businessName || u.hostelName || "";
          const profileData: OwnerProfileData = {
            name: u.name || "",
            businessName: bName,
            hostelName: bName,
            email: u.email || "",
            phone: u.phone || "",
            image: u.image || "",
            city: u.city || "",
            location: u.location || "",
            bio: u.bio || "",
            whatsappOptIn: u.whatsappOptIn ?? true,
          };
          setFormData(profileData);
          setOriginalData(profileData);

          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          setErrorMessage(data.error || "Failed to load owner profile.");
        }
      } catch (err: any) {
        console.error("Owner profile error:", err);
        setErrorMessage("Network error loading profile.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setErrorMessage("Profile photo exceeds maximum allowed limit of 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage("");

    try {
      // 1. Convert avatar to lightweight WebP format
      const webpFile = await convertToWebP(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
      });

      // 2. Upload to S3
      const uploadFormData = new FormData();
      uploadFormData.append("file", webpFile);
      uploadFormData.append("folder", "avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload avatar to AWS S3.");
      }

      setFormData((prev) => ({ ...prev, image: data.fileUrl }));
      setHasChanges(true);
      setSuccessMessage("Profile photo uploaded! Click Save Profile to apply.");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setErrorMessage(err.message || "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleChange = (field: keyof OwnerProfileData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "businessName") {
        updated.hostelName = value;
      } else if (field === "hostelName") {
        updated.businessName = value;
      }
      return updated;
    });
    setHasChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage("Owner / Manager Name is required.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }

      setSuccessMessage("Owner profile saved successfully to database!");
      setOriginalData(formData);
      setHasChanges(false);
      setIsEditing(false);

      // Sync Session (Sidebar name & avatar)
      await updateSession({
        name: formData.name,
        image: formData.image,
      });

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err: any) {
      console.error("Save owner profile error:", err);
      setErrorMessage(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading owner profile from database...</p>
      </div>
    );
  }

  const initials = (formData.name || (session?.user as any)?.name || "O")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              Owner Account
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Property Owner Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
            Manage your hostel brand, operating locations, and contact settings.
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{isSaving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Metrics & Direct Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Wallet Balance Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Wallet Balance</p>
              <p className="text-xl font-black text-emerald-600 mt-0.5">
                ₹{stats.walletBalance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <Link
            href="/owner/leads?tab=wallet"
            className="p-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors flex items-center gap-1"
            title="Manage Credits"
          >
            <span>Top-up</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* My Properties Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">My Hostels</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.propertiesCount} Listed
              </p>
            </div>
          </div>
          <Link
            href="/owner/properties"
            className="p-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors flex items-center gap-1"
            title="Manage Properties"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Purchased Leads Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Unlocked Leads</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.purchasedLeadsCount} Contacts
              </p>
            </div>
          </div>
          <Link
            href="/owner/purchased-leads"
            className="p-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-xl transition-colors flex items-center gap-1"
            title="View Purchased Leads"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Profile Card Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Container with S3 Photo Upload */}
          <div className="relative group shrink-0">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-xl relative"
              style={{ backgroundColor: "var(--color-primary, #4f46e5)" }}
            >
              {formData.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.image}
                  alt={formData.name || "Owner Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            {/* Camera Upload Button Overlay */}
            <button
              type="button"
              onClick={() => {
                if (!isEditing) setIsEditing(true);
                avatarInputRef.current?.click();
              }}
              disabled={isUploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={isEditing ? "Upload owner profile photo" : "Click to edit photo"}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {formData.name || "Owner"}
              </h2>
              {(formData.businessName || formData.hostelName) && (
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 rounded-full text-xs font-black flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{formData.businessName || formData.hostelName}</span>
                </span>
              )}
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Owner
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {formData.phone || "No phone linked"}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {formData.email || "No email linked"}
              </span>
              {formData.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  {formData.location ? `${formData.location}, ` : ""}{formData.city}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Business & Identity Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hostel Brand & Business Identity</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Information displayed to prospective tenants and admin directory</p>
              </div>
            </div>

            {/* Mode Indicator Pill */}
            {isEditing ? (
              <span className="self-start sm:self-auto px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 rounded-full text-xs font-black flex items-center gap-1.5 animate-pulse">
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Editing Enabled</span>
              </span>
            ) : (
              <span className="self-start sm:self-auto px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Locked (Read-Only)</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Hostel / PG Business Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Hostel / PG Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.businessName || formData.hostelName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  placeholder="e.g. Starlight Luxury Boys PG & Hostel"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isEditing
                      ? "bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      : "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none focus:outline-none"
                  }`}
                />
              </div>
            </div>

            {/* Owner / Manager Full Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Owner / Manager Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isEditing
                    ? "bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                    : "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none focus:outline-none"
                }`}
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g. owner@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isEditing
                      ? "bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      : "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none focus:outline-none"
                  }`}
                />
              </div>
            </div>

            {/* Operating City */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Operating City
              </label>
              
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g. Greater Noida"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isEditing
                      ? "bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                      : "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none focus:outline-none"
                  }`}
                />
              </div>
            </div>

            {/* Main Area / Locality / Campus */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Locality / Sector / Campus Area
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g. Knowledge Park III, Pari Chowk, Sector 62, North Campus"
                className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isEditing
                    ? "bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                    : "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none focus:outline-none"
                }`}
              />
            </div>

            {/* Business Bio / Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                About Your Properties & Facilities
              </label>
              <textarea
                rows={3}
                disabled={!isEditing}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Describe your properties, food & amenities, rules, or key highlights..."
                className={`w-full p-4 rounded-2xl text-sm font-medium transition-all ${
                  isEditing
                    ? "bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-500 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                    : "bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none focus:outline-none"
                }`}
              />
            </div>
          </div>

          {/* WhatsApp Lead Notification Opt-in */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Instant WhatsApp Lead Notifications
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Receive instant alerts when a student or professional inquires about your hostel.
                </span>
              </div>
            </div>

            <label className={`relative inline-flex items-center shrink-0 ${isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-75"}`}>
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={formData.whatsappOptIn}
                onChange={(e) => handleChange("whatsappOptIn", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Bottom Bar */}
        {isEditing ? (
          <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span>{hasChanges ? "You have unsaved changes." : "Editing mode active. Click Save when done."}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Profile fields are locked in view mode.</span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
