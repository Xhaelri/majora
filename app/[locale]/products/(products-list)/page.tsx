import CardGrid from "@/components/ui-custom/CardGrid";
import { getProducts } from "@/server/db-actions/product-actions";
import React from "react";

const ProductsPage = async () => {
  const result = await getProducts();

  // Handle the case where getProducts fails
  if (!result.success || !result.data) {
    return (
      <section className="flex flex-col items-center gap-15">
        <div>Error loading products: {result.error || "Unknown error"}</div>
      </section>
    );
  }

  console.log(result);

  // Extract the products array from the data object
  const products = result.data.products;

  return (
    <section className="flex flex-col items-center gap-15">
      <CardGrid products={products} isProductsPage={true} />
    </section>
  );
};

export default ProductsPage;
