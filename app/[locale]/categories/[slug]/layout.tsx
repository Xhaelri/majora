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
  params: Promise<{ slug: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const headerImage = heroImages[3];
  const { locale } = resolvedParams; // Use resolvedParams instead of awaiting params again
  const isRTL = locale === "ar";
  
  // Get category details
  const category = await getCategoryBySlug(resolvedParams.slug);

  // Safely get display name with fallback to slug
  const displayName = isRTL 
    ? (category?.nameAr || category?.name || resolvedParams.slug)
    : (category?.name || category?.nameAr || resolvedParams.slug);
  
  // Format the name safely
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