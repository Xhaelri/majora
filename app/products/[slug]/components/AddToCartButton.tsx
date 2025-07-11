"use client";
import Check from "@/public/assets/check.svg";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/server/actions/cart";
import { useCart } from "@/context/CartContext";
import { useTransition } from "react";
import { toast } from "sonner";

export default function AddToCartButton({
  productVariantId,
  quantity = 1,
}: {
  productVariantId: string;
  quantity?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const { optimisticAddToCart, refreshCart } = useCart();

  const handleClick = () => {
    // Immediately update the UI optimistically
    optimisticAddToCart(productVariantId, quantity);
    
    // Show success toast immediately for better UX
    toast.custom(() => (
      <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
        <Check />
        <p className="font-semibold uppercase">
          Item added to shopping bag
        </p>
      </div>
    ));

    // Then perform the server action
    startTransition(async () => {
      try {
        const result = await addToCart(productVariantId, quantity);
        if (result.success) {
          // Refresh cart data from server to ensure consistency
          // This happens in the background after optimistic update
          refreshCart();
        } else {
          // If server action fails, refresh to revert optimistic update
          refreshCart();
          toast.error("Failed to add item. Please try again.");
        }
      } catch (err) {
        console.error("Failed to add to cart:", err);
        // Refresh to revert optimistic update on error
        refreshCart();
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