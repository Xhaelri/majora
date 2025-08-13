"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale } from "next-intl";

export default function CartIcon() {
  const { count } = useCart();

  const locale = useLocale();
  const isRTL = locale === "ar";
  return (
    <div className="relative">
      <Link href={"/cart"}>
        <Image
          src={"/assets/cart.svg"}
          alt="Cart-icon"
          width={"20"}
          height={"10"}
          className="hover:text-gray-700 hoverEffect cursor-pointer"
        />
      </Link>
      {count > 0 && (
        <div
          className={`absolute -bottom-2 ${
            isRTL ? "right-2" : "-right-2"
          } -right-2 bg-red-500 text-white text-[8px] font-light rounded-full min-w-4 max-w-4 w-4 h-4 flex items-center justify-center p-1`}
        >
          {count > 99 ? "99+" : count}
        </div>
      )}
    </div>
  );
}
