
import CardGrid from "@/components/ui-custom/CardGrid";
import {
  processProducts,
  SortOption,
  FilterOptions,
} from "@/utils/product-utils";
import React from "react";
import { default as Filtering } from "../components/FilterOptions";
import { getCategoryByName } from "@/server/db-actions/category-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = await params;
  const category = await getCategoryByName(resolvedParams.name);

  return {
    title: category.data?.name || resolvedParams.name.replace(/-/g, ' '),
  };
}

const CategoryPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categoryName = resolvedParams.name;

  const result = await getCategoryByName(categoryName);

  // Handle error case
  if (!result.success || !result.data) {
    return (
      <div className="mt-4 flex container">
        <div>Error loading category: {result.error || "Category not found"}</div>
      </div>
    );
  }

  const categoryProducts = result.data.products;

  const sortOption = (resolvedSearchParams["sort"] as SortOption) || "featured";

  const filters: FilterOptions = {};

  if (resolvedSearchParams["availability"]) {
    filters.availability = resolvedSearchParams["availability"] as
      | "in-stock"
      | "out-of-stock";
  }

  if (resolvedSearchParams["priceFrom"] || resolvedSearchParams["priceTo"]) {
    filters.priceRange = {
      from: resolvedSearchParams["priceFrom"]
        ? Number(resolvedSearchParams["priceFrom"])
        : 0,
      to: resolvedSearchParams["priceTo"]
        ? Number(resolvedSearchParams["priceTo"])
        : 3000,
    };
  }

  const processedProducts = processProducts(
    categoryProducts,
    sortOption,
    filters
  );

  return (
    <div className="mt-4 flex container">
      <span className="hidden lg:inline-flex">
        <Filtering />
      </span>
      <CardGrid products={processedProducts} isProductsPage={true} />
    </div>
  );
};

export default CategoryPage;