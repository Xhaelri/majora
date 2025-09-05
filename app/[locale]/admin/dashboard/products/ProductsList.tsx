"use client";

import React, { useState, useEffect } from "react";
import { getProducts, ProductFilters } from "@/server/db-actions/product-actions";
import ProductCard from "./ProductCard";
import { FullProduct } from "@/types/product-types";

interface ProductsListProps {
  initialFilters?: ProductFilters;
}

export default function ProductsList({ initialFilters = {} }: ProductsListProps) {
  const [products, setProducts] = useState<FullProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12,
  });

  const loadProducts = async (filters: ProductFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProducts({ ...initialFilters, ...filters });

      if (result.success && result.data) {
        setProducts(result.data.products);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || "Failed to load products");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Load products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handlePageChange = (page: number) => {
    loadProducts({ ...initialFilters, page });
  };

  const handleProductUpdated = () => {
    loadProducts({ ...initialFilters, page: pagination.currentPage });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadProducts()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <div className="text-gray-400 text-4xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">No products match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductUpdated={handleProductUpdated}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.currentPage
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Products Count */}
      <div className="text-center text-sm text-gray-600">
        Showing {products.length} of {pagination.totalCount} products
      </div>
    </div>
  );
}