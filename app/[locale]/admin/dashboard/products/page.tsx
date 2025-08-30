// Page.tsx (Server Component)
import React from "react";
import ProductList from "./ProductsList";
import { getCategories } from "@/server/db-actions/category-actions";
import ProductPageLayoutClient from "./ProductPageLayoutClient";

const Page = async () => {
  const result = await getCategories();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch categories");
  }

  return (
    <ProductPageLayoutClient categories={result.data}>
      <ProductList />
    </ProductPageLayoutClient>
  );
};

export default Page;
