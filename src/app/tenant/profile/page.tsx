"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Calendar,
  IndianRupee,
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

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  image: string;
  city: string;
  targetCity: string;
  location: string;
  college: string;
  occupation: string;
  gender: string;
  budget: string;
  preferredType: string;
  moveInDate: string;
  bio: string;
  whatsappOptIn: boolean;
  emergencyContact: EmergencyContact;
}

const INITIAL_STATE: ProfileFormData = {
  name: "",
  email: "",
  phone: "",
  image: "",
  city: "",
  targetCity: "",
  location: "",
  college: "",
  occupation: "Student",
  gender: "",
  budget: "",
  preferredType: "Any",
  moveInDate: "",
  bio: "",
  whatsappOptIn: true,
  emergencyContact: {
    name: "",
    phone: "",
    relation: "",
  },
};

export default function TenantProfile() {
  const { data: session, update: updateSession } = useSession();
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Fetch Profile Data on Mount
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
            targetCity: u.targetCity || "",
            location: u.location || "",
            college: u.college || "",
            occupation: u.occupation || "Student",
            gender: u.gender || "",
            budget: u.budget || "",
            preferredType: u.preferredType || "Any",
            moveInDate: u.moveInDate || "",
            bio: u.bio || "",
            whatsappOptIn: u.whatsappOptIn ?? true,
            emergencyContact: {
              name: u.emergencyContact?.name || "",
              phone: u.emergencyContact?.phone || "",
              relation: u.emergencyContact?.relation || "",
            },
          });
        } else {
          setErrorMessage(data.error || "Failed to load profile data.");
        }
      } catch (err: any) {
        console.error("Profile load error:", err);
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

  const handleChange = (field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleEmergencyChange = (field: keyof EmergencyContact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
    setHasChanges(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage("Full name is required.");
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

      setSuccessMessage("Profile saved successfully to database! ");
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
      console.error("Save profile error:", err);
      setErrorMessage(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading your profile from database...</p>
      </div>
    );
  }

  const initials = (formData.name || (session?.user as any)?.name || "T")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const checklist = [
    { label: "Full Name", key: "name", isDone: Boolean(formData.name?.trim()), sectionId: "section-personal" },
    { label: "Email Address", key: "email", isDone: Boolean(formData.email?.trim()), sectionId: "section-personal" },
    { label: "Verified Phone", key: "phone", isDone: Boolean(formData.phone?.trim()), sectionId: "section-personal" },
    { label: "Gender", key: "gender", isDone: Boolean(formData.gender), sectionId: "section-personal" },
    { label: "Bio / About Me", key: "bio", isDone: Boolean(formData.bio?.trim()), sectionId: "section-personal" },
    { label: "City / Hometown", key: "city", isDone: Boolean(formData.city?.trim()), sectionId: "section-location" },
    { label: "Target City", key: "targetCity", isDone: Boolean(formData.targetCity?.trim()), sectionId: "section-location" },
    { label: "Preferred Locality", key: "location", isDone: Boolean(formData.location?.trim()), sectionId: "section-location" },
    { label: "College / Company", key: "college", isDone: Boolean(formData.college?.trim()), sectionId: "section-location" },
    { label: "Occupation Status", key: "occupation", isDone: Boolean(formData.occupation?.trim()), sectionId: "section-location" },
    { label: "Property Type", key: "preferredType", isDone: Boolean(formData.preferredType && formData.preferredType !== "Any"), sectionId: "section-preferences" },
    { label: "Max Budget", key: "budget", isDone: Boolean(formData.budget?.trim()), sectionId: "section-preferences" },
    { label: "Move-in Date", key: "moveInDate", isDone: Boolean(formData.moveInDate?.trim()), sectionId: "section-preferences" },
    { label: "Emergency Contact", key: "emergencyContact", isDone: Boolean(formData.emergencyContact?.name?.trim() && formData.emergencyContact?.phone?.trim()), sectionId: "section-emergency" },
  ];

  const completedCount = checklist.filter((item) => item.isDone).length;
  const totalCount = checklist.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const pendingItems = checklist.filter((item) => !item.isDone);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Tenant Profile & Preferences
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal information, rental preferences, and stay details.
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
                  alt={formData.name || "Avatar"}
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
              title="Upload profile photo to AWS S3"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {formData.name || "Tenant"}
              </h2>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black tracking-wider uppercase">
                Tenant Member
              </span>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Account
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
              {(formData.targetCity || formData.city) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {formData.targetCity ? `Looking in ${formData.targetCity}` : formData.city}
                  {formData.location ? ` (${formData.location})` : ""}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Dynamic Profile Completion Progress Widget */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg ${completionPercentage === 100
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : completionPercentage >= 60
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                      : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}
              >
                {completionPercentage}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Profile Strength & Verification
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${completionPercentage === 100
                        ? "bg-emerald-500 text-white"
                        : completionPercentage >= 60
                          ? "bg-blue-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                  >
                    {completionPercentage === 100 ? "Complete" : completionPercentage >= 60 ? "Good" : "Needs Attention"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {completedCount} of {totalCount} profile criteria completed
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              {completionPercentage === 100
                ? "Maximum visibility unlocked"
                : "Complete 100% profile to get best accomodation of your choice."}
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${completionPercentage === 100
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : completionPercentage >= 60
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                    : "bg-gradient-to-r from-amber-500 to-orange-500"
                }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Actionable Prompt & Missing Items List */}
          {completionPercentage < 100 ? (
            <div className="pt-2 space-y-2.5">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Complete these fields to reach 100%:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => scrollToSection(item.sectionId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all shadow-sm active:scale-95 group"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold group-hover:translate-x-0.5 transition-transform">+</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-1 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Your tenant profile is 100% complete. Property owners can verify and reach you directly.</span>
            </div>
          )}
        </div>

        {/* Section 1: Personal & Contact Information */}
        <div id="section-personal" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal & Contact Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your core identity and contact coordinates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Phone Number (Verified) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Phone Number (Verified via OTP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  disabled
                  value={formData.phone}
                  className="w-full pl-10 pr-10 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Phone is locked to your authenticated OTP credential.</span>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                About Me / Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Write a brief introduction about yourself, habits, or roommate preferences..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location, College & Profession */}
        <div id="section-location" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Location & Background</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Where you study, work, or are looking to stay</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* City / Hometown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                City / Hometown
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g. Jaipur, Lucknow, Patna, Indore"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* City where you want accommodation? (New targetCity field) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                City where you want accommodation?
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.targetCity}
                  onChange={(e) => handleChange("targetCity", e.target.value)}
                  placeholder="e.g. Bangalore, Delhi, Pune, Mumbai, Hyderabad"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Preferred Locality / Area within target city */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Preferred Locality / Area
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. Koramangala, HSR Layout, Indiranagar"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* College / University / Organization */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                College / University / Company
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => handleChange("college", e.target.value)}
                  placeholder="e.g. PES University / Infosys / St. Joseph's"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Occupation */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Occupation Status
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="Student">Student (College / Coaching)</option>
                  <option value="Working Professional">Working Professional (IT / Corporate)</option>
                  <option value="Freelancer / Remote">Freelancer / Remote Worker</option>
                  <option value="Job Seeker">Job Seeker / Intern</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Rental Preferences & Budget */}
        <div id="section-preferences" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rental Preferences & Budget</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Help owners understand your accommodation requirements</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Preferred Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Preferred Type
              </label>
              <select
                value={formData.preferredType}
                onChange={(e) => handleChange("preferredType", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="Any">Any Accommodation</option>
                <option value="PG">Paying Guest (PG)</option>
                <option value="Hostel">Hostel (Student / Working)</option>
                <option value="1 BHK">1 BHK Apartment</option>
                <option value="2 BHK">2 BHK Apartment</option>
                <option value="3 BHK">3 BHK Apartment</option>
                <option value="Flatmate">Shared Flat / Flatmate Room</option>
              </select>
            </div>

            {/* Target Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Budget
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => handleChange("budget", e.target.value)}
                  placeholder="e.g. ₹1,00,000"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Expected Move-in Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Expected Move-in
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => handleChange("moveInDate", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Contact & Communication */}
        <div id="section-emergency" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Contact & Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Security contact and notification channel settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Contact Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) => handleEmergencyChange("name", e.target.value)}
                placeholder="Parent / Guardian Name"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Relation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Relationship
              </label>
              <select
                value={formData.emergencyContact.relation}
                onChange={(e) => handleEmergencyChange("relation", e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select Relation</option>
                <option value="Parent">Parent (Father / Mother)</option>
                <option value="Sibling">Sibling (Brother / Sister)</option>
                <option value="Guardian">Guardian</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Emergency Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleEmergencyChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* WhatsApp Notifications Toggle */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  WhatsApp Property Updates & Alerts
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Receive instant property availability updates and owner messages directly on WhatsApp.
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

        {/* Floating Bottom Save Action Bar */}
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
