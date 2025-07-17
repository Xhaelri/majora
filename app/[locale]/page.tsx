// app/[locale]/page.tsx

import Hero from "@/components/Hero/Hero";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { routing } from "@/i18n/routing";

// Import your data fetching functions
import { getProductsByCategory } from "@/server/db/prisma";

// Skeleton loaders for a better UX (see step 2)
import { CardGridSkeleton } from "@/components/ui-custom/CardGridSkeleton";
import BestSellers from "@/components/Best-Sellers/BestSellers";

// Dynamically import components as before
const Bottoms = dynamic(() => import("@/components/Bottoms/Bottoms"));
const Dresses = dynamic(() => import("@/components/Dresses/Dresses"));
const Sets = dynamic(() => import("@/components/Sets/Sets"));
const Tops = dynamic(() => import("@/components/Tops-Shirts/Tops-Shirts"));

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export default async function Home() {
  const setsData = getProductsByCategory("sets");
  const topsData = getProductsByCategory("tops-shirts");
  const dressesData = getProductsByCategory("dresses");
  const bottomsData = getProductsByCategory("bottoms");

  const [sets, tops, dresses, bottoms] = await Promise.all([
    setsData,
    topsData,
    dressesData,
    bottomsData,
  ]);

  return (
    <>
      <Hero />
      {/* 3. Pass the fetched data down as props */}
      <BestSellers />

      <Suspense fallback={<CardGridSkeleton />}>
        <Sets products={sets ?? []} />
      </Suspense>
      <Suspense fallback={<CardGridSkeleton />}>
        <Tops products={tops ?? []} />
      </Suspense>
      <Suspense fallback={<CardGridSkeleton />}>
        <Dresses products={dresses ?? []} />
      </Suspense>
      <Suspense fallback={<CardGridSkeleton />}>
        <Bottoms products={bottoms ?? []} />
      </Suspense>
    </>
  );
}
