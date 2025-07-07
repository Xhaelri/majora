import React from "react";
import SectionTitle from "../ui-custom/SectionTitle";
import { Button } from "../ui/button";
import CardGrid from "../ui-custom/CardGrid";
import { getProductsByCategory } from "@/server/db/prisma";

const Tops = async () => {
  const products = (await getProductsByCategory("tops-shirts")) ?? [];

  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle>Tops & Shirts</SectionTitle>
        <Button variant={"section"}>View All</Button>
      </div>
      <CardGrid products={products} isProductsPage={false} />
    </section>
  );
};

export default Tops;
