import { FullProduct } from "@/types/product-types";

export type SortOption =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-desc"
  | "date-asc";

export type FilterOptions = {
  availability?: "in-stock" | "out-of-stock";
  priceRange?: {
    from: number;
    to: number;
  };
};

export function filterByAvailability(products: FullProduct[], availability: "in-stock" | "out-of-stock") {
  return products.filter(product => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    
    if (availability === "in-stock") {
      return totalStock > 0;
    } else {
      return totalStock === 0;
    }
  });
}

export function filterByPriceRange(products: FullProduct[], priceRange: { from: number; to: number }) {
  return products.filter(product => {
    const price = product.salePrice || product.price;
    return price >= priceRange.from && price <= priceRange.to;
  });
}

export function sortProducts(products: FullProduct[], sortOption: SortOption) {
  const sortedProducts = [...products];
  
  switch (sortOption) {
    case "name-asc":
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return sortedProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    case "price-desc":
      return sortedProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    case "date-desc":
      return sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "date-asc":
      return sortedProducts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case "featured":
      return sortedProducts.sort((a, b) => {
        
        if (a.isLimitedEdition !== b.isLimitedEdition) {
          return a.isLimitedEdition ? -1 : 1;
        }
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    default:
      return sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export function processProducts(products: FullProduct[], sortOption: SortOption, filters?: FilterOptions) {
  let processedProducts = [...products];
  
  if (filters?.availability) {
    processedProducts = filterByAvailability(processedProducts, filters.availability);
  }
  
  if (filters?.priceRange) {
    processedProducts = filterByPriceRange(processedProducts, filters.priceRange);
  }
  
  processedProducts = sortProducts(processedProducts, sortOption);
  
  return processedProducts;
}