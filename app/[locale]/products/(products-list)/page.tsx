import CardGrid from "@/components/ui-custom/CardGrid";
import { getAllProducts } from "@/server/db-actions/prisma";
import React from "react";

const page = async () => {
  const products = (await getAllProducts()) ?? [];
  return (
    <section className="flex flex-col items-center gap-15">
      <CardGrid products={products} isProductsPage={true} />
    </section>
  );
};

export default page;
