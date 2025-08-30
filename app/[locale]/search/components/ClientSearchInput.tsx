"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type {
  Category,

} from "@prisma/client";
import { FullProduct } from "@/types/product-types";

// Extended types with relations

type Props = {
  products: FullProduct[];
  categories: Category[];
  onSearch: (query: string) => void;
  searchQuery: string;
};

export default function SearchPageInput({
  products,
  categories,
  onSearch,
  searchQuery,
}: Props) {
  const t = useTranslations("common");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Filter products and categories based on query
  const filteredProducts =
    query.length > 0
      ? products
          .filter((product) => {
            const lowerQuery = query.toLowerCase();
            return (
              product.name.toLowerCase().includes(lowerQuery) ||
              (product.nameAr &&
                product.nameAr.toLowerCase().includes(lowerQuery)) ||
              (product.description &&
                product.description.toLowerCase().includes(lowerQuery)) ||
              (product.descriptionAr &&
                product.descriptionAr.toLowerCase().includes(lowerQuery))
            );
          })
          .slice(0, 8) // More results for search page
      : [];

  const filteredCategories =
    query.length > 0
      ? categories
          .filter((category) => {
            const lowerQuery = query.toLowerCase();
            return (
              category.name.toLowerCase().includes(lowerQuery) ||
              (category.nameAr &&
                category.nameAr.toLowerCase().includes(lowerQuery))
            );
          })
          .slice(0, 5) // More categories for search page
      : [];

  const hasResults =
    filteredProducts.length > 0 || filteredCategories.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
      // Update URL without navigation
      const url = new URL(window.location.href);
      url.searchParams.set("q", query.trim());
      window.history.replaceState({}, "", url);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowSuggestions(newQuery.trim().length > 0);
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleClearInput = () => {
    setQuery("");
    onSearch("");
    setShowSuggestions(false);
    inputRef.current?.focus();
    // Clear URL parameter
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  // Only update local query when searchQuery prop changes from external source
  useEffect(() => {
    if (!isInitialized) {
      setQuery(searchQuery);
      setIsInitialized(true);
    } else if (searchQuery !== query && document.activeElement !== inputRef.current) {
      setQuery(searchQuery);
    }
  }, [searchQuery, isInitialized, query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex flex-row-reverse">
        {query && (
          <button
            type="button"
            onClick={handleClearInput}
            className="p-1 cursor-pointer rounded-full transition-colors"
            aria-label="Clear search"
          >
            <Image
              src="/assets/close.svg"
              alt="Clear"
              width={20}
              height={20}
              className="opacity-50"
            />
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={t("search") || "Search products..."}
          className="w-full p-4 pr-20 border-2 border-gray-300 focus:outline-none focus:border-black transition-all"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />

        <div
          className={`absolute ${
            isRTL ? "left-8" : "right-8"
          } top-1/2 -translate-y-1/2 flex items-center gap-2`}
        >
          {/* Search button */}
          <button
            type="submit"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Search"
          >
            <Image
              src="/assets/172546_search_icon.svg"
              alt={t("searchIcon") || "Search"}
              width={20}
              height={20}
              className="hover:text-gray-700 hoverEffect"
            />
          </button>
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && hasResults }
    </div>
  );
}