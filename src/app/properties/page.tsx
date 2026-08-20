"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Search, Building, Loader2 } from "lucide-react";

export default function ExploreProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const param = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/properties${param}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by location, college, or property name..." 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          Showing {properties.length} available {properties.length === 1 ? "property" : "properties"}
        </h2>

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Searching properties...</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((prop) => {
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
                  href={`/properties/${propId}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Building className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No properties found</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              There are currently no active properties matching your query.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
