"use client";
import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import CartIcon from "./CartIcon";
import UserIcon from "./UserIcon";
import LanguageSelector from "../ui-custom/Languages";

export default function Header({ searchBar }: { searchBar: React.ReactNode }) {
  const [headerState, setHeaderState] = useState("visible");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY < 80) {
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
      "w-full bg-background z-50 border-b border-gray-200 py-3";

    switch (headerState) {
      case "visible":
        return `${baseClasses} relative `;
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
      <div className="container grid grid-cols-[1fr_1fr] md:grid-cols-[1fr_1fr_1fr] items-center text-primary">
        {/*// uncomment after implementing the header menue */}
        {/* <HeaderMenu /> */}

        <div className="flex items-center gap-2 ">
          <MobileMenu />
          <div className="md:hidden">
            <Logo>Majora</Logo>
          </div>
        </div>

        <div className="hidden md:flex justify-center">
          <Logo>Majora</Logo>
        </div>

        <div className="flex justify-end">
          <div className="flex gap-3 items-center">
            {searchBar}
            <UserIcon />
            {/* <WhishList /> */}
            <CartIcon />
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
