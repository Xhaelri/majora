import { Button } from "@/components/ui/button";
import { CartItemWithVariant } from "@/types/product";
import { formatPrice } from "@/utils/formatPrice";
import React from "react";

type Props = {
  cartItems: CartItemWithVariant[];
};

const CheckOut = ({ cartItems }: Props) => {
  // Subtotal = full price before discount
  const subtotal = cartItems.reduce((sum, item) => {
    const fullPrice = item.productVariant.product.price;
    return sum + fullPrice * item.quantity;
  }, 0);

  // Discount = total saved from salePrice
  const discount = cartItems.reduce((sum, item) => {
    const { price, salePrice } = item.productVariant.product;
    if (salePrice && salePrice < price) {
      return sum + (price - salePrice) * item.quantity;
    }
    return sum;
  }, 0);

  const delivery = 0; // or dynamic based on address/governorate

  const total = subtotal - discount + delivery;

  return (
    <div className="mx-auto  px-7 space-y-1 lg:px-0 lg:mx-0">
      <div className="flex text-sm font-light  justify-between">
        <p>Subtotal</p>
        <p>{formatPrice(subtotal)}</p>
      </div>

      <div className="flex text-sm font-light  justify-between">
        <p>Discount</p>
        <p className="text-red-500">- {formatPrice(discount)}</p>
      </div>

      <div className="flex  text-sm font-light justify-between">
        <p>Delivery</p>
        <p>Free</p>
      </div>

      <div className="flex  text-sm  justify-between font-semibold uppercase ">
        <h1>Total</h1>
        <h1>{formatPrice(total)}</h1>
      </div>
      <Button variant="cartBuyNow" size={"cartBuyNow"} className="mt-2">Checkout</Button>
    </div>
  );
};

export default CheckOut;
