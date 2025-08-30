"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Category } from "@prisma/client";
import { FullProduct } from "@/types/product-types";

type Props = {
  products: FullProduct[];
  categories: Category[];
};

export default function HeaderSearchBar({ products, categories }: Props) {
  const t = useTranslations("common");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const router = useRouter();

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
          .slice(0, 5) // Limit to 5 results for dropdown
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
          .slice(0, 3) // Limit to 3 categories
      : [];

  const hasResults =
    filteredProducts.length > 0 || filteredCategories.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      closeButtonRef.current?.click();
    }
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setIsOpen(false);
    closeButtonRef.current?.click();
  };

  const handleCategoryClick = (name: string) => {
    router.push(`/categories/${name}`);
    setIsOpen(false);
    closeButtonRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowResults(newQuery.trim().length > 0);
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setShowResults(true);
    }
  };

  // Click outside handler for results dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showResults]);

  // Reset state when dialog opens
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setQuery("");
      setShowResults(false);
      // Focus input after dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setShowResults(false);
    }
  };

  const renderSearchResults = () => (
    <div className="absolute top-full left-0 right-0 z-50 bg-white shadow-lg border border-gray-200 max-h-96 overflow-y-auto ">
      <div className="p-4 sm:p-6">
        {/* Products Section */}
        {filteredProducts.length > 0 && (
          <div className="mb-4">
            <h3 className="font-light uppercase tracking-widest mb-3 text-sm text-gray-600">
              {t("products") || "Products"}
            </h3>
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded transition-colors"
                  onClick={() => handleProductClick(product.slug)}
                >
                  {product.variants[0]?.images[0] ? (
                    <Image
                      src={product.variants[0].images[0].trimStart()}
                      alt={
                        isRTL && product.name
                          ? product.name
                          : product.nameAr || product.name
                      }
                      width={40}
                      height={40}
                      className="object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {isRTL && product.nameAr ? product.nameAr : product.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      EGP {product.salePrice || product.price}
                      {product.salePrice && (
                        <span className="ml-1 line-through text-gray-400">
                          EGP {product.price}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        {filteredCategories.length > 0 && (
          <div className="mb-4">
            <h3 className="font-light uppercase tracking-widest mb-3 text-sm text-gray-600">
              {t("categories") || "Categories"}
            </h3>
            <div className="space-y-1">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="cursor-pointer p-2 hover:bg-gray-50 rounded"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <span className="text-sm">
                    {(isRTL && category.nameAr
                      ? category.nameAr
                      : category.name
                    )
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" & ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show all results */}
        {query.trim() && (
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              className="text-sm text-black hover:text-black/60 cursor-pointer hover:underline"
              type="button"
            >
              {t("showAllResults") || "Show all results"} &quot;{query}&quot; →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative group h-full flex items-center">
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="cursor-pointer hover:opacity-70 transition-opacity"
            aria-label="Open search"
          >
            <Image
              src={"/assets/172546_search_icon.svg"}
              alt="Search-icon"
              width={20}
              height={20}
              className="hover:text-gray-700 hoverEffect"
            />
          </button>
        </DialogTrigger>

        <DialogContent
          showCloseButton={false}
          className="fixed top-0 mt-10 max-w-none w-screen rounded-none shadow-none z-50 border-b bg-white p-0"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Search Products</DialogTitle>
          </DialogHeader>

          <div className="w-full px-4  py-4">
            <div className="flex items-center justify-center max-w-7xl mx-auto gap-4">
              <div ref={containerRef} className="relative flex-1 min-w-0">
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t("search") || "Search products..."}
                    className="w-full py-3 px-4 pr-12 border border-gray-300 focus:outline-none focus:border-black text-base bg-white "
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                  />
                  <button
                    type="submit"
                    className={`absolute ${
                      isRTL ? "left-3" : "right-3"
                    } top-1/2 -translate-y-1/2  hover:opacity-70 transition-opacity`}
                  >
                    <Image
                      src="/assets/172546_search_icon.svg"
                      alt={t("searchIcon") || "Search"}
                      width={20}
                      height={20}
                      className="hover:text-gray-700 hoverEffect"
                    />
                  </button>
                </form>

                {/* Search Results Dropdown */}
                {showResults && hasResults && renderSearchResults()}
              </div>

              <DialogClose asChild>
                <button
                  type="button"
                  className="flex-shrink-0  hover:opacity-70 transition-opacity rounded"
                  ref={closeButtonRef}
                  aria-label="Close search"
                >
                  <Image
                    src={"/assets/close.svg"}
                    alt="Close"
                    width={24}
                    height={24}
                    className="hover:text-gray-700 hoverEffect"
                  />
                </button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
