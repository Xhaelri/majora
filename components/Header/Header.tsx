"use client";
import React, { useEffect, useState } from "react";
import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import WhishList from "./WhishList";
import UserIcon from "./UserIcon";

export default function Header() {
  const [headerState, setHeaderState] = useState("visible");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 80) {
        // Add a small delay when transitioning from opening to visible
        if (headerState === "opening") {
          setTimeout(() => setHeaderState("visible"), 100);
        } else {
          setHeaderState("visible");
        }
      } else if (currentY >= 80 && currentY < 300) {
        setHeaderState("stuck");
      } else if (currentY >= 300) {
        if (headerState !== "opening") {
          setHeaderState("opening");
        }
      }

      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, headerState]);

  const getHeaderClasses = () => {
    const baseClasses =
      "w-full bg-background shadow-md z-50 border-b border-gray-200 py-5";

    switch (headerState) {
      case "visible":
        return `${baseClasses} relative transition-all duration-300 ease-out`;
      case "stuck":
        return `${baseClasses} fixed top-0 left-0 -translate-y-full transition-none`;
      case "opening":
        return `${baseClasses} fixed top-0 left-0 translate-y-0 transition-transform duration-[700ms] ease-[cubic-bezier(0.165,0.84,0.44,1)]`;
      default:
        return baseClasses;
    }
  };

  return (
    <header className={getHeaderClasses()}>
      <div className="container h-14 grid grid-cols-[1fr_1fr_1fr] items-center justify-between text-primary">
        <div className="text-left flex gap-2 lg:hidden">
          <MobileMenu />
          <SearchBar />
        </div>
        <div className="text-center lg:text-left">
          <Logo>Sekra</Logo>
        </div>
        <HeaderMenu />
        <div className="text-right flex justify-end">
          <div className="flex gap-2">
            <UserIcon />
            <WhishList />
            <div className="hidden lg:inline-flex">
              <SearchBar />
            </div>
            <CartIcon />
          </div>
        </div>
      </div>
    </header>
  );
}