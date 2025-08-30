"use client";

import {
  updateCategory,
  deleteCategory,
  UpdateCategoryData,
} from "@/server/admin-actions/category-actions";
import { getCategories } from "@/server/db-actions/category-actions";
import { Category } from "@prisma/client";
import React, { useState, useEffect } from "react";

export type CategoryWithCount = Category & {
  _count: {
    products: number;
  };
};
const CategoriesList = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string>("");
  const [editForm, setEditForm] = useState({
    name: "",
    nameAr: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data as CategoryWithCount[]);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to fetch categories",
        });
      }
    } catch (error) {
      console.log(error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred while fetching categories",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      nameAr: category.nameAr || "",
    });
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditForm({ name: "", nameAr: "" });
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.name.trim()) {
      setMessage({ type: "error", text: "Category name is required" });
      return;
    }

    setActionLoading(id);
    try {
      const updateData: UpdateCategoryData = {
        id,
        name: editForm.name.trim(),
        nameAr: editForm.nameAr.trim(),
      };

      const result = await updateCategory(updateData);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Category updated successfully!",
        });
        setEditingId("");
        setEditForm({ name: "", nameAr: "" });
        // Update the category in the local state
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? { ...cat, ...result.data } : cat))
        );
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update category",
        });
      }
    } catch (error) {
      console.log(error);

      setMessage({
        type: "error",
        text: "An unexpected error occurred during update",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setActionLoading(id);
    try {
      const result = await deleteCategory(id);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Category deleted successfully!",
        });
        // Remove the category from local state
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to delete category",
        });
      }
    } catch (error) {
      console.log(error);

      setMessage({
        type: "error",
        text: "An unexpected error occurred during deletion",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Manage Categories ({categories.length})
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No categories found</div>
          <div className="text-gray-400">
            Create your first category to get started
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                  Name (English)
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                  Name (Arabic)
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                  Products Count
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-700">
                  Created At
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Category name"
                      />
                    ) : (
                      <span className="text-gray-900">{category.name}</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editForm.nameAr}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            nameAr: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Arabic name"
                        dir="rtl"
                      />
                    ) : (
                      <span className="text-gray-900" dir="rtl">
                        {category.nameAr || "-"}
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <span className="text-gray-900">
                      {category._count?.products || 0}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <span className="text-gray-600">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={() => handleUpdate(category.id)}
                            disabled={actionLoading === category.id}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === category.id
                              ? "Saving..."
                              : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={actionLoading === category.id}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(category)}
                            disabled={actionLoading === category.id}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            disabled={actionLoading === category.id}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === category.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;

