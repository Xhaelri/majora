// hooks/useSearch.ts
"use client";

import { useState, useMemo, useCallback } from "react";
import { useLocale } from "next-intl";
import { FullProduct } from "@/types/product-types";

// Extended types with relations

// Filter types
export type FilterOptions = {
  availability?: "in-stock" | "out-of-stock";
  priceRange?: { from: number; to: number };
  categories?: string[];
};

// Sort options
export type SortOption = 
  | "featured" 
  | "name-asc" 
  | "name-desc" 
  | "price-asc" 
  | "price-desc" 
  | "date-desc" 
  | "date-asc";

export function useClientSearch(products: FullProduct[]) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  // Update filter function
  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setSortBy("featured");
  }, []);

  // Check if product is in stock
  const isProductInStock = useCallback((product: FullProduct) => {
    return product.variants.some(variant => variant.stock > 0);
  }, []);

  // Filter products based on search query and filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search query filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          product.name.toLowerCase().includes(lowerQuery) ||
          (product.nameAr && product.nameAr.toLowerCase().includes(lowerQuery)) ||
          (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
          (product.descriptionAr && product.descriptionAr.toLowerCase().includes(lowerQuery)) ||
          (product.category?.name.toLowerCase().includes(lowerQuery)) ||
          (product.category?.nameAr && product.category.nameAr.toLowerCase().includes(lowerQuery))
        );
      });
    }

    // Apply availability filter
    if (filters.availability) {
      filtered = filtered.filter(product => {
        const inStock = isProductInStock(product);
        return filters.availability === "in-stock" ? inStock : !inStock;
      });
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.salePrice || product.price;
        return price >= filters.priceRange!.from && price <= filters.priceRange!.to;
      });
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        product.categoryId && filters.categories!.includes(product.categoryId)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          const nameA = isRTL && a.nameAr ? a.nameAr : a.name;
          const nameB = isRTL && b.nameAr ? b.nameAr : b.name;
          return nameA.localeCompare(nameB);
        
        case "name-desc":
          const nameDescA = isRTL && a.nameAr ? a.nameAr : a.name;
          const nameDescB = isRTL && b.nameAr ? b.nameAr : b.name;
          return nameDescB.localeCompare(nameDescA);
        
        case "price-asc":
          const priceA = a.salePrice || a.price;
          const priceB = b.salePrice || b.price;
          return priceA - priceB;
        
        case "price-desc":
          const priceDescA = a.salePrice || a.price;
          const priceDescB = b.salePrice || b.price;
          return priceDescB - priceDescA;
        
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        
        case "featured":
        default:
          // Featured sorting: limited edition first, then by availability, then by date
          const aFeatured = a.isLimitedEdition ? 1 : 0;
          const bFeatured = b.isLimitedEdition ? 1 : 0;
          if (aFeatured !== bFeatured) {
            return bFeatured - aFeatured;
          }
          
          const aInStock = isProductInStock(a) ? 1 : 0;
          const bInStock = isProductInStock(b) ? 1 : 0;
          if (aInStock !== bInStock) {
            return bInStock - aInStock;
          }
          
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [products, searchQuery, filters, sortBy, isRTL, isProductInStock]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    sortBy,
    setSortBy,
    filteredProducts,
    clearFilters,
    totalProducts: products.length,
    filteredCount: filteredProducts.length,
  };
}