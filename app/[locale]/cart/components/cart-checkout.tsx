"use client";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/cart-types";
import formatPrice from "@/utils/formatPrice";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  cartItems: CartItem[];
};

const CartCheckOut = ({ cartItems }: Props) => {
  const router = useRouter();
  const t = useTranslations("cartPage");

  const subtotal = cartItems.reduce((sum, item) => {
    const fullPrice = item.price;
    return sum + fullPrice * item.quantity;
  }, 0);

  const saleDiscount = cartItems.reduce((sum, item) => {
    const { price, salePrice } = item;
    if (salePrice && salePrice < price) {
      return sum + (price - salePrice) * item.quantity;
    }
    return sum;
  }, 0);

  const orderAmount = subtotal - saleDiscount;
  const total = orderAmount;

  return (
    <div className="mx-auto px-7 space-y-4 lg:px-0 lg:mx-0">
      <div className="space-y-1">
        <div className="flex text-sm font-light justify-between">
          <p>{t("subtotal")}</p>
          <p>{formatPrice(subtotal)}</p>
        </div>

        {saleDiscount > 0 && (
          <div className="flex text-sm font-light justify-between">
            <p>{t("saleDiscount")}</p>
            <p className="text-red-500">- {formatPrice(saleDiscount)}</p>
          </div>
        )}

        <div className="border-t border-gray-200 my-2"></div>

        <div className="flex text-sm justify-between font-semibold uppercase">
          <h1>{t("total")}</h1>
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
        {t("checkout")}
      </Button>
    </div>
  );
};

export default CartCheckOut;