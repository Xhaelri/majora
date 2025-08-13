// page.tsx - Optimized version
import Hero from "@/components/Hero/Hero";
import { routing } from "@/i18n/routing";
import BestSellers from "@/components/Best-Sellers/BestSellers";
import Sets from "@/components/Sets/Sets";
import Tops from "@/components/Tops-Shirts/Tops-Shirts";
import Dresses from "@/components/Dresses/Dresses";
import type { Metadata } from "next";

// Generate static params for all locales at build time
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

// Add metadata per locale if needed
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: "en" | "ar" }>;
}): Promise<Metadata> {
  const { lang } = await params;
  
  // You can customize metadata per locale here
  const isArabic = lang === 'ar';
  
  return {
    title: isArabic ? "سكرة | أزياء نسائية وملابس" : "SEKRA | Women's Fashion & Clothing",
    description: isArabic 
      ? "اكتشف أحدث مجموعة من الملابس النسائية من سكرة"
      : "Discover SEKRA's latest collection of women's clothing",
    openGraph: {
      locale: isArabic ? 'ar_EG' : 'en_US',
    },
  };
}

// Force static generation for better performance
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  return (
    <>
      <Hero />
      <BestSellers />
      <Sets />
      <Tops />
      <Dresses />
      {/* <Bottoms /> */}
    </>
  );
}