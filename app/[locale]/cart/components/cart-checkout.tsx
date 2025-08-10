// checkout/components/checkout-button.tsx (Fixed version)
import { Button } from "@/components/ui/button";
import { CartItemWithVariant } from "@/types/product";
import formatPrice from "@/utils/formatPrice";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyDiscount } from "@/server/actions/checkout-actions";
import { toast } from "sonner";

type Props = {
  cartItems: CartItemWithVariant[];
};

interface AppliedDiscount {
  code: string;
  amount: number;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
}

const CartCheckOut = ({ cartItems }: Props) => {
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
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

  const orderAmount = subtotal - saleDiscount;
  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const delivery = 0; // This will be calculated on the checkout page
  const total = orderAmount - discountAmount + delivery;

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    startTransition(async () => {
      try {
        const result = await applyDiscount(discountCode, orderAmount);
        
        if (!result) {
          toast.error("Failed to apply discount code - no response");
          setAppliedDiscount(null);
          return;
        }
        
        if (result.error) {
          toast.error(result.error);
          setAppliedDiscount(null);
        } else if (result.success && result.discountAmount && result.discountCode) {
          toast.success(result.success);
          setAppliedDiscount({
            code: result.discountCode,
            amount: result.discountAmount,
            type: 'FIXED',
            value: result.discountAmount
          });
        } else {
          toast.error("Unexpected response format");
          setAppliedDiscount(null);
          console.error("Unexpected discount result:", result);
        }
      } catch (error) {
        console.error("Discount application error:", error);
        toast.error("Failed to apply discount code");
        setAppliedDiscount(null);
      }
    });
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    toast.success("Discount code removed");
  };

  const handleCheckout = () => {
    // Pass the discount code as URL parameter so checkout page can use it
    const url = appliedDiscount 
      ? `/checkout?discount=${encodeURIComponent(appliedDiscount.code)}`
      : '/checkout';
    
    router.push(url);
  };

  return (
    <div className="mx-auto px-7 space-y-4 lg:px-0 lg:mx-0">
      {/* Discount Code Section */}
      {/* <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium mb-3">Discount Code</h3>
        
        {!appliedDiscount ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Enter discount code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPending}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleApplyDiscount();
                }
              }}
            />
            <Button 
              onClick={handleApplyDiscount} 
              disabled={isPending || !discountCode.trim()}
              size="sm"
            >
              {isPending ? "Applying..." : "Apply"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <div>
              <span className="text-sm font-medium text-green-800">
                &quot;{appliedDiscount.code}&quot; applied
              </span>
              <p className="text-xs text-green-600">
                You saved {formatPrice(appliedDiscount.amount)}
              </p>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        )}
      </div> */}

      {/* Price Breakdown */}
      <div className="space-y-1">
        <div className="flex text-sm font-light justify-between">
          <p>Subtotal</p>
          <p>{formatPrice(subtotal)}</p>
        </div>

        {saleDiscount > 0 && (
          <div className="flex text-sm font-light justify-between">
            <p>Sale Discount</p>
            <p className="text-red-500">- {formatPrice(saleDiscount)}</p>
          </div>
        )}
        
        {/* {discountAmount > 0 && (
          <div className="flex text-sm font-light justify-between">
            <p>Coupon Discount</p>
            <p className="text-red-500">- {formatPrice(discountAmount)}</p>
          </div>
        )} */}

        {/* <div className="flex text-sm font-light justify-between">
          <p>Delivery</p>
          <p>Calculated at checkout</p>
        </div> */}

        <div className="border-t border-gray-200 my-2"></div>

        <div className="flex text-sm justify-between font-semibold uppercase">
          <h1>Total</h1>
          <h1>{formatPrice(total)}</h1>
        </div>
      </div>
      
      <Button 
        variant="cartBuyNow" 
        size={"cartBuyNow"} 
        className="mt-4" 
        onClick={handleCheckout}
        disabled={cartItems.length === 0}
      >
        Checkout
      </Button>

    </div>
  );
};

export default CartCheckOut;