import React from "react";
import CardGrid from "../ui-custom/CardGrid";
import { FullProduct } from "@/types/product-types";
import SectionTitle from "../ui-custom/SectionTitle";
import { getLocale } from "next-intl/server";

interface CategorySectionProps {
  category: {
    id: string;
    name: string;
    nameAr: string;
    products: FullProduct[];
  };
}

const CategorySection = async ({ category }: CategorySectionProps) => {
  const locale = await getLocale();
  const isRTL = locale === "ar";
  if (!category.products || category.products.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle categoryName={category.name}>
          {isRTL ? category.nameAr : category.name}
        </SectionTitle>
      </div>
      <CardGrid products={category.products} isProductsPage={false} />
    </section>
  );
};

export default CategorySection;
