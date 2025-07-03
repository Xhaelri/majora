import { Prisma } from "../lib/generated/prisma";



// for product details page and card
export type FullProduct = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: {
      include: {
        size: true;
        color: true;
        images: true;
        product:true;
      };
    };
    reviews: true;
  };
}>;


//for items in the car
export type CartItemWithVariant = Prisma.CartItemGetPayload<{
  include: {
    productVariant: {
      include: {
        color: true;
        size: true;
        images: true;
        product: true;
      };
    };
  };
}>;

// for getCartData function
export type GetCartDataResult = {
  items: CartItemWithVariant[];
  count: number;
};
