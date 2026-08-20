"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Search, MapPin, Building, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TenantDashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("/api/properties");
        if (res.ok) {
          const data = await res.json();
          setProperties(data.properties || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperties();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome Back!</h1>
          <p className="text-slate-500 text-sm mt-1">Here is what's happening with your property search.</p>
        </div>
        <Link href="/tenant/properties" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2">
          <Search className="h-4 w-4" />
          <span>Explore Now</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:block">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center sm:mb-4 shrink-0">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">{properties.length}</h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">Available Properties</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:block">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center sm:mb-4 shrink-0">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">0</h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">Active Inquiries</p>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Featured Properties</h2>
          <Link href="/tenant/properties" className="text-blue-600 text-xs sm:text-sm font-bold hover:underline flex items-center gap-1">
            <span>View all</span> <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">Loading properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
            {properties.slice(0, 6).map((prop) => {
              const propId = prop._id || prop.id || "";
              const loc = typeof prop.location === "object"
                ? `${prop.location.area}, ${prop.location.city}`
                : prop.location || "Bangalore";
              return (
                <PropertyCard 
                  key={propId}
                  id={propId}
                  title={prop.title}
                  location={loc}
                  price={prop.price}
                  type={prop.type}
                  href={`/tenant/properties/${propId}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <Building className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-bold text-base">No listings available right now</p>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">Verified properties from owners will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
