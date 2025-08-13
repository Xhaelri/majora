import React from "react";
import SectionTitle from "../ui-custom/SectionTitle";
import CardGrid from "../ui-custom/CardGrid";
import { getAllProducts } from "@/server/db/prisma";
import { getTranslations } from "next-intl/server";

const BestSellers = async () => {
  const products = (await getAllProducts()) ?? [];
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