"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemContextProviderProps = {
  children: React.ReactNode;
};
type Theme = "light" | "dark" | string;
type ThemeContext = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  themeToggle: () => void;
};

const ThemeContext = createContext<ThemeContext | null>(null);

export default function ThemeContextProvider({
  children,
}: ThemContextProviderProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const current = stored || (prefersDark ? "dark" : "light");

    setTheme(current);
    root.classList.remove("light", "dark");
    root.classList.add(current);
  }, []);

  const themeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);

    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeToggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemContextProvider");
  }
  return context;
}
