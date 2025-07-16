import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { default as Filtering } from "./components/FilterOptions";
import CardGrid from "@/components/ui-custom/CardGrid";
import SearchInput from "@/components/Search/SearchInput";
import FilterBar from "./components/FilterBar";
import {
  FilterOptions,
  processProducts,
  SortOption,
} from "@/lib/product-utils";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type SearchPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const t = await getTranslations("common"); 
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const title = query ? `${t("searchResults")} "${query}"` : t("search");

  return {
    title,
    description: `${t("searchResults")}: ${query}`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations();
  const rawQuery = searchParams["q"];
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

  if (!query || query.length < 1) return notFound();

  const sortOption = (searchParams["sort"] as SortOption) || "featured";
  const filters: FilterOptions = {};

  if (searchParams["availability"]) {
    filters.availability = searchParams["availability"] as
      | "in-stock"
      | "out-of-stock";
  }

  if (searchParams["priceFrom"] || searchParams["priceTo"]) {
    filters.priceRange = {
      from: searchParams["priceFrom"]
        ? Number(searchParams["priceFrom"])
        : 0,
      to: searchParams["priceTo"]
        ? Number(searchParams["priceTo"])
        : 3000,
    };
  }

  const products = await db.product.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      category: true,
      variants: {
        include: {
          size: true,
          color: true,
          images: true,
          product: true,
        },
      },
      reviews: true,
    },
  });

  const processedProducts = processProducts(products, sortOption, filters);

  return (
    <section className="flex flex-col items-center m-6">
      <h1 className="text-3xl font-light mb-4">
        {t("searchResults")} “{query}”
      </h1>

      <SearchInput isSearchPage={true} />
      {processedProducts.length === 0 ? (
        <div className="flex justify-center items-center h-[50vh] w-full">
          <p className="text-gray-500 text-xl">{t("noProductsFound")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 mt-5">
          <FilterBar />
          <div className="mt-4 flex container">
            <span className="hidden lg:inline-flex">
              <Filtering />
            </span>

            <CardGrid products={processedProducts} isProductsPage={true} />
          </div>
        </div>
      )}
    </section>
  );
}