"use client";

import React, { useState, useEffect } from 'react';
import { Prisma } from '@prisma/client';
import { getProducts, ProductFilters } from '@/server/db-actions/product-actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Type for product with includes (matching your getProducts include)
type ProductWithIncludes = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: true;
  };
}>;

interface ProductsGridProps {
  initialFilters?: ProductFilters;
}

interface ProductCardProps {
  product: ProductWithIncludes;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onAddVariants: (productId: string) => void;
}

// Product Card Component
const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, onAddVariants }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get first available image from variants
  const firstImage = product.variants
    .find(variant => variant.images.length > 0)?.images[0];
  
  // Calculate total stock across all variants
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  
  // Get unique colors and sizes
  const availableColors = [...new Set(
    product.variants
      .filter(v => v.color)
      .map(v => ({ name: v.color, hex: v.colorHex }))
  )];
  const availableSizes = [...new Set(
    product.variants
      .filter(v => v.size)
      .map(v => v.size)
  )];

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className="bg-white  border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100">
        {firstImage && !imageError ? (
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!product.isAvailable && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium ">
              Unavailable
            </span>
          )}
          {product.isLimitedEdition && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium ">
              Limited
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-1 bg-black text-white text-xs font-medium ">
              Sale
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={() => onEdit(product.id)}
            className="p-1.5 bg-blue-500 text-white  hover:bg-blue-600 transition-colors shadow-sm"
            title="Edit Product"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
          
          <button
            onClick={() => onAddVariants(product.id)}
            className="p-1.5 bg-green-500 text-white  hover:bg-green-600 transition-colors shadow-sm"
            title="Add Variants"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 bg-red-500 text-white  hover:bg-red-600 transition-colors shadow-sm"
            title="Delete Product"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>

        {/* Stock indicator */}
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
           EGP {displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
             EGP {product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Variants Info */}
        <div className="space-y-2">
          {/* Colors */}
          {availableColors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Colors:</span>
              <div className="flex gap-1">
                {availableColors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex || '#ccc' }}
                    title={color.name || undefined}
                  />
                ))}
                {availableColors.length > 4 && (
                  <span className="text-xs text-gray-500">+{availableColors.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {/* Sizes */}
          {availableSizes.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Sizes:</span>
              <div className="flex gap-1 flex-wrap">
                {availableSizes.slice(0, 3).map((size, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {size}
                  </span>
                ))}
                {availableSizes.length > 3 && (
                  <span className="text-xs text-gray-500">+{availableSizes.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* Stock and Variants Count */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Stock: {totalStock}</span>
            <span className="text-gray-500">
              {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Products Grid Component
const ProductList: React.FC<ProductsGridProps> = ({ initialFilters = {} }) => {
  const [products, setProducts] = useState<ProductWithIncludes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 12
  });

  const router = useRouter();

  const loadProducts = async (filters: ProductFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getProducts({ ...initialFilters, ...filters });
      
      if (result.success && result.data) {
        setProducts(result.data.products);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'Failed to load products');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Load products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEdit = (productId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', productId);
    // Navigate to edit page or open edit modal
  };

  const handleDelete = (productId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete product:', productId);
    // Show confirmation dialog then delete
  };

  const handleAddVariants = (productId: string) => {
    // Navigate to the variants creation page with the product ID as a query parameter
    router.push(`/admin/dashboard/variants?productId=${productId}`);
  };

  const handlePageChange = (page: number) => {
    loadProducts({ ...initialFilters, page });
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddVariants={handleAddVariants}
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
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
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
};

export default ProductList;


