import { Category, Product, ProductVariant } from "@prisma/client";

export type FullProduct = Product & {
  variants: ProductVariant[];
  category: Category | null;
};
