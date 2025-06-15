import { SearchIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const handleclick = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
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

  const dropdownTopOffset = "80px";

  return (
    <>
      <div className="relative group h-full flex items-center" ref={searchRef}>
        <div>
          <SearchIcon
            size={32}
            strokeWidth={1}
            className="w-7 h-7 hover:text-green-900 hoverEffect"
            onClick={handleclick}
          />
        </div>

        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="fixed h-[100px] left-0 right-0 z-40 bg-white shadow-[0px_250px_200px_100px_rgba(1,_0,_0,_0.6)] border-b border-gray-200 py-6 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 "
              style={{ top: dropdownTopOffset }}
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex">
                <input
                  type="text"
                  className="w-[300px] border-2 border-gray-400"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
