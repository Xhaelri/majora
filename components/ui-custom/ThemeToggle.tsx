"use client";
import { useTheme } from "@/context/Theme";
import React from "react";
import Sun from "@/public/assets/sun.svg";
import Moon from "@/public/assets/moon.svg";

export default function ThemeToggle() {
  const { theme, themeToggle } = useTheme();
  return (
    <button onClick={themeToggle}>
      {theme === "light" ? (
        <Sun className="w-9 h-9 m-1" />
      ) : (
        <Moon className="w-8 h-8 m-1 " />
      )}
    </button>
  );
}
