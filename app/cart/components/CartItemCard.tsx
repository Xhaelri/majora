import { CartItemWithVariant } from "@/types/product";
import formatPrice from "@/utils/formatPrice";
import Image from "next/image";
import React, { useState } from "react";
import Close from "@/public/assets/close.svg";
import Add from "@/public/assets/plus.svg";
import Reduce from "@/public/assets/minus.svg";
import { removeFromCart, updateCartItemQuantity } from "@/server/actions/cart";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Check from "@/public/assets/check.svg";
import useMediaQuery from "@/hooks/useMediaQuery";

type Props = {
  item: CartItemWithVariant;
};

const CartItemCard = ({ item }: Props) => {
  const { refreshCart } = useCart();
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const [loading, setLoading] = useState(false);

  const img = item.productVariant.images?.[0];

  const handleRemoveFromCart = async () => {
    await removeFromCart(item.productVariantId);
    refreshCart();
    toast.custom(() => (
      <div className="bg-black lg text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
        <Check />
        <p className="font-semibold uppercase">Item deleted</p>
      </div>
    ));
  };

  const handleAddQuantity = async () => {
    setLoading(true);
    await updateCartItemQuantity(item.productVariantId, item.quantity + 1);
    await refreshCart();
    setLoading(false);
  };

  const handleReduceQuantity = async () => {
    if (item.quantity === 1) {
      handleRemoveFromCart();
      return;
    }
    setLoading(true);
    await updateCartItemQuantity(item.productVariantId, item.quantity - 1);
    await refreshCart();
    setLoading(false);
  };

  return (
    <>
      {isDesktop ? (
        <div key={item.id} className="relative w-full max-w-xs flex flex-col">
          {/* Image container */}
          <div className="relative w-full aspect-[2/3]">
            {img && (
              <Image
                src={img.url.trimStart()}
                alt={img.altText}
                fill
                className="object-cover"
              />
            )}
            <button
              className="cursor-pointer absolute top-2 right-2 bg-white/90 p-1"
              onClick={handleRemoveFromCart}
            >
              <Close />
            </button>
          </div>

          {/* Info container */}
          <div className="flex flex-col p-3">
            <p className="text-sm font-medium">
              {item.productVariant.product.name}
            </p>

            <div className="flex gap-3 text-sm mt-1">
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
            <div className="flex items-center justify-between mt-2">
              {/* Quantity Selector */}
              <div className="flex gap-4 items-center">
                <button
                  disabled={loading}
                  className={`${
                    loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                  onClick={handleReduceQuantity}
                >
                  <Reduce />
                </button>
                <span className="text-sm text-center w-4">{item.quantity}</span>
                <button
                  disabled={loading}
                  className={`${
                    loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                  onClick={handleAddQuantity}
                >
                  <Add />
                </button>
              </div>

              {/* Size and Color */}
              <div className="flex gap-3 text-sm text-muted-foreground">
                <p>{item.productVariant.size.name}</p>
                <p>{item.productVariant.color.name}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div key={item.id} className="w-full flex gap-4 relative">
          {/* Image container */}
          <div className="w-1/3 lg:w-[150px] flex-shrink-0">
            <div className="relative aspect-[2/3]">
              {img && (
                <Image
                  src={img.url.trimStart()}
                  alt={img.altText}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {/* Info container */}
          <div className="flex-grow flex flex-col justify-end relative">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium pr-4">
                  {item.productVariant.product.name}
                </p>
                <button
                  className="cursor-pointer absolute top-0 right-0"
                  onClick={handleRemoveFromCart}
                >
                  <Close />
                </button>
              </div>
              <div className="flex gap-3 text-sm">
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
              <div className="flex gap-5 items-center mt-4">
                <button
                  disabled={loading}
                  className={`${
                    loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                  onClick={handleReduceQuantity}
                >
                  <Reduce />
                </button>
                <span className="text-sm text-center w-6">{item.quantity}</span>
                <button
                  disabled={loading}
                  className={`${
                    loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                  onClick={handleAddQuantity}
                >
                  <Add />
                </button>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                <p>{item.productVariant.size.name}</p>
                <p>{item.productVariant.color.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartItemCard;
