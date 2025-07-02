"use client";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/server/actions/cart";
import { useCart } from "@/context/CartContext";
import { useTransition } from "react";
import { toast } from "sonner";

export function AddToCartButton({
  productVariantId,
  quantity = 1,
}: {
  productVariantId: string;
  quantity?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const { refreshCart } = useCart();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await addToCart(productVariantId, quantity);
        if (result.success) {
          toast.success("Item added to cart!");
          refreshCart(); // Refresh the global cart state
        } else {
           toast.error("Failed to add item. Please try again.");
        }
      } catch (err) {
        console.error("Failed to add to cart:", err);
        toast.error("Failed to add item to cart. Please try again.");
      }
    });
  };

  return (
    <Button
      variant={"cartAdd"}
      size={"cartAdd"}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Adding..." : "Add to Cart"}
    </Button>
  );
}