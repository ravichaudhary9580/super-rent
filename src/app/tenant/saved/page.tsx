"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Search, Building, MapPin, IndianRupee, Trash2, ArrowRight } from "lucide-react";

interface SavedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  city: string;
  savedDate: string;
}

export default function TenantSavedPropertiesPage() {
  const [savedList, setSavedList] = useState<SavedProperty[]>([]);

  const handleRemove = (id: string) => {
    setSavedList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Saved Properties
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          </h1>
          <p className="text-slate-500 mt-1">
            Shortlist and quickly compare your favorite PGs, hostels, and flats.
          </p>
        </div>

        <Link
          href="/tenant/properties"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-blue-600/20 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Explore More</span>
        </Link>
      </div>

      {/* Content */}
      {savedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-slate-900 relative flex items-center justify-center text-slate-500">
                  <Building className="w-12 h-12 text-slate-600" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                    {item.type}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-600 transition-colors shadow-sm"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400">{item.savedDate}</span>
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="flex items-center text-slate-500 text-xs truncate">
                    <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-slate-400" />
                    {item.location}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-lg font-black text-slate-900">
                  <IndianRupee className="w-4 h-4 mr-0.5 text-blue-600" />
                  {item.price.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
                </div>

                <Link
                  href={`/tenant/properties/${item.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No saved properties yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            When you find a PG, hostel, or flat you like, click the heart icon to save it here for easy access.
          </p>
          <Link
            href="/tenant/properties"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Explore Properties</span>
          </Link>
        </div>
      )}
    </div>
  );
}
