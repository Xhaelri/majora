"use client";

import {
  deleteProductVariant,
  updateProductVariant,
} from "@/server/admin-actions/variant-actions";
import { Prisma } from "@prisma/client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getAllProductVariants } from "@/server/db-actions/variant-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Edit, Trash2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import ReusableDialog from "@/components/ui-custom/ReusableDialog";

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

interface UpdateVariantFormData {
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
}

const VariantsList = () => {
  const [variants, setVariants] = useState<ProductVariantWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Update dialog state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantWithProduct | null>(null);
  const [updateFormData, setUpdateFormData] = useState<UpdateVariantFormData>({
    size: "",
    color: "",
    colorHex: "",
    stock: 0,
    images: [],
  });
  const [updating, setUpdating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);

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

  // state for selected variant to delete
  const [variantToDelete, setVariantToDelete] =
    useState<ProductVariantWithProduct | null>(null);

  const handleDelete = (variant: ProductVariantWithProduct) => {
    setVariantToDelete(variant);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!variantToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteProductVariant(variantToDelete.id);
      if (result.success) {
        setMessage({
          type: "success",
          text: "Variant deleted successfully!",
        });
        setVariants((prev) => prev.filter((v) => v.id !== variantToDelete.id));
        setDeleteDialogOpen(false);
        setVariantToDelete(null);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to delete variant",
        });
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      setMessage({
        type: "error",
        text: "Failed to delete variant",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openUpdateDialog = (variant: ProductVariantWithProduct) => {
    setSelectedVariant(variant);
    setUpdateFormData({
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex || "",
      stock: variant.stock,
      images: variant.images || [],
    });
    setImagesToUpload([]);
    setUpdateDialogOpen(true);
  };

  const handleImageUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length !== fileArray.length) {
      setMessage({
        type: "error",
        text: "Some files were skipped. Only images under 5MB are allowed.",
      });
    }

    setImagesToUpload((prev) => [...prev, ...validFiles]);
  };

  const removeImageToUpload = (index: number) => {
    setImagesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setUpdateFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageUrl),
    }));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (imagesToUpload.length === 0) return [];

    setUploadingImages(true);
    try {
      const uploadPromises = imagesToUpload.map((file) =>
        uploadToCloudinary(file)
      );
      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls;
    } catch (error) {
      console.error("Failed to upload images:", error);
      throw new Error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    setUpdating(true);
    try {
      // Upload new images if any
      const newImageUrls = await uploadNewImages();
      const allImages = [...updateFormData.images, ...newImageUrls];

      if (allImages.length === 0) {
        setMessage({
          type: "error",
          text: "At least one image is required",
        });
        return;
      }

      const result = await updateProductVariant({
        id: selectedVariant.id,
        size: updateFormData.size,
        color: updateFormData.color,
        colorHex: updateFormData.colorHex,
        stock: updateFormData.stock,
        images: allImages,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: "Variant updated successfully!",
        });
        setUpdateDialogOpen(false);
        await loadVariants(); // Reload variants to show updated data
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update variant",
        });
      }
    } catch (error) {
      console.error("Update variant error:", error);
      setMessage({
        type: "error",
        text: "Failed to update variant",
      });
    } finally {
      setUpdating(false);
    }
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
            <div className="text-2xl font-bold text-blue-600">
              {variants.length}
            </div>
            <div className="text-sm text-gray-600">Total Variants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {variants.filter((v) => v.stock > 0).length}
            </div>
            <div className="text-sm text-gray-600">In Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {variants.filter((v) => v.stock === 0).length}
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
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No variants found
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first product variant.
          </p>
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
                    variant="outline"
                    size="sm"
                    onClick={() => openUpdateDialog(variant)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(variant)}
                    disabled={deleting === variant.id}
                    className="flex-1"
                  >
                    {deleting === variant.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}
                    {deleting === variant.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Variant Dialog */}
      <ReusableDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        title={`Update Variant - ${selectedVariant?.product.name}`}
        description="Update variant details including size, color, stock, and images"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-6">
          {/* Size and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={updateFormData.size}
                onChange={(e) =>
                  setUpdateFormData((prev) => ({
                    ...prev,
                    size: e.target.value,
                  }))
                }
                placeholder="e.g., S, M, L, XL"
                required
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={updateFormData.color}
                onChange={(e) =>
                  setUpdateFormData((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                placeholder="e.g., Red, Blue, Black"
                required
              />
            </div>
          </div>

          {/* Color Hex and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="colorHex">Color Hex (Optional)</Label>
              <Input
                id="colorHex"
                type="color"
                value={updateFormData.colorHex}
                onChange={(e) =>
                  setUpdateFormData((prev) => ({
                    ...prev,
                    colorHex: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={updateFormData.stock}
                onChange={(e) =>
                  setUpdateFormData((prev) => ({
                    ...prev,
                    stock: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
          </div>

          {/* Existing Images */}
          {updateFormData.images.length > 0 && (
            <div>
              <Label>Current Images</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {updateFormData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`Variant image ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-20 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div>
            <Label htmlFor="newImages">Add New Images</Label>
            <Input
              id="newImages"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files)
              }
              className="mt-1"
            />
            {imagesToUpload.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imagesToUpload.map((file, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-20 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImageToUpload(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updating || uploadingImages}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updating || uploadingImages}
              className="flex-1"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {uploadingImages ? "Uploading..." : "Updating..."}
                </>
              ) : (
                "Update Variant"
              )}
            </Button>
          </div>
        </form>
      </ReusableDialog>

      {/* Delete Confirmation Dialog */}
      <ReusableDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Variant"
        description={`Are you sure you want to delete the variant "${
          variantToDelete?.size || ""
        } - ${variantToDelete?.color || ""}"? This action cannot be undone.`}
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
            {isDeleting ? "Deleting..." : "Delete Variant"}
          </button>
        </div>
      </ReusableDialog>
    </div>
  );
};

export default VariantsList;
