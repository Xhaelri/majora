"use client";

import { useCart } from "@/context/CartContext";
import CartItemCard from "./_components/CartItemCard";
import CheckOut from "./_components/CheckOut";
import useMediaQuery from "@/hooks/useMediaQuery";

export default function CartPage() {
  const { items: cartItems, count } = useCart();
  const isDesktop = useMediaQuery("(min-width:1024px)");

  console.log(cartItems);
  return (
    <div className="container">
      <h1 className=" mb-6 text-sm font-bold uppercase pt-6">
        Shopping Bag ({count})
      </h1>

      {count === 0 ? (
        <p>Your cart is empty</p>
      ) : isDesktop ? (
        <div className="flex justify-between gap-5 min-h-screen">
          <div className="w-3/4">
            <div className="grid grid-cols-3 grid-rows-2 gap-2 justify-start">
              {cartItems.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div className="w-1/4">
            <div className="sticky top-20">
              <CheckOut cartItems={cartItems} />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="space-y-1 mb-6">
            {cartItems.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}
          </div>
          <CheckOut cartItems={cartItems} />
        </div>
      )}
    </div>
  );
}
