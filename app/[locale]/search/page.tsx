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
} from "@/utils/product-utils";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const t = await getTranslations("common"); // Use 'common' namespace
  const query =
    typeof resolvedSearchParams.q === "string"
      ? resolvedSearchParams.q.trim()
      : "";
  const title = query ? `${t("searchResults")} "${query}"` : t("search");

  return {
    title,
    description: `${t("searchResults")}: ${query}`,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const t = await getTranslations("common"); // Use 'common' namespace
  const rawQuery = resolvedSearchParams["q"];
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

  if (!query || query.length < 1) return notFound();

  const sortOption = (resolvedSearchParams["sort"] as SortOption) || "featured";
  const filters: FilterOptions = {};

  if (resolvedSearchParams["availability"]) {
    filters.availability = resolvedSearchParams["availability"] as
      | "in-stock"
      | "out-of-stock";
  }

  if (resolvedSearchParams["priceFrom"] || resolvedSearchParams["priceTo"]) {
    filters.priceRange = {
      from: resolvedSearchParams["priceFrom"]
        ? Number(resolvedSearchParams["priceFrom"])
        : 0,
      to: resolvedSearchParams["priceTo"]
        ? Number(resolvedSearchParams["priceTo"])
        : 3000,
    };
  }

  const products = await db.product.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          nameAr: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
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
