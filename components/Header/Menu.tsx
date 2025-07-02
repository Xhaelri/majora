"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "../Link/Link";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
type HeaderItem = {
  href: string;
  title: string;
};

export function Menu({ title }: HeaderItem) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // const handleMouseEnter = () => setIsOpen(true);
  // const handleMouseLeave = () => setIsOpen(false);
  const handleclick = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };


    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const dropdownTopOffset = "50px";

  return (
    <div
      ref={menuRef}
      className="relative group h-full flex items-center "
      // onMouseEnter={handleMouseEnter}
      // onMouseLeave={handleMouseLeave}
      onClick={handleclick}
    >
      <div className="inline-flex h-0 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm xl:text-lg font-light hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer transition-colors duration-200">
        {title}
        <ChevronDownIcon
          className={`relative top-[1px] ml-1 size-3 transition duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </div>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 right-0 z-40 bg-background shadow-[0px_250px_200px_100px_rgba(1,_0,_0,_0.6)]  py-6 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 "
            style={{ top: dropdownTopOffset }}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ul className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
                <div className="flex flex-col gap-2">
                  <div className="font-semibold text-primary text-base mb-2">
                    Category
                  </div>
                  <ListItem href="#" title="Shop All" />
                  <ListItem href="#" title="Blouses & Top" />
                  <ListItem href="#" title="Pants" />
                  <ListItem href="#" title="Dresses & Jumpsuits" />
                  <ListItem href="#" title="Outwear & Jackets" />
                  <ListItem href="#" title="Pullovers" />
                  <ListItem href="#" title="Tees" />
                  <ListItem href="#" title="Shorts & Skirts" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="font-semibold text-primary text-base mb-2">
                    Featured
                  </div>
                  <ListItem href="#" title="New In" />
                  <ListItem href="#" title="Modiweek" />
                  <ListItem href="#" title="Plus Size" />
                  <ListItem href="#" title="Best Seller" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="font-semibold text-primary text-base mb-2">
                    More
                  </div>
                  <ListItem href="#" title="Bundles" />
                  <ListItem href="#" title="Occasion Wear" />
                  <ListItem href="#" title="Matching Set" />
                  <ListItem href="#" title="Suiting" />
                  <ListItem href="#" title="Gift Cards" />
                  <ListItem href="#" title="About Us" />
                </div>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ListItemProps = React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  title: string;
  children?: React.ReactNode;
};

const ListItem: React.FC<ListItemProps> = ({
  title,
  children,
  href,
  ...props
}) => {
  return (
    <li {...props}>
      <Link
        href={href}
        className="flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none hover:bg-background focus:bg-background focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      >
        <div className="text-sm leading-none font-medium text-primary">
          {title}
        </div>
        {children && (
          <p className="text-gray-500 line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        )}
      </Link>
    </li>
  );
};

export default ListItem;
