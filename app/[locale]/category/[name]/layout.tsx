import CategorySectionHeader from "@/components/Home-Section/CategorySectionHeader";
import { heroImages } from "@/constants/constants";
import React from "react";
import FilterBar from "../components/FilterBar";
import { getCategoryByName } from "@/server/db-actions/category-actions";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ name: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const headerImage = heroImages[2];
  const { locale } = resolvedParams;
  const isRTL = locale === "ar";

  const category = await getCategoryByName(resolvedParams.name);

  const displayName = isRTL
    ? category?.data?.nameAr || category?.data?.name || resolvedParams.name.replace(/-/g, ' ')
    : category?.data?.name || category?.data?.nameAr || resolvedParams.name.replace(/-/g, ' ');

  return (
    <>
      <CategorySectionHeader image={headerImage}>
        <p className="text-3xl md:text-5xl font-medium uppercase">{displayName}</p>
      </CategorySectionHeader>
      <FilterBar />
      {children}
    </>
  );
}
