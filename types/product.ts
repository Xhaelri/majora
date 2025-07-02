import { Prisma } from "../lib/generated/prisma";

export type FullProduct = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: {
      include: {
        size: true;
        color: true;
        images: true;
      };
    };
    reviews: true;
  };
}>;
