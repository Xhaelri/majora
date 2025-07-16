"use client";
import Check from "@/public/assets/check.svg";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function AddToCartButton({
  productVariantId,
  quantity = 1,
}: {
  productVariantId: string;
  quantity?: number;
}) {
  const { addToCartOptimistic, isMutating } = useCart(); 

  const handleClick = async () => {
      try {
        await addToCartOptimistic(productVariantId, quantity);

        // Show success toast
        toast.custom(() => (
          <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
            <Check />
            <p className="font-semibold uppercase">
              Item added to shopping bag
            </p>
          </div>
        ));
      } catch (error) {
        console.log(error);
        toast.error("Failed to add item to cart. Please try again.");
      }
  };

  return (
    <Button
      variant={"cartAdd"}
      size={"cartAdd"}
      onClick={handleClick}
      disabled={isMutating} 
    >
      {isMutating ? "Adding..." : "Add to Cart"}
    </Button>
  );
}