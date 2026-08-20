"use client";

import { useState, useEffect } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Search, SlidersHorizontal, MapPin, Building, Filter, Check, Loader2 } from "lucide-react";

interface PropertyItem {
  id?: string;
  _id?: string;
  title: string;
  location: {
    city: string;
    area: string;
    fullAddress?: string;
  } | string;
  price: number;
  type: string;
  status?: string;
  amenities?: string[];
  images?: string[];
}

export default function TenantPropertiesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  const propertyTypes = ["All", "PG", "Hostel", "Room", "Flat"];
  const cities = ["All", "Bangalore", "Delhi", "Pune", "Mumbai", "Hyderabad", "Noida", "Gurgaon"];

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== "All") params.set("type", selectedType);
      if (selectedCity !== "All") params.set("city", selectedCity);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("Error loading properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedType, selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const sortedProperties = [...properties].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Explore Properties
          </h1>
          <p className="text-slate-500 mt-1">
            Browse verified PGs, hostels, and rental flats with direct owner contact.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by area, landmark, or PG name..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            {/* City Filter */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-[160px]">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none cursor-pointer"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city === "All" ? "📍 All Cities" : `📍 ${city}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-[180px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">💸 Price: Low to High</option>
                <option value="price-desc">💎 Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Property Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {propertyTypes.map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-bold text-slate-900">
          Showing {sortedProperties.length} available {sortedProperties.length === 1 ? "listing" : "listings"}
        </h2>
      </div>

      {/* Property Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">Finding matching properties...</p>
        </div>
      ) : sortedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {sortedProperties.map((prop) => {
            const propId = prop._id || prop.id || "";
            const locationStr = typeof prop.location === "object"
              ? `${prop.location.area}, ${prop.location.city}`
              : prop.location || "Bangalore";

            return (
              <PropertyCard
                key={propId}
                id={propId}
                title={prop.title}
                location={locationStr}
                price={prop.price}
                type={prop.type}
                href={`/tenant/properties/${propId}`}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No properties found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No properties currently match your selected filters. New listings from verified owners will appear here.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedType("All");
              setSelectedCity("All");
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
