import React from "react";
import SectionTitle from "../ui custom/SectionTitle";
import { Button } from "../ui/button";
import CardGrid from "../ui custom/CardGrid";
import { getAllProducts } from "@/server/db/prisma";

const BestSellers = async () => {
  const products = (await getAllProducts()) ?? [];

  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle>SS&apos;25</SectionTitle>
        <Button variant={"section"}>View All</Button>
      </div>
      <CardGrid products={products} isProductsPage />
    </section>
  );
};

export default BestSellers;
