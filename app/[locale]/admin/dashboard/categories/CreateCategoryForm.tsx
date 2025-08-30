"use client";

import {
  createCategory,
  CreateCategoryData,
} from "@/server/admin-actions/category-actions";
import React, { useState } from "react";

const CreateCategoryForm = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setMessage(null);

    try {
      // Extract form data
      const categoryData: CreateCategoryData = {
        name: formData.get("name") as string,
        nameAr: formData.get("nameAr") as string,
      };

      const result = await createCategory(categoryData);

      if (result.success) {
        setMessage({ type: "success", text: "category created successfully!" });
        // Reset form and variants
        (
          document.getElementById("create-category-form") as HTMLFormElement
        )?.reset();
        setCategoryName("");
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
        Create New Category
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
        id="create-category-form"
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
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Category name"
            />
          </div>

          <div>
            <label
              htmlFor="nameAr"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category Name (Arabic)
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

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategoryForm;
