"use client";

import { COLORS, SIZES } from "@/constants/constants";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  createProduct,
  CreateProductData,
  CreateProductVariantData,
} from "@/server/admin-actions/product-actions";
import { slugifyAdvanced } from "@/utils/slugify";
import { Category } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";



// Cloudinary upload function


type Props = {
  categories: Category[];
  onSuccess: () => void;
};

const CreateProductForm = ({ categories, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [productName, setProductName] = useState("");
  const [generatedSlug, setGeneratedSlug] = useState("");
  const [variants, setVariants] = useState<CreateProductVariantData[]>([
    {
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

  const router = useRouter();
  // Generate slug when product name changes
  useEffect(() => {
    if (productName.trim()) {
      setGeneratedSlug(slugifyAdvanced(productName));
    } else {
      setGeneratedSlug("");
    }
  }, [productName]);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
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

  // Handle color selection and auto-update hex code
  const handleColorChange = (index: number, colorName: string) => {
    const selectedColor = COLORS.find((color) => color.name === colorName);
    updateVariant(index, "color", colorName);
    if (selectedColor) {
      updateVariant(index, "colorHex", selectedColor.hex);
    }
  };

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
        text: `Successfully uploaded ${imageUrls.length} image(s)`,
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

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].images = updatedVariants[
      variantIndex
    ].images.filter((_, i) => i !== imageIndex);
    setVariants(updatedVariants);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);

    try {
      // Extract form data
      const productData: CreateProductData = {
        name: formData.get("name") as string,
        nameAr: formData.get("nameAr") as string,
        description: formData.get("description") as string,
        descriptionAr: formData.get("descriptionAr") as string,
        slug: generatedSlug,
        price: parseFloat(formData.get("price") as string),
        salePrice: formData.get("salePrice")
          ? parseFloat(formData.get("salePrice") as string)
          : undefined,
        isLimitedEdition: formData.get("isLimitedEdition") === "on",
        isAvailable: formData.get("isAvailable") === "on",
        categoryId: (formData.get("categoryId") as string) || undefined,
        variants: variants.filter(
          (variant) =>
            variant.size ||
            variant.color ||
            variant.stock > 0 ||
            variant.images.length > 0
        ),
      };

      const result = await createProduct(productData);

      if (result.success) {
        setMessage({ type: "success", text: "Product created successfully!" });
        setTimeout(onSuccess, 1000);
        (
          document.getElementById("create-product-form") as HTMLFormElement
        )?.reset();
        setProductName("");
        setGeneratedSlug("");
        setVariants([
          {
            size: "",
            color: "",
            colorHex: "#000000",
            stock: 0,
            images: [],
          },
        ]);
        router.refresh();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to create product",
        });
      }
    } catch (error) {
      console.log(error);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Product
      </h2>

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
        id="create-product-form"
        action={handleSubmit}
        className="space-y-4"
      >
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
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Arabic name"
              dir="rtl"
            />
          </div>
        </div>

        {/* Auto-generated Slug Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generated Slug
          </label>
          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
            {generatedSlug || "Will be generated from product name..."}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Automatically generated from product name
          </p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Arabic description"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="space-y-2">
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="radio"
                  id={`category-${category.id}`}
                  name="categoryId"
                  value={category.id}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  required
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              defaultChecked
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

        {/* Product Variants Section */}
        <div className="border-t pt-6 mt-6">
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

          {variants.map((variant, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-gray-700">
                  Variant #{index + 1}
                </h4>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

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
                          name={`size-${index}`}
                          value={sizeOption}
                          checked={variant.size === sizeOption}
                          onChange={(e) =>
                            updateVariant(index, "size", e.target.value)
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
                        index,
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
                          name={`color-${index}`}
                          value={colorOption.name}
                          checked={variant.color === colorOption.name}
                          onChange={() =>
                            handleColorChange(index, colorOption.name)
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
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>

                {/* Upload Input */}
                <div className="mb-3">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e.target.files)}
                    disabled={uploadingImages[index]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingImages[index] && (
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
                          alt={`Variant ${index + 1} - Image ${imageIndex + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-20 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, imageIndex)}
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
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || Object.values(uploadingImages).some(Boolean)}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading || Object.values(uploadingImages).some(Boolean)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }`}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
