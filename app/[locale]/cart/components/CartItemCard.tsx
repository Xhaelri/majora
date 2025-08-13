import { CartItemWithVariant } from "@/types/product";
import formatPrice from "@/utils/formatPrice";
import Image from "next/image";
import React, { useState } from "react";
import Close from "@/public/assets/close.svg";
import Add from "@/public/assets/plus.svg";
import Reduce from "@/public/assets/minus.svg";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Check from "@/public/assets/check.svg";

type Props = {
  item: CartItemWithVariant;
};

const CartItemCard = ({ item }: Props) => {
  const { removeFromCartContext, updateQuantityContext } = useCart();
  const [isMutating, setIsMutating] = useState(false);

  if (!item.productVariant) {
    console.log("Product variant not found");
  }
  const img = item.productVariant.images?.[0];
  
  const handleRemoveFromCart = async () => {
    try {
      setIsMutating(true);
      await removeFromCartContext(item.productVariantId);
      toast.custom(() => (
        <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
          <Check />
          <p className="font-semibold uppercase">Item deleted</p>
        </div>
      ));
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove item. Please try again.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleAddQuantity = async () => {
    try {
      setIsMutating(true);
      await updateQuantityContext(item.productVariantId, item.quantity + 1);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update quantity. Please try again.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleReduceQuantity = async () => {
    if (item.quantity === 1) {
      handleRemoveFromCart();
      return;
    }

    try {
      setIsMutating(true);
      await updateQuantityContext(item.productVariantId, item.quantity - 1);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update quantity. Please try again.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="w-full flex lg:flex-col gap-4 lg:gap-0 relative lg:max-w-xs">
      {/* Image container */}
      <div className="w-1/3 lg:w-full flex-shrink-0 lg:flex-shrink">
        <div className="relative aspect-[2/3]">
          {img && (
            <Image
              src={img.url.trimStart()}
              alt={img.altText}
              fill
              className="object-cover"
            />
          )}
          <button
            className="cursor-pointer absolute top-2 right-2 hidden lg:block lg:bg-white/90 lg:p-1"
            onClick={handleRemoveFromCart}
          >
            <Close />
          </button>
        </div>
      </div>

      {/* Info container */}
      <div className="flex-grow lg:flex-grow-0 flex flex-col justify-end lg:justify-start lg:p-3 relative">
        <div>
          <div className="flex justify-between items-start lg:block">
            <p className="text-sm font-medium pr-4 lg:pr-0 line-clamp-1">
              {item.productVariant.product.name}
            </p>
            <button
              className="cursor-pointer absolute top-0 right-0 lg:hidden"
              onClick={handleRemoveFromCart}
            >
              <Close />
            </button>
          </div>

          <div className="flex gap-3 text-sm lg:mt-1">
            <p
              className={`${
                item.productVariant.product.salePrice && "line-through"
              }`}
            >
              {formatPrice(item.productVariant.product.price)}
            </p>
            {item.productVariant.product.salePrice && (
              <p className="text-red-500">
                {formatPrice(item.productVariant.product.salePrice)}
              </p>
            )}
          </div>

          {/* Bottom row for controls and details */}
          <div className="flex  gap-5 lg:gap-3 items-center lg:items-stretch mt-4 lg:mt-2">
            {/* Quantity Selector */}
            <div className="flex gap-4 items-center lg:justify-start lg:order-1">
              <button
                className={`${
                  isMutating
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={handleReduceQuantity}
              >
                <Reduce />
              </button>
              <span className="text-sm text-center w-4 lg:w-4">
                {item.quantity}
              </span>
              <button
                className={`${
                  isMutating
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={handleAddQuantity}
              >
                <Add />
              </button>
            </div>

            {/* Size and Color */}
            <div className="flex gap-3 lg:gap-3 text-sm text-muted-foreground lg:justify-end lg:order-2 lg:mt-0  ">
              <p>{item.productVariant.size.name}</p>
              <p>{item.productVariant.color.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
