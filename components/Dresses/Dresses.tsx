
import React from "react";
import SectionTitle from "../ui-custom/SectionTitle";
import { Button } from "../ui/button";
import CardGrid from "../ui-custom/CardGrid";
import { getProductsByCategory } from "@/server/db/prisma";
import { getTranslations } from "next-intl/server";
import { mobileMenue } from "@/constants/constants";

const Dresses = async () => {
  const products = (await getProductsByCategory("dresses")) ?? [];
  const t = await getTranslations()


  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle>{t(mobileMenue[3].title)}</SectionTitle>
        <Button variant={"section"}>{t("Common.viewAll")}</Button>
      </div>
      <CardGrid products={products} isProductsPage={false} />
    </section>
  );
};

export default Dresses;
