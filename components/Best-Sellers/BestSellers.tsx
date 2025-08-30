import React from "react";
import SectionTitle from "../ui-custom/SectionTitle";
import CardGrid from "../ui-custom/CardGrid";
import { getTranslations } from "next-intl/server";
import { getProducts } from "@/server/db-actions/product-actions";

const BestSellers = async () => {
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
  const t = await getTranslations("sections");
  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle>{t("bestSellers")}</SectionTitle>
      </div>
      <CardGrid products={products} isProductsPage={false} />
    </section>
  );
};

export default BestSellers;
