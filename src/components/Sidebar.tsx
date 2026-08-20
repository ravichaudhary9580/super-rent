"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  Building, 
  Search, 
  Heart, 
  User, 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Settings, 
  List, 
  ShieldCheck, 
  LogOut,
  X,
  Loader2,
  Pin,
  PinOff,
  ChevronRight,
  AlertTriangle,
  Palette
} from "lucide-react";

interface SidebarProps {
  role: "tenant" | "owner" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  
  // Desktop Hover & Pin States
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Sidebar is open if pinned OR currently hovered (desktop)
  const isExpanded = isPinned || isHovered;

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const getLinks = () => {
    switch (role) {
      case "tenant":
        return [
          { name: "Dashboard", href: "/tenant", icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: "Explore Properties", href: "/tenant/properties", icon: <Search className="w-5 h-5" /> },
          { name: "Saved Properties", href: "/tenant/saved", icon: <Heart className="w-5 h-5" /> },
          { name: "Profile", href: "/tenant/profile", icon: <User className="w-5 h-5" /> },
        ];
      case "owner":
        return [
          { name: "Dashboard", href: "/owner", icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: "My Properties", href: "/owner/properties", icon: <Building className="w-5 h-5" /> },
          { name: "Leads Marketplace", href: "/owner/leads", icon: <DollarSign className="w-5 h-5" /> },
          { name: "Profile", href: "/owner/profile", icon: <User className="w-5 h-5" /> },
        ];
      case "admin":
        return [
          { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: "Global Leads", href: "/admin/leads", icon: <List className="w-5 h-5" /> },
          { name: "Owner Management", href: "/admin/owners", icon: <Building className="w-5 h-5" /> },
          { name: "User Management", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
          { name: "Property Moderation", href: "/admin/properties", icon: <ShieldCheck className="w-5 h-5" /> },
          { name: "Pricing Control", href: "/admin/pricing", icon: <Settings className="w-5 h-5" /> },
          { name: "Theme & Styling", href: "/admin/theme", icon: <Palette className="w-5 h-5" /> },
          { name: "Profile", href: "/admin/profile", icon: <User className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();
  const roleTitle = role === "admin" ? "Super Admin" : role === "owner" ? "Property Owner" : "Tenant";
  const profileUrl = role === "admin" ? "/admin/profile" : role === "owner" ? "/owner/profile" : "/tenant/profile";

  const userInitial = session?.user?.name?.[0] || (session?.user as any)?.phone?.[0] || role[0].toUpperCase();

  // Bottom Navigation tabs for mobile
  const getBottomNavItems = () => {
    switch (role) {
      case "tenant":
        return [
          { name: "Home", href: "/tenant", icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: "Explore", href: "/tenant/properties", icon: <Search className="w-5 h-5" /> },
          { name: "Saved", href: "/tenant/saved", icon: <Heart className="w-5 h-5" /> },
        ];
      case "owner":
        return [
          { name: "Home", href: "/owner", icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: "Properties", href: "/owner/properties", icon: <Building className="w-5 h-5" /> },
          { name: "Leads", href: "/owner/leads", icon: <DollarSign className="w-5 h-5" /> },
        ];
      case "admin":
        return [
          { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
          { name: "Leads", href: "/admin/leads", icon: <List className="w-5 h-5" /> },
          { name: "Theme", href: "/admin/theme", icon: <Palette className="w-5 h-5" /> },
          { name: "Pricing", href: "/admin/pricing", icon: <Settings className="w-5 h-5" /> },
        ];
    }
  };

  const bottomNavItems = getBottomNavItems();

  return (
    <>
      {/* 1. Mobile Top Minimal Header (Not frozen/sticky, scrolls naturally) */}
      <header className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between relative z-20 shadow-sm">
        <Link href={role === "admin" ? "/admin" : role === "owner" ? "/owner" : "/tenant"} className="flex items-center gap-2">
          <Building className="h-6 w-6 shrink-0" style={{ color: "var(--color-primary)" }} />
          <span className="font-black text-lg text-white tracking-tight">SuperRent</span>
        </Link>

        {/* Profile Avatar Button (Tapping opens Right-Slide Sidebar) */}
        <button
          onClick={() => setProfileDrawerOpen(true)}
          className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-800 transition-all active:scale-95 group focus:outline-none"
          aria-label="Open Profile and Menu"
        >
          <div className="flex flex-col items-end pr-1">
            <span className="text-[11px] font-bold text-white leading-tight max-w-[100px] truncate">
              {session?.user?.name || (session?.user as any)?.phone || "Profile"}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>
              {roleTitle}
            </span>
          </div>

          <div
            className="w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center font-black text-xs text-white shadow-md shrink-0"
            style={{
              backgroundColor: "var(--color-primary)",
              borderColor: "var(--color-primary-hover)",
            }}
          >
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "User Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
        </button>
      </header>

      {/* 2. Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/tenant" && item.href !== "/owner" && item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? "text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? "shadow-md scale-105" : ""
                }`}
                style={isActive ? { backgroundColor: "var(--color-primary)", color: "#ffffff" } : undefined}
              >
                {item.icon}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? "font-bold text-white" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Bottom Bar Profile / Menu Button (Tapping opens Right-Slide Sidebar) */}
        <button
          onClick={() => setProfileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            profileDrawerOpen || pathname.includes("/profile")
              ? "text-white font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Profile and Settings Menu"
        >
          <div
            className={`w-7 h-7 rounded-full border overflow-hidden flex items-center justify-center font-black text-xs text-white transition-all ${
              profileDrawerOpen || pathname.includes("/profile") ? "ring-2 scale-105" : ""
            }`}
            style={{
              backgroundColor: "var(--color-primary)",
              borderColor: "var(--color-primary-hover)",
              boxShadow: profileDrawerOpen ? "0 0 10px var(--color-primary)" : undefined
            }}
          >
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "Avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{userInitial}</span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${profileDrawerOpen || pathname.includes("/profile") ? "font-bold text-white" : "font-medium"}`}>
            Profile
          </span>
        </button>
      </nav>

      {/* 3. Mobile Right Slide-in Sidebar (Drawer when tapping Profile) */}
      {profileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop Tap to Close */}
          <div
            className="fixed inset-0"
            onClick={() => setProfileDrawerOpen(false)}
          />

          {/* Right-Sliding Drawer Content */}
          <aside className="relative w-80 max-w-[85vw] bg-slate-900 text-slate-300 h-full border-l border-slate-800 shadow-2xl z-10 flex flex-col justify-between p-5 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Drawer Top Header with Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Account & Portal Menu
                </span>
                <button
                  onClick={() => setProfileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  aria-label="Close Sidebar Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl border overflow-hidden flex items-center justify-center font-black text-lg text-white shadow-lg shrink-0"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      borderColor: "var(--color-primary-hover)",
                    }}
                  >
                    {session?.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-extrabold text-white truncate">
                      {session?.user?.name || (session?.user as any)?.phone || "User Account"}
                    </p>
                    <p className="text-xs font-semibold capitalize truncate" style={{ color: "var(--color-primary)" }}>
                      {roleTitle}
                    </p>
                    {session?.user?.email && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {session.user.email}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={profileUrl}
                  onClick={() => setProfileDrawerOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/80 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-200 transition-colors"
                >
                  <span>Edit Profile Details</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Full Navigation Links List */}
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 px-3 mb-2">
                  Navigation
                </p>
                {links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/tenant" && link.href !== "/owner" && link.href !== "/admin" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setProfileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "text-white font-bold shadow-md"
                          : "hover:bg-slate-800/80 hover:text-white text-slate-300"
                      }`}
                      style={isActive ? { backgroundColor: "var(--color-primary)" } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <span className="shrink-0">{link.icon}</span>
                        <span>{link.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom Logout Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-sm transition-all duration-150 disabled:opacity-50 border border-red-500/20 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 4. Desktop Sidebar (Left Pinnable & Hover-Expandable - Fixed Height) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-slate-900 h-screen sticky top-0 text-slate-300 hidden md:flex flex-col justify-between transition-all duration-300 ease-in-out z-30 shrink-0 ${
          isExpanded ? "w-64 shadow-2xl" : "w-20"
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Header with Pin / Unpin Button */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
            <div className={`flex items-center ${!isExpanded ? "justify-center w-full" : "gap-2 px-2"}`}>
              <Building className="h-7 w-7 shrink-0 transition-colors" style={{ color: "var(--color-primary)" }} />
              {isExpanded && (
                <span className="text-xl font-extrabold text-white tracking-tight animate-in fade-in duration-200">
                  SuperRent
                </span>
              )}
            </div>

            {/* Pin Toggle Button */}
            {isExpanded && (
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isPinned
                    ? "text-white border border-slate-700 bg-slate-800"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title={isPinned ? "Unpin Sidebar (Collapse on mouse leave)" : "Pin Sidebar (Keep expanded)"}
                aria-label={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
              >
                {isPinned ? <Pin className="w-4 h-4 rotate-45" style={{ color: "var(--color-primary)" }} /> : <PinOff className="w-4 h-4 text-slate-400" />}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto flex-1">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/tenant" && link.href !== "/owner" && link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  title={!isExpanded ? link.name : undefined}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-200 ${
                    !isExpanded ? "justify-center" : ""
                  } ${
                    isActive
                      ? "text-white font-bold shadow-lg"
                      : "hover:bg-slate-800/80 hover:text-white"
                  }`}
                  style={isActive ? { backgroundColor: "var(--color-primary)" } : undefined}
                >
                  <span className="shrink-0">{link.icon}</span>
                  {isExpanded && (
                    <span className="font-semibold text-sm truncate animate-in fade-in duration-150">
                      {link.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout Section (Pinned firmly at the bottom of the viewport) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-3 shrink-0">
          <div className={`flex items-center ${!isExpanded ? "justify-center" : "gap-3 px-2"}`}>
            <div
              className="w-9 h-9 rounded-xl border overflow-hidden flex items-center justify-center font-black shrink-0 transition-all"
              style={{
                backgroundColor: "var(--color-primary-light)",
                color: "var(--color-primary)",
                borderColor: "var(--color-primary-hover)",
              }}
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={session.user.name || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            {isExpanded && (
              <div className="overflow-hidden flex-1 animate-in fade-in duration-150">
                <p className="text-xs font-bold text-white truncate">
                  {session?.user?.name || (session?.user as any)?.phone || "Account"}
                </p>
                <p className="text-[11px] font-medium capitalize truncate" style={{ color: "var(--color-primary)" }}>
                  {roleTitle}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isLoggingOut}
            title={!isExpanded ? "Log Out" : undefined}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group border border-red-500/20 hover:border-red-600 ${
              !isExpanded ? "px-0" : "px-3"
            }`}
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {isExpanded && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 5. Logout Confirmation Modal Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="fixed inset-0"
            onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 text-center">
            {/* Warning Icon */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
              <LogOut className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
              Confirm Log Out
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to end your current session and sign out of SuperRent?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
                className="py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <span>Yes, Log Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
