import Link from "next/link";
import { Search, Home, MapPin, Building, ShieldCheck, TrendingUp, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-sm relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900 tracking-tight">SuperRent</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Find a Property</Link>
              <Link href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">List Your Property</Link>
              <Link href="#" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">How it Works</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all hover:shadow-md">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative bg-white overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-blue-50 rounded-l-[100px] opacity-50 hidden lg:block"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                The Smartest Way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Rent & Lease</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
                Whether you're a student looking for the perfect PG or an owner wanting high-quality leads, SuperRent connects you instantly.
              </p>
              
              {/* Search Bar */}
              <div className="bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-2">
                <div className="flex-grow flex items-center w-full px-4 py-3 bg-slate-50 rounded-xl border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                  <MapPin className="text-slate-400 h-5 w-5 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Search by city, neighborhood, or college..." 
                    className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
                  />
                </div>
                <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500"/> Verified Listings</span>
                <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-500"/> Hot Leads for Owners</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Explore Property Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { name: "Hostels", icon: <Users className="h-8 w-8 text-indigo-600" />, desc: "Perfect for students", color: "bg-indigo-50" },
                { name: "PGs", icon: <Home className="h-8 w-8 text-blue-600" />, desc: "Co-living spaces", color: "bg-blue-50" },
                { name: "Rooms", icon: <Building className="h-8 w-8 text-emerald-600" />, desc: "Private rooms", color: "bg-emerald-50" },
                { name: "Flats", icon: <MapPin className="h-8 w-8 text-orange-600" />, desc: "Full apartments", color: "bg-orange-50" },
              ].map((type) => (
                <div key={type.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className={`w-16 h-16 rounded-xl ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{type.name}</h3>
                  <p className="text-slate-500 text-sm">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-white tracking-tight">SuperRent</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <Link href="/login" className="hover:text-white transition-colors">
              User Sign In
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/admin/login" className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </Link>
          </div>

          <p className="text-xs">© {new Date().getFullYear()} SuperRent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
