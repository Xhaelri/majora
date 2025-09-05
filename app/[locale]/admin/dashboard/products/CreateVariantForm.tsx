"use client";

import React, { useState } from "react";
import Image from "next/image";
import { createProductVariant, CreateProductVariantData } from "@/server/admin-actions/variant-actions";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { COLORS, SIZES } from "@/constants/constants";

interface CreateVariantFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateVariantForm({ productId, onSuccess, onCancel }: CreateVariantFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [variant, setVariant] = useState<CreateProductVariantData>({
    productId,
    size: "",
    color: "",
    colorHex: "#000000",
    stock: 0,
    images: [],
  });

  const handleInputChange = (field: keyof CreateProductVariantData, value: string|number) => {
    setVariant(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorName: string, hexValue: string) => {
    setVariant(prev => ({
      ...prev,
      color: colorName,
      colorHex: hexValue,
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
      const imageUrls = await Promise.all(uploadPromises);

      setVariant(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));

      setMessage({
        type: "success",
        text: `Successfully uploaded ${imageUrls.length} image(s)`,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      setMessage({
        type: "error",
        text: "Failed to upload images. Please try again.",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (imageIndex: number) => {
    setVariant(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== imageIndex),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validation
      if (!variant.size || !variant.color) {
        setMessage({ type: "error", text: "Please select both size and color" });
        return;
      }

      if (variant.stock < 0) {
        setMessage({ type: "error", text: "Stock cannot be negative" });
        return;
      }

      if (variant.images.length === 0) {
        setMessage({ type: "error", text: "At least one image is required" });
        return;
      }

      const result = await createProductVariant(variant);

      if (result.success) {
        setMessage({ type: "success", text: "Variant created successfully!" });
        setTimeout(onSuccess, 1000);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to create variant" });
      }
    } catch (error) {
      console.error("Create variant error:", error);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === "success"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Size Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((sizeOption) => (
              <label
                key={sizeOption}
                className={`flex items-center justify-center p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  variant.size === sizeOption
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="size"
                  value={sizeOption}
                  checked={variant.size === sizeOption}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium">{sizeOption}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color *
          </label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {COLORS.map((colorOption) => (
              <label
                key={colorOption.name}
                className={`flex flex-col items-center p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  variant.color === colorOption.name
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="color"
                  value={colorOption.name}
                  checked={variant.color === colorOption.name}
                  onChange={() => handleColorChange(colorOption.name, colorOption.hex)}
                  className="sr-only"
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300 mb-1"
                  style={{ backgroundColor: colorOption.hex }}
                />
                <span className="text-xs text-center">{colorOption.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stock Input */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity *
          </label>
          <input
            type="number"
            id="stock"
            min="0"
            value={variant.stock}
            onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter stock quantity"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images *
          </label>

          <div className="mb-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              disabled={uploadingImages}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadingImages && (
              <p className="text-sm text-blue-600 mt-1">Uploading images...</p>
            )}
          </div>

          {variant.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {variant.images.map((imageUrl, imageIndex) => (
                <div key={imageIndex} className="relative group">
                  <Image
                    src={imageUrl}
                    alt={`Variant Image ${imageIndex + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(imageIndex)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading || uploadingImages}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Variant"}
          </button>
        </div>
      </form>
    </div>
  );
}