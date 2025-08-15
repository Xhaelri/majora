import { Prisma } from "@prisma/client";

const cartItemWithProduct = Prisma.validator<Prisma.CartItemDefaultArgs>()({
  include: {
    productVariant: {
      include: {
        product: true,
        color: true,
        size: true,
        images: {
          select: {
            url: true,
            altText: true,
            altTextAr: true,
          },
          take: 2,
        },
      },
    },
  },
});

export type CartItemWithProduct = Prisma.CartItemGetPayload<
  typeof cartItemWithProduct
>;
