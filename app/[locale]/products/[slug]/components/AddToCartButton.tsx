"use client";

import React, { useState, useCallback } from "react";
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

  // Use useCallback to memoize the handler and prevent unnecessary re-renders
  const handleClick = useCallback(async () => {
    if (isAdding || !productVariantId) return;

    setIsAdding(true);

    try {
      // Start the cart operation immediately for optimistic UI update
      const addToCartPromise = addToCartContext(productVariantId, quantity);
      
      // Show success toast immediately for better UX
      toast.custom(() => (
        <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
          <Check />
          <p className="font-semibold uppercase">
            {t("product.itemAddedToCart")}
          </p>
        </div>
      ));

      // Wait for the actual operation to complete
      await addToCartPromise;
      
    } catch (error) {
      console.log(error);
      // Show error toast and the cart context should handle reverting optimistic updates
      toast.error(t("product.addToCartError"));
    } finally {
      // Reset button state quickly for better responsiveness
      setTimeout(() => {
        setIsAdding(false);
      }, 100);
    }
  }, [isAdding, productVariantId, quantity, addToCartContext, t]);

  return (
    <Button
      variant={"cartAdd"}
      size={"cartAdd"}
      onClick={handleClick}
      disabled={isAdding || !productVariantId}
    >
      {isAdding ? t("product.adding") : t("product.addToCart")}
    </Button>
  );
}