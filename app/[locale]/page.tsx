import Hero from "@/components/Hero/Hero";
import Hero2 from "@/components/Hero/Hero2";
import BestSellers from "@/components/Best-Sellers/BestSellers";
import Sets from "@/components/Sets/Sets";
import Tops from "@/components/Tops-Shirts/Tops-Shirts";
import Dresses from "@/components/Dresses/Dresses";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale: locale,
  }));
}

interface PageProps {
  params: Promise<{ locale: "en" | "ar" }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    title: isArabic
      ? "سكرة | أزياء نسائية وملابس"
      : "SEKRA | Women's Fashion & Clothing",
    description: isArabic
      ? "اكتشف أحدث مجموعة من الملابس النسائية من سكرة"
      : "Discover SEKRA's latest collection of women's clothing",
    openGraph: {
      locale: isArabic ? "ar_EG" : "en_US",
    },
  };
}

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function Home({ params }: PageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <Hero>
        <Hero2 />
      </Hero>
      <BestSellers />
      <Sets />
      <Tops />
      <Dresses />
    </>
  );
}
