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

const CreateVariantForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Product selection state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithIncludes | null>(null);
  const [availableProducts, setAvailableProducts] = useState<
    ProductWithIncludes[]
  >([]);
  const [, setLoadingProduct] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Variants state - now supporting multiple variants
  const [variants, setVariants] = useState<CreateProductVariantData[]>([
    {
      productId: selectedProductId,
      size: "",
      color: "",
      colorHex: "#000000",
      stock: 0,
      images: [],
    },
  ]);
  const [uploadingImages, setUploadingImages] = useState<{
    [key: number]: boolean;
  }>({});

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

  // Load product details when selected
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
      console.log(error);
      setMessage({
        type: "error",
        text: "Failed to load product details",
      });
    } finally {
      setLoadingProduct(false);
    }
  };

  // Variant management functions
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        productId: selectedProductId,
        size: "",
        color: "",
        colorHex: "#000000",
        stock: 0,
        images: [],
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = <K extends keyof CreateProductVariantData>(
    index: number,
    field: K,
    value: CreateProductVariantData[K]
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  // Handle color selection for a specific variant
  const handleColorChange = (
    variantIndex: number,
    colorName: string,
    hexValue: string
  ) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].color = colorName;
    updatedVariants[variantIndex].colorHex = hexValue;
    setVariants(updatedVariants);
  };

  // Handle image upload for a specific variant
  const handleImageUpload = async (
    variantIndex: number,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    setUploadingImages((prev) => ({ ...prev, [variantIndex]: true }));

    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadToCloudinary(file)
      );
      const imageUrls = await Promise.all(uploadPromises);

      const updatedVariants = [...variants];
      updatedVariants[variantIndex].images = [
        ...updatedVariants[variantIndex].images,
        ...imageUrls,
      ];
      setVariants(updatedVariants);

      setMessage({
        type: "success",
        text: `Successfully uploaded ${imageUrls.length} image(s) for variant ${
          variantIndex + 1
        }`,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      setMessage({
        type: "error",
        text: "Failed to upload images. Please try again.",
      });
    } finally {
      setUploadingImages((prev) => ({ ...prev, [variantIndex]: false }));
    }
  };

  // Remove image from a specific variant
  const removeImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].images = updatedVariants[
      variantIndex
    ].images.filter((_, i) => i !== imageIndex);
    setVariants(updatedVariants);
  };

  // Check if any variant conflicts with existing variants
  const getVariantConflicts = () => {
    if (!selectedProduct) return [];

    return variants.map((variant, index) => {
      const exists = selectedProduct.variants.some(
        (existingVariant) =>
          existingVariant.size === variant.size &&
          existingVariant.color === variant.color &&
          variant.size &&
          variant.color
      );
      return { index, exists, variant };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Validate product selection
      if (!selectedProductId) {
        setMessage({ type: "error", text: "Please select a product" });
        return;
      }

      // Filter and validate variants
      const validVariants = variants.filter(
        (variant) =>
          variant.size ||
          variant.color ||
          variant.stock > 0 ||
          variant.images.length > 0
      );

      if (validVariants.length === 0) {
        setMessage({
          type: "error",
          text: "Please add at least one variant with some data",
        });
        return;
      }

      // Validate each variant
      const invalidVariants = [];
      const conflictingVariants = [];

      for (let i = 0; i < validVariants.length; i++) {
        const variant = validVariants[i];

        if (!variant.size || !variant.color) {
          invalidVariants.push(i + 1);
        }

        if (variant.stock < 0) {
          setMessage({
            type: "error",
            text: `Stock for variant ${i + 1} cannot be negative`,
          });
          return;
        }

        if (variant.images.length === 0) {
          setMessage({
            type: "error",
            text: `At least one image is required for variant ${i + 1}`,
          });
          return;
        }

        // Check for conflicts with existing variants
        const exists = selectedProduct?.variants.some(
          (existingVariant) =>
            existingVariant.size === variant.size &&
            existingVariant.color === variant.color
        );

        if (exists) {
          conflictingVariants.push(i + 1);
        }
      }

      if (invalidVariants.length > 0) {
        setMessage({
          type: "error",
          text: `Please complete size and color for variant(s): ${invalidVariants.join(
            ", "
          )}`,
        });
        return;
      }

      if (conflictingVariants.length > 0) {
        setMessage({
          type: "error",
          text: `Variant(s) ${conflictingVariants.join(
            ", "
          )} already exist with the same size and color`,
        });
        return;
      }

      // Create all variants
      let successCount = 0;
      let errorCount = 0;

      for (const variant of validVariants) {
        const variantData: CreateProductVariantData = {
          productId: selectedProductId,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          stock: variant.stock,
          images: variant.images,
        };

        try {
          const result = await createProductVariant(variantData);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to create variant: ${result.error}`);
          }
        } catch (error) {
          errorCount++;
          console.error("Error creating variant:", error);
        }
      }

      if (successCount > 0) {
        setMessage({
          type: "success",
          text: `Successfully created ${successCount} variant(s)${
            errorCount > 0
              ? `. ${errorCount} variant(s) failed to create.`
              : "!"
          }`,
        });

        // Reset variants but keep the selected product
        setVariants([
          {
            productId: selectedProductId,
            size: "",
            color: "",
            colorHex: "#000000",
            stock: 0,
            images: [],
          },
        ]);

        // Reload the product to show new variants
        await handleProductChange(selectedProductId);
      } else {
        setMessage({
          type: "error",
          text: "Failed to create any variants. Please try again.",
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
    setVariants([
      {
        productId: selectedProductId,
        size: "",
        color: "",
        colorHex: "#000000",
        stock: 0,
        images: [],
      },
    ]);
    setMessage(null);
  };

  const variantConflicts = getVariantConflicts();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Create Product Variants
        </h2>
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
            {/* Product Dropdown */}
            <div>
              <label
                htmlFor="productSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select from List
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

        {/* Variants Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Product Variants
            </h3>
            <button
              type="button"
              onClick={addVariant}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              + Add Variant
            </button>
          </div>

          {variants.map((variant, variantIndex) => {
            const conflict = variantConflicts.find(
              (c) => c.index === variantIndex
            );

            return (
              <div
                key={variantIndex}
                className="border border-gray-200 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-700">
                    Variant #{variantIndex + 1}
                  </h4>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Conflict Warning */}
                {conflict?.exists && (
                  <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4">
                    ⚠️ A variant with this size and color already exists for
                    this product!
                  </div>
                )}

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
                            variant.size === sizeOption
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`size-${variantIndex}`}
                            value={sizeOption}
                            checked={variant.size === sizeOption}
                            onChange={(e) =>
                              updateVariant(
                                variantIndex,
                                "size",
                                e.target.value
                              )
                            }
                            className="sr-only"
                          />
                          <span className="font-medium">{sizeOption}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(
                          variantIndex,
                          "stock",
                          parseInt(e.target.value) || 0
                        )
                      }
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
                            variant.color === colorOption.name
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`color-${variantIndex}`}
                            value={colorOption.name}
                            checked={variant.color === colorOption.name}
                            onChange={() =>
                              handleColorChange(
                                variantIndex,
                                colorOption.name,
                                colorOption.hex
                              )
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
                      onChange={(e) =>
                        handleImageUpload(variantIndex, e.target.files)
                      }
                      disabled={uploadingImages[variantIndex]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploadingImages[variantIndex] && (
                      <p className="text-sm text-blue-600 mt-1">
                        Uploading images...
                      </p>
                    )}
                  </div>

                  {/* Display uploaded images */}
                  {variant.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {variant.images.map((imageUrl, imageIndex) => (
                        <div key={imageIndex} className="relative group">
                          <Image
                            src={imageUrl}
                            alt={`Variant ${variantIndex + 1} Image ${
                              imageIndex + 1
                            }`}
                            width={20}
                            height={20}
                            className="w-full h-20 object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeImage(variantIndex, imageIndex)
                            }
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
            );
          })}
        </div>

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
            disabled={
              loading ||
              !selectedProduct ||
              Object.values(uploadingImages).some(Boolean)
            }
            className="flex-1 py-3 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Creating Variants..."
              : `Create ${variants.length} Variant${
                  variants.length > 1 ? "s" : ""
                }`}
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset Form
          </button>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Tips:</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• Click &quot;+ Add Variant&quot; to create multiple variants at once</li>
            <li>
              • Upload multiple images to showcase each variant from different
              angles
            </li>
            <li>
              • Each variant must have a unique combination of size and color
              for the selected product
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

export default CreateVariantForm;
