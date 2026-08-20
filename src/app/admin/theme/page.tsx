"use client";

import React from "react";
import { 
  Palette, 
  RotateCcw, 
  Moon, 
  Sun, 
  Check, 
  ZoomIn, 
  Sparkles, 
  Sliders, 
  Layers, 
  Eye,
  ShieldCheck,
  Building,
  CheckCircle2
} from "lucide-react";
import { useTheme, PRESET_THEMES, ThemePreset } from "@/components/ThemeProvider";

export default function AdminThemePage() {
  const { themeConfig, setPreset, setCustomColors, setScale, toggleDarkMode, resetTheme } = useTheme();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2.5 rounded-2xl shadow-sm"
              style={{ backgroundColor: `${themeConfig.primary}20`, color: themeConfig.primary }}
            >
              <Palette className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Theme & Brand Styling
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                Customize global portal brand colors, appearance mode, and UI display scale.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={resetTheme}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs shadow-sm transition-all active:scale-95 shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>Reset to Default</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Controls */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Appearance & Scaling Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Dark/Light Mode */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-amber-400">
                  {themeConfig.isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Appearance Mode</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {themeConfig.isDark ? "Dark Theme Active" : "Light Theme Active"}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleDarkMode}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                  themeConfig.isDark
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {themeConfig.isDark ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Portal Display Size */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-blue-600 dark:text-blue-400">
                  <ZoomIn className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Portal Display Scale</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {themeConfig.scale === 0.9 ? "Compact (10% Smaller - Default)" : themeConfig.scale === 0.8 ? "Mini (20% Smaller)" : "Standard (100%)"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "80% Mini", val: 0.8 },
                  { label: "90% Compact", val: 0.9 },
                  { label: "100% Standard", val: 1.0 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setScale(item.val)}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold text-center transition-all ${
                      themeConfig.scale === item.val
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md ring-2 ring-slate-900/10"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 2. Curated Color Presets */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" style={{ color: themeConfig.primary }} />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Curated Brand Color Presets</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(PRESET_THEMES) as Array<Exclude<ThemePreset, "custom">>).map((key) => {
                const preset = PRESET_THEMES[key];
                const isSelected = themeConfig.preset === key;

                return (
                  <button
                    key={key}
                    onClick={() => setPreset(key)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                      isSelected
                        ? "border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20 bg-slate-50 dark:bg-slate-800 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {preset.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-slate-900 dark:text-white" />}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: preset.colors.primary }} />
                      <span className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: preset.colors.secondary }} />
                      <span className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: preset.colors.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Custom Color Pickers */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5" style={{ color: themeConfig.primary }} />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Custom Color Fine-Tuning</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Primary Color */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Primary Brand Color</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeConfig.primary}
                    onChange={(e) => setCustomColors({ primary: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={themeConfig.primary}
                    onChange={(e) => setCustomColors({ primary: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Secondary Color</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeConfig.secondary}
                    onChange={(e) => setCustomColors({ secondary: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={themeConfig.secondary}
                    onChange={(e) => setCustomColors({ secondary: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Accent Highlight</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeConfig.accent}
                    onChange={(e) => setCustomColors({ accent: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent shrink-0"
                  />
                  <input
                    type="text"
                    value={themeConfig.accent}
                    onChange={(e) => setCustomColors({ accent: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Column: Live Component Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 sticky top-8">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Eye className="w-5 h-5 text-slate-500" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Live Element Preview</h2>
            </div>

            {/* Sample Button */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Primary Action Button</span>
              <button
                type="button"
                className="w-full py-3.5 px-4 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
                style={{ backgroundColor: themeConfig.primary, boxShadow: `0 10px 20px -5px ${themeConfig.primary}50` }}
              >
                <Building className="w-4 h-4" />
                <span>Explore Properties</span>
              </button>
            </div>

            {/* Sample Card */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Card Component</span>
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs font-black uppercase px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${themeConfig.primary}20`, color: themeConfig.primary }}
                  >
                    Hostel & PG
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Green Valley Hostel</h4>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500">Rent</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm" style={{ color: themeConfig.primary }}>
                    ₹9,500/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Badges / Accents */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Accents & Badges</span>
              <div className="flex flex-wrap gap-2">
                <span 
                  className="px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: themeConfig.accent }}
                >
                  Hot Lead
                </span>
                <span 
                  className="px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: themeConfig.secondary }}
                >
                  Exclusive
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Theme changes are applied immediately across all dashboards (Tenant, Owner, and Admin) in real-time and saved in local storage.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
