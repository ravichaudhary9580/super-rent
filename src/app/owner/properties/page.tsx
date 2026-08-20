"use client";

import { useState, useEffect } from "react";
import { Building, Plus, MoreHorizontal, ExternalLink, Loader2, X } from "lucide-react";
import Link from "next/link";

export default function MyProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    type: "PG",
    price: "",
    city: "Bangalore",
    area: "",
    description: "",
  });

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

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price || !formData.area.trim()) {
      return setFormError("Please fill out all required fields");
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          type: formData.type,
          price: Number(formData.price),
          description: formData.description,
          location: {
            city: formData.city,
            area: formData.area.trim(),
          }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create property");

      setShowAddModal(false);
      setFormData({
        title: "",
        type: "PG",
        price: "",
        city: "Bangalore",
        area: "",
        description: "",
      });
      await fetchMyProperties();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Properties</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your active listings and track their performance.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Loading your properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Building className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No properties listed yet</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Add your PG, hostel, room, or flat listing to start receiving high-intent leads and student inquiries.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Property</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Property Name</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {properties.map((prop) => {
                  const propId = prop._id || prop.id;
                  const loc = typeof prop.location === "object"
                    ? `${prop.location.area}, ${prop.location.city}`
                    : prop.location || "N/A";

                  return (
                    <tr key={propId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <Building className="w-5 h-5" />
                        </div>
                        <span>{prop.title}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">{prop.type}</td>
                      <td className="py-4 px-6 text-sm text-slate-500">{loc}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-900">₹{prop.price.toLocaleString()}/mo</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                          prop.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {prop.status || "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link href={`/properties/${propId}`} className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-blue-50" title="View Property Page">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-xl hover:bg-slate-100" title="More Options">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Add New Property</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddProperty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Property Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal PG for Boys"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Property Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  >
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Room">Room</option>
                    <option value="Flat">Flat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="8500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Area / Neighborhood</label>
                  <input
                    type="text"
                    required
                    placeholder="Koramangala 5th Block"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Includes WiFi, 3 daily meals, laundry, and daily housekeeping..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Publish Listing</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
