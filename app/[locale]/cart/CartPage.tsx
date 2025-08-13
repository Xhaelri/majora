"use client";

import { useCart } from "@/context/CartContext";
import CartItemCard from "./components/CartItemCard";
import CartCheckOut from "./components/cart-checkout";
import { useTranslations } from "next-intl";

export default function CartPage() {
  const { items: cartItems, count } = useCart();
  const t = useTranslations("cartPage");

  console.log("CartPage Cart Items:", cartItems); // Debugging log

  if (count === 0) {
    return (
      <div className="container">
        <h1 className="mb-6 text-sm font-bold uppercase pt-6">
          {t('shoppingBag')} ({count})
        </h1>
        <p>{t('emptyCart')}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-6 text-sm font-bold uppercase pt-6">
        {t('shoppingBag')} ({count})
      </h1>

      <div className="lg:flex lg:justify-between lg:gap-5 lg:min-h-screen">
        <div className="lg:w-3/4">
          <div className="space-y-1 mb-6 lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-2 lg:justify-start lg:space-y-0 lg:mb-0">
            {cartItems.map((item) => (
              <CartItemCard key={item.productVariantId} item={item} />
            ))}
          </div>
        </div>
        <div className="lg:w-1/4">
          <div className="lg:sticky lg:top-20">
            <CartCheckOut cartItems={cartItems} />
          </div>
        </div>
      </div>
    </div>
  );
}