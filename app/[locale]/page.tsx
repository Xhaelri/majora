// app/[locale]/page.tsx
import Hero from "@/components/Hero/Hero";
import Hero2 from "@/components/Hero/Hero2";
import { getAllCategoriesWithProducts } from "@/server/db-actions/category-actions";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import CategorySection from "@/components/Home-Section/CategorySection";

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
      ? "ماجورا | أزياء نسائية وملابس"
      : "Majora | Women's Fashion & Clothing",
    description: isArabic
      ? "اكتشف أحدث مجموعة من الملابس النسائية من ماجورا"
      : "Discover Majora's latest collection of women's clothing",
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

  // Fetch all categories with their products
  const result = await getAllCategoriesWithProducts();

  return (
    <>
      <Hero>
        <Hero2 />
      </Hero>

      {/* Dynamically render category sections */}
      {result.success && result.data ? (
        result.data.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))
      ) : (
        <section className="flex flex-col items-center gap-15">
          <div>Error loading categories: {result.error || "Unknown error"}</div>
        </section>
      )}
    </>
  );
}
