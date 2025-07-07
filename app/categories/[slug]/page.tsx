import CardGrid from "@/components/ui-custom/CardGrid";
import { getProductsByCategory } from "@/server/db/prisma";
import {
  processProducts,
  SortOption,
  FilterOptions,
} from "@/lib/product-utils";
import React from "react";
import { default as Filtering } from "../components/FilterOptions";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.slug;

  const categoryProducts = await getProductsByCategory(categorySlug);

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

export default page;
