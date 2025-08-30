import React from "react";
import SectionTitle from "../ui-custom/SectionTitle";
import { Button } from "../ui/button";
import CardGrid from "../ui-custom/CardGrid";
import { getProductsByCategoryName } from "@/server/db-actions/product-actions";

const Kimonos = async () => {
  const products = (await getProductsByCategoryName("kimonos-kaftans")) ?? [];

  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle>Kimonos & Kaftans</SectionTitle>
        <Button variant={"section"}>View All</Button>
      </div>
      <CardGrid products={products} isProductsPage={false} />
    </section>
  );
};

export default Kimonos;
