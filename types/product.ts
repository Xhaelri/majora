import { Prisma } from "@prisma/client";

export const fullProductArgs = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    category: true,
    variants: {
      include: {
        size: true,
        color: true,
        images: true,
      },
    },
  },
});

export type FullProduct = Prisma.ProductGetPayload<typeof fullProductArgs>;
