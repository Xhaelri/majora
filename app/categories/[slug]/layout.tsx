import ProductsSectionHeader from "@/components/ui-custom/ProductsSectionHeader";
import { heroImages } from "@/constants/constants";
import { getCategoryBySlug } from "@/server/db/prisma";
import React from "react";
import FilterBar from "../components/FilterBar";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const headerImage = heroImages[3];

  // Get category details
  const category = await getCategoryBySlug(resolvedParams.slug);

  // Capitalize the category name for display
  const displayName = category?.name || resolvedParams.slug;
  const formattedName = displayName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" & ");
  return (
    <>
      <ProductsSectionHeader image={headerImage}>
        <p>{formattedName}</p>
      </ProductsSectionHeader>
      <FilterBar />
      {children}
    </>
  );
}
