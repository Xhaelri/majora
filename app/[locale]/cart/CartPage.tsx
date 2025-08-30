"use client";

import { useCart } from "@/context/CartContext";
import CartItemCard from "./components/CartItemCard";
import CartCheckOut from "./components/cart-checkout";
import { useTranslations } from "next-intl";

export default function CartPage() {
  const { items: cartItems, totalQuantity: count, isLoading, error } = useCart();
  const t = useTranslations("cartPage");

  console.log("CartPage Cart Items:", cartItems);

  if (isLoading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="mb-6 text-sm font-bold uppercase pt-6">
          {t("shoppingBag")} ({count})
        </h1>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-500 underline"
          >
             Try again
          </button>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="container">
        <h1 className="mb-6 text-sm font-bold uppercase pt-6">
          {t("shoppingBag")} ({count})
        </h1>
        <p>{t("emptyCart")}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="mb-6 text-sm font-bold uppercase pt-6">
        {t("shoppingBag")} ({count})
      </h1>

      <div className="lg:flex lg:justify-between lg:gap-5 lg:min-h-screen">
        <div className="lg:w-3/4">
          <div className="space-y-1 mb-6 lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-2 lg:justify-start lg:space-y-0 lg:mb-0">
            {cartItems.map((item) => (
              <CartItemCard key={item.variantId} item={item} />
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