// app/search/page.tsx
import { getShopData } from "@/server/actions/search-actions";
import ClientSearchPage from "./components/ClientSearchPage";

type SearchParams = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchParams) {
  // await the searchParams
  const resolvedSearchParams = await searchParams;
  const { products, categories } = await getShopData();
  const initialQuery = resolvedSearchParams.q || "";

  return (
    <ClientSearchPage
      initialQuery={initialQuery}
      products={products}
      categories={categories}
    />
  );
}
