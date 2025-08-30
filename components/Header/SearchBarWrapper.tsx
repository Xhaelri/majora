import { getShopData } from "@/server/actions/search-actions";
import HeaderSearchBar from "./HeaderSearchBar";

export default async function SearchBarWrapper() {
  const searchData = await getShopData();

  return <HeaderSearchBar products={searchData.products} categories={searchData.categories} />;
}