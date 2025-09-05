// hooks/useCategories.ts
import { useState, useEffect } from "react";
import { getCategories } from "@/server/db-actions/category-actions";
import { CategoryWithCount } from "@/app/[locale]/admin/dashboard/categories/CategoriesList";


interface UseCategoriesReturn {
  categories: CategoryWithCount[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getCategories();

      if (result.success && result.data) {
        setCategories(result.data); // ✅ correct type
      } else {
        setError(result.error || "Failed to fetch categories");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}
