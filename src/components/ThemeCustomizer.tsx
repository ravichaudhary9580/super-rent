"use client";

import React, { useState } from "react";
import { Palette, X, RotateCcw, Moon, Sun, Check, ZoomIn } from "lucide-react";
import { useTheme, PRESET_THEMES, ThemePreset } from "./ThemeProvider";

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const { themeConfig, setPreset, setCustomColors, setScale, toggleDarkMode, resetTheme } = useTheme();

  return (
    <>
      {/* Floating Theme Widget Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-slate-700/50 group"
        title="Customize Theme & Display Size"
        aria-label="Open Theme Customizer"
      >
        <div className="relative">
          <Palette className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-45 transition-transform duration-300" style={{ color: themeConfig.primary }} />
          <span
            className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: themeConfig.accent }}
          />
        </div>
        <span className="text-xs font-bold tracking-wide hidden sm:inline">Theme Colors</span>
      </button>

      {/* Backdrop & Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-5 sm:p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-right duration-300">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                    style={{ backgroundColor: `${themeConfig.primary}20`, color: themeConfig.primary }}
                  >
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      Dynamic Theme Studio
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Personalize colors & dashboard sizing in real-time</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dashboard Size Scale Selector (10% Smaller Default) */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Portal & App Display Size</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {themeConfig.scale === 0.9 ? "Compact (10% Smaller - Active)" : themeConfig.scale === 0.8 ? "Mini (20% Smaller)" : "Standard (100%)"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: "80% (Mini)", val: 0.8 },
                    { label: "90% (10% Smaller)", val: 0.9 },
                    { label: "100% (Standard)", val: 1.0 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setScale(item.val)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                        themeConfig.scale === item.val
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md ring-2 ring-slate-900/10"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Light / Dark Mode Toggle */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white dark:bg-slate-700 rounded-xl text-slate-700 dark:text-amber-400 shadow-sm">
                    {themeConfig.isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Appearance Mode</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {themeConfig.isDark ? "Dark Theme Active" : "Light Theme Active"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={toggleDarkMode}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                    themeConfig.isDark
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {themeConfig.isDark ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              {/* Preset Color Themes */}
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Curated Color Presets</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {(Object.keys(PRESET_THEMES) as Array<Exclude<ThemePreset, "custom">>).map((key) => {
                    const preset = PRESET_THEMES[key];
                    const isSelected = themeConfig.preset === key;

                    return (
                      <button
                        key={key}
                        onClick={() => setPreset(key)}
                        className={`group relative p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 ${
                          isSelected
                            ? "border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20 bg-slate-50 dark:bg-slate-800"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {preset.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-slate-900 dark:text-white" />}
                        </div>

                        {/* Color Swatch Circles */}
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

              {/* Custom Color Pickers */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Custom Color Fine-Tuning</h3>
                
                {/* Primary Color Picker */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={themeConfig.primary}
                      onChange={(e) => setCustomColors({ primary: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Primary Color</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{themeConfig.primary}</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={themeConfig.primary}
                    onChange={(e) => setCustomColors({ primary: e.target.value })}
                    className="w-20 px-2 py-1 text-xs font-mono text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg uppercase font-bold text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Secondary Color Picker */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={themeConfig.secondary}
                      onChange={(e) => setCustomColors({ secondary: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Secondary Color</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{themeConfig.secondary}</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={themeConfig.secondary}
                    onChange={(e) => setCustomColors({ secondary: e.target.value })}
                    className="w-20 px-2 py-1 text-xs font-mono text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg uppercase font-bold text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Accent Color Picker */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={themeConfig.accent}
                      onChange={(e) => setCustomColors({ accent: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Accent Highlight</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{themeConfig.accent}</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={themeConfig.accent}
                    onChange={(e) => setCustomColors({ accent: e.target.value })}
                    className="w-20 px-2 py-1 text-xs font-mono text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg uppercase font-bold text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={resetTheme}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: themeConfig.primary }}
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
