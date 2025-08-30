import React from "react";
import SectionTitle from "../ui-custom/SectionTitle";
import { Button } from "../ui/button";
import CardGrid from "../ui-custom/CardGrid";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProductsByCategoryName } from "@/server/db-actions/product-actions";

const Tops = async () => {
  const products = await getProductsByCategoryName("tops-shirts");
  const t = await getTranslations("sections");
  const tCommon = await getTranslations("Common2");

  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle>{t("topsShirts")}</SectionTitle>
        <Link href={`/categories/tops-shirts`}>
          <Button variant={"section"}>{tCommon("viewAll")}</Button>
        </Link>
      </div>
      <CardGrid products={products} isProductsPage={false} />
    </section>
  );
};

export default Tops;
