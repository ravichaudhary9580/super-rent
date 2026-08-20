"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Building,
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
  Camera
} from "lucide-react";

import { convertToWebP } from "@/lib/imageUtils";

interface OwnerProfileData {
  name: string;
  email: string;
  phone: string;
  image: string;
  city: string;
  location: string;
  bio: string;
  whatsappOptIn: boolean;
}

const INITIAL_STATE: OwnerProfileData = {
  name: "",
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/user/profile");
        const data = await res.json();

        if (res.ok && data.user) {
          const u = data.user;
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            image: u.image || "",
            city: u.city || "",
            location: u.location || "",
            bio: u.bio || "",
            whatsappOptIn: u.whatsappOptIn ?? true,
          });
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

      // 2. Upload to AWS S3
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
      setSuccessMessage("Profile photo optimized to WebP and uploaded to S3! Click Save Profile to apply.");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setErrorMessage(err.message || "Failed to upload avatar to S3.");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleChange = (field: keyof OwnerProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage("Name is required.");
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

      setSuccessMessage("Owner profile saved successfully to database! ");
      setHasChanges(false);

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
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Property Owner Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your business information, operating locations, and contact settings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !hasChanges}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{isSaving ? "Saving..." : "Save Profile"}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Card Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Container with S3 Photo Upload */}
          <div className="relative group shrink-0">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-xl relative"
              style={{ backgroundColor: "var(--color-primary, #2563eb)" }}
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
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95"
              title="Upload owner profile photo to AWS S3"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {formData.name || "Owner"}
              </h2>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-black tracking-wider uppercase">
                Verified Owner
              </span>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> OTP Verified
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {formData.phone || "No phone linked"}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {formData.email || "No email"}
              </span>
              {formData.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {formData.city} {formData.location ? `(${formData.location})` : ""}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Business & Identity Information */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Business & Profile Information</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Public profile details displayed to prospective tenants</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Owner / Business Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Business / Owner Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Arjun PG & Hostels Pvt Ltd"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="e.g. arjun@example.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Operating City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Primary Operating City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="e.g. Bangalore, Mumbai, Delhi"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Main Area / Locality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Main Locality / Address
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g. HSR Layout, Sector 2"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Business Bio / Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                About Your Properties & Facilities
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Describe your properties, food & amenities, rules, or key highlights..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* WhatsApp Lead Notification Opt-in */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Instant WhatsApp Lead Notifications
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Get notified on WhatsApp immediately when a new tenant inquires about your property.
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.whatsappOptIn}
                onChange={(e) => handleChange("whatsappOptIn", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>{hasChanges ? "You have unsaved changes." : "All changes synced with database."}</span>
          </div>

          <button
            type="submit"
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
