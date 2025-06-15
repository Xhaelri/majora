import React from "react";
import SectionTitle from "../ui custom/SectionTitle";
import { Button } from "../ui/button";
import CardGrid from "../ui custom/CardGrid";
import { db } from "@/lib/prisma";

const BestSellers = async () => {
  const products = await db.product.findMany({
    include: {
      images: true, // This will include the array of ProductImage objects for each product
      // If you need variants or other relations, include them here as well:
      // variants: {
      //   include: {
      //     size: true,
      //     color: true,
      //   },
      // },
    },
  });
  
  return (
    <section className="flex flex-col items-center gap-15">
      <div className="flex flex-col items-center justify-center space-y-5">
        <SectionTitle>SS&apos;25</SectionTitle>
        <Button variant={"section"}>View All</Button>
      </div>
      <CardGrid products={products}/>
    </section>
  );
};

export default BestSellers;
