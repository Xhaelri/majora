import { Button } from "@/components/ui/button";
import { CartItemWithVariant } from "@/types/product";
import formatPrice from "@/utils/formatPrice";
import { useRouter } from "next/navigation";

type Props = {
  cartItems: CartItemWithVariant[];
};

const CartCheckOut = ({ cartItems }: Props) => {
  const router = useRouter();

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
  const total = orderAmount;

  return (
    <div className="mx-auto px-7 space-y-4 lg:px-0 lg:mx-0">
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
        onClick={() => router.push("/checkout")}
        disabled={cartItems.length === 0}
      >
        Checkout
      </Button>
    </div>
  );
};

export default CartCheckOut;
