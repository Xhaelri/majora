import { Prisma } from "../lib/generated/prisma";

export type FullProduct = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: {
      include: {
        size: true;
        color: true;
      };
    };
    reviews: true;
  };
}>;


