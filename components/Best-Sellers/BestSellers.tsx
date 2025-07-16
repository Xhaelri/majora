import React from "react";
import SectionTitle from "../ui-custom/SectionTitle";
import { Button } from "../ui/button";
import CardGrid from "../ui-custom/CardGrid";
import { getAllProducts } from "@/server/db/prisma";
import { getTranslations } from "next-intl/server";
import { heroData } from "@/constants/constants";

const BestSellers = async () => {
  const products = (await getAllProducts()) ?? [];
  const t = await getTranslations()

  
  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
      <SectionTitle>{t(heroData[0].title)}</SectionTitle>
        <Button variant={"section"}>{t("Common.viewAll")}</Button>
      </div>
      <CardGrid products={products} isProductsPage={false} />
    </section>
  );
};

export default BestSellers;
