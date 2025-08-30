"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useClientSearch } from "@/hooks/useSearch";
import SearchPageInput from "./ClientSearchInput";
import ClientSortDropdown from "./ClientSortDropdown";
import CardGrid from "@/components/ui-custom/CardGrid";
import ClientFilterList from "./ClientFilterList";
import ClientFilterOptions from "./ClientFilterOptions";
import type {
  Category,
} from "@prisma/client";
import { FullProduct } from "@/types/product-types";

// Extended types with relations


type Props = {
  initialQuery: string;
  products: FullProduct[];
  categories: Category[];
};

export default function ClientSearchPage({
  initialQuery,
  products,
  categories,
}: Props) {
  const t = useTranslations("common");

  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    sortBy,
    setSortBy,
    filteredProducts,
    clearFilters,
    totalProducts,
    filteredCount,
  } = useClientSearch(products);

  // Set initial query
  React.useEffect(() => {
    if (initialQuery && !searchQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery, searchQuery, setSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <section className="flex flex-col items-center m-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-light mb-6 text-center">
          {searchQuery ? (
            <>
              {t("searchResults")} &quot;{searchQuery}&quot;
            </>
          ) : (
            t("allProducts") || "All Products"
          )}
        </h1>

        <div className="mb-8">
          <SearchPageInput
            products={products}
            categories={categories}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex justify-center items-center h-[50vh] w-full">
            <div className="text-center">
              <p className="text-gray-500 text-xl mb-4">
                {searchQuery
                  ? t("noProductsFound") || "No products found"
                  : t("noProducts") || "No products available"}
              </p>
              {(filters.availability ||
                filters.priceRange ||
                (filters.categories && filters.categories.length > 0)) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors"
                >
                  {t("clearFilters") || "Clear Filters"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 w-full">
            {/* Filter Bar */}
            <div className="flex items-center justify-between">
              <ClientFilterList
                filters={filters}
                onUpdateFilter={updateFilter}
                categories={categories}
                resultCount={filteredCount}
                totalCount={totalProducts}
              />
              <ClientSortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            </div>

            <div className="flex gap-6">
              {/* Desktop Filters */}
              <aside className="hidden lg:block w-80 flex-shrink-0">
                <ClientFilterOptions
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  categories={categories}
                />
              </aside>

              {/* Product Grid */}
              <main className="flex-1">
                <CardGrid products={filteredProducts} isProductsPage={true} />
              </main>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}