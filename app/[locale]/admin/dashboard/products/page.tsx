// app/admin/products/page.tsx (Server Component)

import { getCategories } from "@/server/db-actions/category-actions";
import ProductsPageClient from "./ProductPageClient";


export default async function ProductsPage() {
  
  const result = await getCategories();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch categories");
  }


  return <ProductsPageClient categories={result.data} />;
}