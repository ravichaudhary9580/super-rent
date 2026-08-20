"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemePreset = "ocean" | "emerald" | "sunset" | "purple" | "rose" | "cyber" | "amber" | "custom";

export interface ColorConfig {
  preset: ThemePreset;
  primary: string;
  secondary: string;
  accent: string;
  isDark: boolean;
  scale: number; 
}

export const PRESET_THEMES: Record<Exclude<ThemePreset, "custom">, { name: string; colors: { primary: string; secondary: string; accent: string } }> = {
  ocean: {
    name: "Ocean Royal",
    colors: { primary: "#2563eb", secondary: "#4f46e5", accent: "#f59e0b" },
  },
  emerald: {
    name: "Emerald Mint",
    colors: { primary: "#059669", secondary: "#0d9488", accent: "#f59e0b" },
  },
  sunset: {
    name: "Sunset Amber",
    colors: { primary: "#ea580c", secondary: "#d97706", accent: "#3b82f6" },
  },
  purple: {
    name: "Midnight Purple",
    colors: { primary: "#9333ea", secondary: "#7c3aed", accent: "#ec4899" },
  },
  rose: {
    name: "Rose Quartz",
    colors: { primary: "#e11d48", secondary: "#db2777", accent: "#8b5cf6" },
  },
  cyber: {
    name: "Cyber Neon",
    colors: { primary: "#06b6d4", secondary: "#3b82f6", accent: "#f43f5e" },
  },
  amber: {
    name: "Warm Gold",
    colors: { primary: "#d97706", secondary: "#b45309", accent: "#10b981" },
  },
};

interface ThemeContextType {
  themeConfig: ColorConfig;
  setPreset: (preset: Exclude<ThemePreset, "custom">) => void;
  setCustomColors: (colors: Partial<{ primary: string; secondary: string; accent: string }>) => void;
  setScale: (scale: number) => void;
  toggleDarkMode: () => void;
  resetTheme: () => void;
}

const DEFAULT_CONFIG: ColorConfig = {
  preset: "ocean",
  primary: "#2563eb",
  secondary: "#4f46e5",
  accent: "#f59e0b",
  isDark: false,
  scale: 0.9, // Default: 90% (10% smaller)
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to generate lighter and darker shades from a hex color
function hexToRgb(hex: string) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function shadeColor(hex: string, percent: number) {
  try {
    const { r, g, b } = hexToRgb(hex);
    const adjust = (val: number) => Math.max(0, Math.min(255, Math.round(val + (val * percent) / 100)));
    const rHex = adjust(r).toString(16).padStart(2, "0");
    const gHex = adjust(g).toString(16).padStart(2, "0");
    const bHex = adjust(b).toString(16).padStart(2, "0");
    return `#${rHex}${gHex}${bHex}`;
  } catch (e) {
    return hex;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeConfig, setThemeConfig] = useState<ColorConfig>(DEFAULT_CONFIG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("superrent_theme_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setThemeConfig({ ...DEFAULT_CONFIG, ...parsed, scale: parsed.scale ?? 0.9 });
      }
    } catch (e) {
      console.error("Failed to load theme config from localStorage", e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem("superrent_theme_config", JSON.stringify(themeConfig));
    } catch (e) {
      console.error("Failed to save theme config to localStorage", e);
    }

    const root = document.documentElement;

    const { r: pr, g: pg, b: pb } = hexToRgb(themeConfig.primary);
    const { r: sr, g: sg, b: sb } = hexToRgb(themeConfig.secondary);
    const { r: ar, g: ag, b: ab } = hexToRgb(themeConfig.accent);

    const primaryHover = shadeColor(themeConfig.primary, -15);
    const primaryActive = shadeColor(themeConfig.primary, -25);
    const primaryLight = `rgba(${pr}, ${pg}, ${pb}, 0.1)`;
    const primaryTonal = `rgba(${pr}, ${pg}, ${pb}, 0.2)`;

    const secondaryHover = shadeColor(themeConfig.secondary, -15);
    const secondaryLight = `rgba(${sr}, ${sg}, ${sb}, 0.1)`;

    const accentHover = shadeColor(themeConfig.accent, -15);
    const accentLight = `rgba(${ar}, ${ag}, ${ab}, 0.1)`;

    root.style.setProperty("--color-primary", themeConfig.primary);
    root.style.setProperty("--color-primary-rgb", `${pr}, ${pg}, ${pb}`);
    root.style.setProperty("--color-primary-hover", primaryHover);
    root.style.setProperty("--color-primary-active", primaryActive);
    root.style.setProperty("--color-primary-light", primaryLight);
    root.style.setProperty("--color-primary-tonal", primaryTonal);

    root.style.setProperty("--color-secondary", themeConfig.secondary);
    root.style.setProperty("--color-secondary-rgb", `${sr}, ${sg}, ${sb}`);
    root.style.setProperty("--color-secondary-hover", secondaryHover);
    root.style.setProperty("--color-secondary-light", secondaryLight);

    root.style.setProperty("--color-accent", themeConfig.accent);
    root.style.setProperty("--color-accent-rgb", `${ar}, ${ag}, ${ab}`);
    root.style.setProperty("--color-accent-hover", accentHover);
    root.style.setProperty("--color-accent-light", accentLight);
    root.style.setProperty("--dashboard-zoom", (themeConfig.scale || 0.9).toString());

    if (themeConfig.isDark) {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
      if (document.body) {
        document.body.setAttribute("data-theme", "dark");
        document.body.classList.add("dark");
      }
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
      if (document.body) {
        document.body.removeAttribute("data-theme");
        document.body.classList.remove("dark");
      }
    }
  }, [themeConfig, mounted]);

  const setPreset = (presetKey: Exclude<ThemePreset, "custom">) => {
    const preset = PRESET_THEMES[presetKey];
    if (preset) {
      setThemeConfig((prev) => ({
        ...prev,
        preset: presetKey,
        primary: preset.colors.primary,
        secondary: preset.colors.secondary,
        accent: preset.colors.accent,
      }));
    }
  };

  const setCustomColors = (colors: Partial<{ primary: string; secondary: string; accent: string }>) => {
    setThemeConfig((prev) => ({
      ...prev,
      preset: "custom",
      ...colors,
    }));
  };

  const setScale = (scale: number) => {
    setThemeConfig((prev) => ({
      ...prev,
      scale,
    }));
  };

  const toggleDarkMode = () => {
    setThemeConfig((prev) => ({
      ...prev,
      isDark: !prev.isDark,
    }));
  };

  const resetTheme = () => {
    setThemeConfig(DEFAULT_CONFIG);
  };

  return (
    <ThemeContext.Provider value={{ themeConfig, setPreset, setCustomColors, setScale, toggleDarkMode, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
