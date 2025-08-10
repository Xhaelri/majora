// checkout/components/checkout-button.tsx (Update your existing CheckOut component)
import { Button } from "@/components/ui/button";
import { CartItemWithVariant } from "@/types/product";
import formatPrice from "@/utils/formatPrice";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyDiscount } from "@/server/actions/cart"; // You'll create this
import { toast } from "sonner";

type Props = {
  cartItems: CartItemWithVariant[];
};

const CartCheckOut = ({ cartItems }: Props) => {
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Subtotal = full price before discount
  const subtotal = cartItems.reduce((sum, item) => {
    const fullPrice = item.productVariant.product.price;
    return sum + fullPrice * item.quantity;
  }, 0);

  // Discount from salePrice
  const saleDiscount = cartItems.reduce((sum, item) => {
    const { price, salePrice } = item.productVariant.product;
    if (salePrice && salePrice < price) {
      return sum + (price - salePrice) * item.quantity;
    }
    return sum;
  }, 0);

  const delivery = 0; // This will be calculated on the checkout page
  const total = subtotal - saleDiscount - appliedDiscount + delivery;

  const handleApplyDiscount = () => {
    startTransition(async () => {
      const result = await applyDiscount(discountCode, subtotal);
      if (result.error) {
        toast.error(result.error);
        setAppliedDiscount(0);
      } else if (result.success) {
        toast.success(result.success);
        setAppliedDiscount(result.discountAmount || 0);
      }
    });
  };

  const handleCheckout = () => {
    // Navigate to embedded checkout page with discount info
    router.push(`/checkout?discountCode=${discountCode}&discountAmount=${appliedDiscount}`);
  };

  return (
    <div className="mx-auto px-7 space-y-1 lg:px-0 lg:mx-0">
      <div className="flex text-sm font-light justify-between">
        <p>Subtotal</p>
        <p>{formatPrice(subtotal)}</p>
      </div>

      <div className="flex text-sm font-light justify-between">
        <p>Sale Discount</p>
        <p className="text-red-500">- {formatPrice(saleDiscount)}</p>
      </div>
      
      {appliedDiscount > 0 && (
        <div className="flex text-sm font-light justify-between">
          <p>Coupon Discount</p>
          <p className="text-red-500">- {formatPrice(appliedDiscount)}</p>
        </div>
      )}

      <div className="flex text-sm font-light justify-between">
        <p>Delivery</p>
        <p>Calculated at checkout</p>
      </div>

      <div className="border-t border-gray-200 my-2"></div>

      {/* Discount Code Input */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
          placeholder="Discount code"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <Button onClick={handleApplyDiscount} disabled={isPending || !discountCode}>
          {isPending ? "Applying..." : "Apply"}
        </Button>
      </div>

      <div className="border-t border-gray-200 my-2"></div>

      <div className="flex text-sm justify-between font-semibold uppercase">
        <h1>Total</h1>
        <h1>{formatPrice(total)}</h1>
      </div>
      
      <Button 
        variant="cartBuyNow" 
        size={"cartBuyNow"} 
        className="mt-2" 
        onClick={handleCheckout}
        disabled={cartItems.length === 0}
      >
        Checkout
      </Button>
    </div>
  );
};

export default CartCheckOut;