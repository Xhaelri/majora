"use client";

import {
  createProductVariant,
  CreateProductVariantData,
} from "@/server/admin-actions/variant-actions";
import {
  getProductById,
  getProducts,
} from "@/server/db-actions/product-actions";
import { Prisma } from "@prisma/client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

type ProductWithIncludes = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: true;
  };
}>;

// Predefined sizes and colors
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#808080" },
  { name: "Red", hex: "#FF0000" },
  { name: "Blue", hex: "#0000FF" },
  { name: "Green", hex: "#008000" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Orange", hex: "#FFA500" },
  { name: "Purple", hex: "#800080" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Navy", hex: "#000080" },
];

// Cloudinary upload function
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Cloudinary upload failed:", errorData);
    throw new Error(`Cloudinary Error: ${errorData.error.message}`);
  }

  const data = await response.json();
  return data.secure_url;
}

const EditVariantForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedProductId = searchParams.get("productId") || "";

  // Form state
  const [selectedProductId, setSelectedProductId] = useState(preSelectedProductId);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithIncludes | null>(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [stock, setStock] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductWithIncludes[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Load available products
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const result = await getProducts({});
        if (result.success && result.data) {
          setAvailableProducts(result.data.products);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Load product details when selected or pre-selected
  useEffect(() => {
    if (selectedProductId) {
      handleProductChange(selectedProductId);
    }
  }, [selectedProductId]);

  // Load product details when selected
  const handleProductChange = async (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) {
      setSelectedProduct(null);
      return;
    }

    setLoadingProduct(true);
    try {
      const result = await getProductById(productId);
      if (result.success && result.data) {
        setSelectedProduct(result.data);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to load product details",
        });
      }
    } catch (error) {
      console.log(error)
      setMessage({
        type: "error",
        text: "Failed to load product details",
      });
    } finally {
      setLoadingProduct(false);
    }
  };

  // Handle color selection
  const handleColorChange = (colorName: string, hexValue: string) => {
    setColor(colorName);
    setColorHex(hexValue);
    setCustomColor("");
    setCustomColorHex("#000000");
  };

  // Handle custom color
  const handleCustomColorChange = (name: string, hex: string) => {
    setCustomColor(name);
    setCustomColorHex(hex);
    setColor("");
    setColorHex("");
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadToCloudinary(file)
      );
      const imageUrls = await Promise.all(uploadPromises);

      setImages(prev => [...prev, ...imageUrls]);

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

  // Remove image
  const removeImage = (imageIndex: number) => {
    setImages(prev => prev.filter((_, i) => i !== imageIndex));
  };

  // Check if variant already exists
  const variantExists = selectedProduct?.variants.some(
    (variant) =>
      variant.size === size && variant.color === (color || customColor)
  );

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Validate form data
      if (!selectedProductId) {
        setMessage({ type: "error", text: "Please select a product" });
        return;
      }

      if (!size) {
        setMessage({ type: "error", text: "Please select a size" });
        return;
      }

      const finalColor = color || customColor;
      const finalColorHex = colorHex || customColorHex;

      if (!finalColor) {
        setMessage({ type: "error", text: "Please select or enter a color" });
        return;
      }

      if (stock < 0) {
        setMessage({ type: "error", text: "Stock cannot be negative" });
        return;
      }

      if (images.length === 0) {
        setMessage({ type: "error", text: "At least one image is required" });
        return;
      }

      // Check if variant already exists
      if (variantExists) {
        setMessage({
          type: "error",
          text: "A variant with this size and color already exists for this product",
        });
        return;
      }

      const variantData: CreateProductVariantData = {
        productId: selectedProductId,
        size,
        color: finalColor,
        colorHex: finalColorHex,
        stock,
        images,
      };

      const result = await createProductVariant(variantData);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Product variant created successfully!",
        });

        // Reset form fields but keep the selected product
        setSize("");
        setColor("");
        setColorHex("");
        setCustomColor("");
        setCustomColorHex("#000000");
        setStock(0);
        setImages([]);

        // Reload the product to show the new variant
        await handleProductChange(selectedProductId);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to create variant",
        });
      }
    } catch (error) {
      console.log(error);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSize("");
    setColor("");
    setColorHex("");
    setCustomColor("");
    setCustomColorHex("#000000");
    setStock(0);
    setImages([]);
    setMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Create Product Variant
        </h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>
      </div>

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

      <form
        id="create-variant-form"
        action={handleSubmit}
        className="space-y-6"
      >
        {/* Product Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Product Selection
          </h3>

          <div className="space-y-4">
            {/* Product ID Input */}
            <div>
              <label
                htmlFor="productId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter Product ID *
              </label>
              <input
                type="text"
                id="productId"
                placeholder="Enter Product ID"
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {loadingProduct && (
                <p className="text-sm text-blue-600 mt-1">Loading product...</p>
              )}
            </div>

            {/* Product Dropdown */}
            <div>
              <label
                htmlFor="productSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Or Select from List
              </label>
              <select
                id="productSelect"
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingProducts}
              >
                <option value="">Select a product...</option>
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (ID: {product.id.slice(-6)})
                  </option>
                ))}
              </select>
              {loadingProducts && (
                <p className="text-sm text-blue-600 mt-1">
                  Loading products...
                </p>
              )}
            </div>

            {selectedProduct && (
              <div className="mt-2 p-3 bg-blue-50 rounded border">
                <p className="font-medium text-blue-800">
                  Selected: {selectedProduct.name}
                </p>
                <p className="text-sm text-blue-600">
                  Category: {selectedProduct.category?.name || "No category"}
                </p>
                <p className="text-sm text-blue-600">
                  Price: ${selectedProduct.price.toFixed(2)}
                  {selectedProduct.salePrice && (
                    <span>
                      {" "}
                      (Sale: ${selectedProduct.salePrice.toFixed(2)})
                    </span>
                  )}
                </p>
                <p className="text-sm text-blue-600">
                  Existing variants: {selectedProduct.variants.length}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Variant Details */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Variant Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      size === sizeOption
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={sizeOption}
                      checked={size === sizeOption}
                      onChange={(e) => setSize(e.target.value)}
                      className="sr-only"
                    />
                    <span className="font-medium">{sizeOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stock Quantity *
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter stock quantity"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>

            {/* Predefined Colors */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Predefined Colors
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {COLORS.map((colorOption) => (
                  <label
                    key={colorOption.name}
                    className={`flex flex-col items-center p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      color === colorOption.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={colorOption.name}
                      checked={color === colorOption.name}
                      onChange={() =>
                        handleColorChange(colorOption.name, colorOption.hex)
                      }
                      className="sr-only"
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-300 mb-1"
                      style={{ backgroundColor: colorOption.hex }}
                    />
                    <span className="text-xs text-center">
                      {colorOption.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Color */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Or Custom Color
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Custom color name"
                    value={customColor}
                    onChange={(e) =>
                      handleCustomColorChange(e.target.value, customColorHex)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) =>
                      handleCustomColorChange(customColor, e.target.value)
                    }
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColorHex}
                    onChange={(e) =>
                      handleCustomColorChange(customColor, e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images *
            </label>

            {/* Upload Input */}
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
                <p className="text-sm text-blue-600 mt-1">
                  Uploading images...
                </p>
              )}
            </div>

            {/* Display uploaded images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {images.map((imageUrl, imageIndex) => (
                  <div key={imageIndex} className="relative group">
                    <Image
                      src={imageUrl}
                      alt={`Variant Image ${imageIndex + 1}`}
                      className="w-full h-20 object-cover rounded-md border"
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
        </div>

        {/* Conflict Warning */}
        {variantExists && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded">
            ⚠️ A variant with this size and color already exists for this
            product!
          </div>
        )}

        {/* Existing Variants Preview */}
        {selectedProduct && selectedProduct.variants.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">
              Existing Variants:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {selectedProduct.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="text-sm bg-white p-3 rounded border flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {variant.size} - {variant.color}
                    </div>
                    <div className="text-gray-500">Stock: {variant.stock}</div>
                  </div>
                  {variant.colorHex && (
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: variant.colorHex }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={loading || !selectedProduct || variantExists || uploadingImages}
            className="flex-1 py-3 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Variant..." : "Create Product Variant"}
          </button>

          {preSelectedProductId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Another
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Tips:</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Upload multiple images to showcase the variant from different angles</li>
            <li>
              • Each product variant must have a unique combination of size and
              color
            </li>
            <li>• Stock quantity can be updated later if needed</li>
            <li>
              • Use descriptive color names for better customer experience
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default EditVariantForm;