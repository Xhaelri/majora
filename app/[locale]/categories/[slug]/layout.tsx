import ProductsSectionHeader from "@/components/ui-custom/ProductsSectionHeader";
import { heroImages } from "@/constants/constants";
import { getCategoryBySlug } from "@/server/db-actions/prisma";
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
  const headerImage = heroImages[2];
  const { locale } = resolvedParams;
  const isRTL = locale === "ar";

  const category = await getCategoryBySlug(resolvedParams.slug);

  const displayName = isRTL
    ? category?.nameAr || category?.name || resolvedParams.slug
    : category?.name || category?.nameAr || resolvedParams.slug;

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
