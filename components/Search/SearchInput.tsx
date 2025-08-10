"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

type SearchProduct = {
  id: string;
  name: string;
  nameAr?: string | null;
  slug: string;
  variants: {
    id: string;
    images: {
      url: string;
      altText: string;
      altTextAr?: string | null;
    }[];
  }[];
};

type SearchCategory = {
  id: string;
  name: string;
  nameAr?: string | null;
};

type SearchResults = {
  products: SearchProduct[];
  categories: SearchCategory[];
};

export default function SearchInput({
  isSearchPage,
  onSearchComplete,
}: {
  isSearchPage: boolean;
  onSearchComplete?: () => void;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(isSearchPage);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    products: [],
    categories: [],
  });
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      onSearchComplete?.();
    }
  };

  const handleProductClick = (slug: string) => {
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(`/products/${slug}`);
    onSearchComplete?.()
  };

  const handleCategoryClick = (name: string) => {
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(`/categories/${name}`);
        onSearchComplete?.()

  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isSearchPage) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (isSearchPage) {
      setIsOpen(true);
    }
  };

  // const closeDropdown = () => {
  //   setIsOpen(false);
  // };

  // Debounced search effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length > 0) {
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
          .then((res) => res.json())
          .then((data) => setResults(data))
          .catch(() => setResults({ products: [], categories: [] }));
      } else {
        setResults({ products: [], categories: [] });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hasResults = results.products.length > 0 || results.categories.length > 0;

  const renderSearchResults = () => (
    <div 
      className={`
        ${isSearchPage 
          ? "absolute left-0 z-10 bg-white shadow-2xl backdrop-brightness-125 w-full md:w-full p-6"
          : "fixed left-0 z-10 bg-white w-screen md:w-full p-6 shadow-md md:absolute"
        } 
        flex flex-col lg:flex-row-reverse
      `}
    >
      {/* Products Section */}
      <div className="w-full sm:w-2/3 mb-5 lg:mb-0">
        <h1 className="font-light uppercase tracking-widest mb-2">
          {t("products")}
        </h1>
        {results.products.map((product) => (
          <div
            key={product.id}
            className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
            onClick={() => handleProductClick(product.slug)}
          >
            <Image
              src={product.variants[0]?.images[0]?.url.trimStart()}
              alt={
                isRTL && product.variants[0]?.images[0]?.altTextAr
                  ? product.variants[0]?.images[0]?.altTextAr
                  : product.variants[0]?.images[0]?.altText
              }
              width={80}
              height={80}
            />
            <h2 className="text-sm">
              {isRTL && product.nameAr ? product.nameAr : product.name}
            </h2>
          </div>
        ))}
      </div>

      {/* Categories Section */}
      <div className="w-full sm:w-1/3 mb-5">
        <h1 className="font-light uppercase tracking-widest mb-2">
          {t("categories")}
        </h1>
        {results.categories.map((category) => (
          <div
            key={category.id}
            className="cursor-pointer"
            onClick={() => handleCategoryClick(category.name)}
          >
            <h2 className="p-2 font-light text-sm uppercase hover:bg-gray-100">
              {(isRTL && category.nameAr ? category.nameAr : category.name)
                .split("-")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" & ")}
            </h2>
          </div>
        ))}
      </div>

      {/* Show all results link (only for non-search pages) */}
      {!isSearchPage && (
        <h1
          className="absolute left-0 bottom-0 p-3 hover:text-gray-700 hoverEffect cursor-pointer"
          onClick={handleSubmit}
        >
          {t("showAllResults")} &quot;{query}&quot; →
        </h1>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl">
      <div className="flex w-full">
        <div className="relative z-20 w-full">
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder={t("search")}
              className="w-full p-2 border focus:outline-black focus:outline-1 relative"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            <Image
              src={"/assets/172546_search_icon.svg"}
              alt={t("searchIcon")}
              width={40}
              height={10}
              className={`hover:text-gray-700 hoverEffect absolute ${
                isRTL ? "left-0" : "right-0"
              } top-1 px-2 py-1 cursor-pointer`}
              onClick={handleSubmit}
            />
          </form>
        </div>

        {/* Close button (only for search pages when dropdown is open)
        {isSearchPage && isOpen && (
          <Image
            src={"/assets/close.svg"}
            alt={t("closeIcon")}
            width={30}
            height={10}
            className="hover:text-gray-700 hoverEffect cursor-pointer"
            onClick={closeDropdown}
          />
        )} */}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && hasResults && renderSearchResults()}
    </div>
  );
}