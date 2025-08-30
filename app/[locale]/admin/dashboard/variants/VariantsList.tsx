"use client";

import {
  deleteProductVariant,
} from "@/server/admin-actions/variant-actions";
import { Prisma } from "@prisma/client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAllProductVariants } from "@/server/db-actions/variant-actions";
import { Button } from "@/components/ui/button";

type ProductVariantWithProduct = Prisma.ProductVariantGetPayload<{
  include: {
    product: {
      select: {
        id: true;
        name: true;
        slug: true;
        category: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;

const VariantsList = () => {
  const [variants, setVariants] = useState<ProductVariantWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  const router = useRouter();

  // Load variants
  useEffect(() => {
    loadVariants();
  }, []);

  const loadVariants = async () => {
    setLoading(true);
    try {
      const result = await getAllProductVariants();
      if (result.success && result.data) {
        setVariants(result.data);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to load variants",
        });
      }
    } catch (error) {
      console.error("Failed to load variants:", error);
      setMessage({
        type: "error",
        text: "Failed to load variants",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId: string, productName: string, size: string, color: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the variant "${size} - ${color}" from "${productName}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleting(variantId);
    try {
      const result = await deleteProductVariant(variantId);
      if (result.success) {
        setMessage({
          type: "success",
          text: "Variant deleted successfully!",
        });
        // Remove the deleted variant from the list
        setVariants(prev => prev.filter(variant => variant.id !== variantId));
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to delete variant",
        });
      }
    } catch (error) {
      console.error("Delete variant error:", error);
      setMessage({
        type: "error",
        text: "Failed to delete variant",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (variantId: string) => {
    router.push(`/admin/variants/edit/${variantId}`);
  };



  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-gray-600">Loading variants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Product Variants</h1>
          <p className="text-gray-600 mt-1">
            Manage product variants - sizes, colors, and stock levels
          </p>
        </div>

      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{variants.length}</div>
            <div className="text-sm text-gray-600">Total Variants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {variants.filter(v => v.stock > 0).length}
            </div>
            <div className="text-sm text-gray-600">In Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {variants.filter(v => v.stock === 0).length}
            </div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Variants Grid */}
      {variants.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No variants found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first product variant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Variant Images */}
              <div className="p-4">
                {variant.images && variant.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {variant.images.slice(0, 4).map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`${variant.product.name} - ${variant.color}`}
                        height={40}
                        width={40}
                        className="w-full h-20 object-cover rounded-md border"
                      />
                    ))}
                    {variant.images.length > 4 && (
                      <div className="w-full h-20 bg-gray-100 rounded-md border flex items-center justify-center text-gray-500 text-sm">
                        +{variant.images.length - 4} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-20 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400 mb-3">
                    No Images
                  </div>
                )}

                {/* Product Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {variant.product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {variant.product.category?.name || "No category"}
                  </p>
                </div>

                {/* Variant Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Size:</span>
                    <span className="font-medium">{variant.size}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Color:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{variant.color}</span>
                      {variant.colorHex && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span
                      className={`font-medium ${
                        variant.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {variant.stock}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                  variant={"secondary"}
                    onClick={() => handleEdit(variant.id)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </Button>
                  
                  <Button
                  variant={"destructive"}
                    onClick={() => handleDelete(
                      variant.id, 
                      variant.product.name, 
                      variant.size, 
                      variant.color
                    )}
                    disabled={deleting === variant.id}
                  >
                    {deleting === variant.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                    {deleting === variant.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantsList;





