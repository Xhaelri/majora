import React from "react";
import SectionTitle from "../ui-custom/SectionTitle";
import { Button } from "../ui/button";
import CardGrid from "../ui-custom/CardGrid";
import { mobileMenue } from "@/constants/constants";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getProductsByCategory } from "@/server/db/prisma";


const Sets = async () => {
  const products = await getProductsByCategory("sets")
  const t = await getTranslations();

  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle>{t(mobileMenue[1].title)}</SectionTitle>
        <Link href={`/categories/sets`}>
          <Button variant={"section"}>{t("Common.viewAll")}</Button>
        </Link>
      </div>
      <CardGrid products={products} isProductsPage={false} />
    </section>
  );
};

export default Sets;