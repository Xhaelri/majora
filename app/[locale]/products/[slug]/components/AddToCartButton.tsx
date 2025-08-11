// AddToCartButton.tsx

"use client";
// CHANGE 1: Import useState and useEffect to manage local state.
import React, { useState } from "react";
import Check from "@/public/assets/check.svg";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function AddToCartButton({
  productVariantId,
  quantity = 1,
}: {
  productVariantId: string;
  quantity?: number;
}) {
  const t = useTranslations();
  const { addToCartContext } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = () => {
    if (isAdding) return;

    setIsAdding(true);

    try {
      addToCartContext(productVariantId, quantity);
      toast.custom(() => (
        <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
          <Check />
          <p className="font-semibold uppercase">
            {t("product.itemAddedToCart")}
          </p>
        </div>
      ));
    } catch (error) {
      console.log(error);
      toast.error(t("product.addToCartError"));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      variant={"cartAdd"}
      size={"cartAdd"}
      onClick={handleClick}
      disabled={isAdding}
    >
      {isAdding ? t("product.adding") : t("product.addToCart")}
    </Button>
  );
}
