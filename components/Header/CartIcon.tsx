'use client'

import React from "react";
import Cart from "@/assets/cart.svg";
import { useCart } from "@/context/CartContext";
import Link from "../Link/Link";

export default function CartIcon() {
  const { count } = useCart();

  return (
    <div className="relative">
      <Link href={"/cart"}>
        <Cart className="hover:text-gray-700 hoverEffect cursor-pointer" />
      </Link>
      {count > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  );
}