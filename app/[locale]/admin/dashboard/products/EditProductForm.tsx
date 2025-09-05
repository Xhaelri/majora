"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import {
  updateProduct,
  UpdateProductData,
} from "@/server/admin-actions/product-actions";
import { getCategories } from "@/server/db-actions/category-actions";
import { FullProduct } from "@/types/product-types";

interface EditProductFormProps {
  product: FullProduct;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditProductForm({
  product,
  onSuccess,
  onCancel,
}: EditProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<UpdateProductData>({
    id: product.id,
    name: product.name,
    nameAr: product.nameAr || "",
    description: product.description || "",
    descriptionAr: product.descriptionAr || "",
    price: product.price,
    salePrice: product.salePrice || undefined,
    isAvailable: product.isAvailable,
    isLimitedEdition: product.isLimitedEdition,
    categoryId: product.categoryId || undefined,
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await updateProduct(product.id, formData);

      if (result.success) {
        setMessage({ type: "success", text: "Product updated successfully!" });
        setTimeout(onSuccess, 1000);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update product",
        });
      }
    } catch (error) {
      console.error("Update product error:", error);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value === ""
            ? undefined
            : parseFloat(value)
          : value || undefined,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="nameAr"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name (Arabic)
            </label>
            <input
              type="text"
              id="nameAr"
              name="nameAr"
              value={formData.nameAr || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="rtl"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="descriptionAr"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Arabic)
            </label>
            <textarea
              id="descriptionAr"
              name="descriptionAr"
              rows={4}
              value={formData.descriptionAr || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="rtl"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="salePrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sale Price
            </label>
            <input
              type="number"
              id="salePrice"
              name="salePrice"
              min="0"
              step="0.01"
              value={formData.salePrice || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId || ""}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
              Available
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isLimitedEdition"
              name="isLimitedEdition"
              checked={formData.isLimitedEdition}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isLimitedEdition"
              className="ml-2 text-sm text-gray-700"
            >
              Limited Edition
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
