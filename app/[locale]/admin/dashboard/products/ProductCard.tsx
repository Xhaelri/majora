// components/admin/products/ProductCard.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { deleteProduct } from "@/server/admin-actions/product-actions";
import ReusableDialog from "@/components/ui-custom/ReusableDialog";
import EditProductForm from "./EditProductForm";
import CreateVariantForm from "./CreateVariantForm";
import { FullProduct } from "@/types/product-types";

interface ProductCardProps {
  product: FullProduct;
  onProductUpdated: () => void;
}

export default function ProductCard({ product, onProductUpdated }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => setEditDialogOpen(true);
  const handleAddVariants = () => setVariantDialogOpen(true);
  const handleDelete = () => setDeleteDialogOpen(true);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProduct(product.id);
      if (result.success) {
        setDeleteDialogOpen(false);
        onProductUpdated();
      } else {
        console.error("Delete failed:", result.error);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccess = () => {
    setEditDialogOpen(false);
    setVariantDialogOpen(false);
    onProductUpdated();
  };

  // Get first available image from variants
  const firstImage = product.variants.find(
    (variant) => variant.images.length > 0
  )?.images[0];

  // Calculate total stock across all variants
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.stock,
    0
  );

  // Get unique colors and sizes
  const availableColors = [
    ...new Map(
      product.variants
        .filter((v) => v.color)
        .map((v) => [v.color, { name: v.color, hex: v.colorHex }])
    ).values(),
  ];
  
  const availableSizes = [
    ...new Set(product.variants.filter((v) => v.size).map((v) => v.size)),
  ];

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100">
          {firstImage && !imageError ? (
            <Image
              src={firstImage}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!product.isAvailable && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                Unavailable
              </span>
            )}
            {product.isLimitedEdition && (
              <span className="px-2 py-1 bg-purple-500 text-white text-xs font-medium rounded">
                Limited
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                Sale
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button
              onClick={handleEdit}
              className="p-1.5 bg-blue-500 text-white hover:bg-blue-600 transition-colors rounded shadow-sm"
              title="Edit Product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>

            <button
              onClick={handleAddVariants}
              className="p-1.5 bg-green-500 text-white hover:bg-green-600 transition-colors rounded shadow-sm"
              title="Add Variants"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-500 text-white hover:bg-red-600 transition-colors rounded shadow-sm"
              title="Delete Product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
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
                      style={{ backgroundColor: color.hex || "#ccc" }}
                      title={color.name || undefined}
                    />
                  ))}
                  {availableColors.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{availableColors.length - 4}
                    </span>
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
                    <span className="text-xs text-gray-500">
                      +{availableSizes.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Stock and Variants Count */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Stock: {totalStock}</span>
              <span className="text-gray-500">
                {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <ReusableDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Product"
        description="Update the product details below."
      >
        <EditProductForm
          product={product}
          onSuccess={handleSuccess}
          onCancel={() => setEditDialogOpen(false)}
        />
      </ReusableDialog>

      {/* Add Variants Dialog */}
      <ReusableDialog
        open={variantDialogOpen}
        onOpenChange={setVariantDialogOpen}
        title="Add New Variant"
        description="Create a new variant for this product."
      >
        <CreateVariantForm
          productId={product.id}
          onSuccess={handleSuccess}
          onCancel={() => setVariantDialogOpen(false)}
        />
      </ReusableDialog>

      {/* Delete Confirmation Dialog */}
      <ReusableDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone and will also delete all associated variants.`}
      >
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setDeleteDialogOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </ReusableDialog>
    </>
  );
}
