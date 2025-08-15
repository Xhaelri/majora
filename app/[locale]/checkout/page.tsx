// checkout/page.tsx
import React from "react";
import Checkout from "./components/CheckOut";
import { getCartDataForAuthUser } from "../../../server/actions/cart";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const { count } = await getCartDataForAuthUser();

  // Redirect to cart if empty
  if (count === 0) {
    redirect("/cart");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Checkout />
      </div>
    </div>
  );
}
