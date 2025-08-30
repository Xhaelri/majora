import { CartItem } from "@/types/cart-types";
import formatPrice from "@/utils/formatPrice";
import Image from "next/image";
import React, { useState } from "react";
import Close from "@/public/assets/close.svg";
import Add from "@/public/assets/plus.svg";
import Reduce from "@/public/assets/minus.svg";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import Check from "@/public/assets/check.svg";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  item: CartItem;
}

const CartItemCard = ({ item }: Props) => {
  const { removeFromCartContext, updateQuantityContext } = useCart();
  const [isMutating, setIsMutating] = useState(false);
  const t = useTranslations("cartPage");
  const locale = useLocale();
  const isRTL = locale === "ar";

  // Get the first image from the variant
  const img = item.images?.[0];

  // Get product name based on locale
  const productName = isRTL && item.nameAr ? item.nameAr : item.name;

  // Size and color are stored directly in the variant
  const sizeName = item.size;
  const colorName = item.color;

  const handleRemoveFromCart = async () => {
    try {
      setIsMutating(true);
      await removeFromCartContext(item.variantId);
      toast.custom(() => (
        <div className="bg-black text-white w-full px-4 py-3 text-sm rounded-none flex items-center justify-center gap-2">
          <Check />
          <p className="font-semibold uppercase">{t("itemDeleted")}</p>
        </div>
      ));
    } catch (error) {
      console.log(error);
      toast.error(
        <p className="font-semibold uppercase">{t("failedToRemove")}</p>
      );
    } finally {
      setIsMutating(false);
    }
  };

  const handleAddQuantity = async () => {
    try {
      setIsMutating(true);
      await updateQuantityContext(item.variantId, item.quantity + 1);
    } catch (error) {
      console.log(error);
      toast.error(
        <p className="font-semibold uppercase">{t("failedToUpdate")}</p>
      );
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
      await updateQuantityContext(item.variantId, item.quantity - 1);
    } catch (error) {
      console.log(error);
      toast.error(
        <p className="font-semibold uppercase">{t("failedToUpdate")}</p>
      );
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
              src={img.startsWith('http') ? img : `/${img}`}
              alt={productName}
              fill
              className="object-cover"
            />
          )}
          <button
            className="cursor-pointer absolute top-2 right-2 hidden lg:block lg:bg-white/90 lg:p-1"
            onClick={handleRemoveFromCart}
            disabled={isMutating}
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
              {productName}
            </p>
            <button
              className="cursor-pointer absolute top-0 right-0 lg:hidden"
              onClick={handleRemoveFromCart}
              disabled={isMutating}
            >
              <Close />
            </button>
          </div>

          <div className="flex gap-3 text-sm lg:mt-1">
            <p className={`${item.salePrice && "line-through"}`}>
              {formatPrice(item.price)}
            </p>
            {item.salePrice && (
              <p className="text-red-500">{formatPrice(item.salePrice)}</p>
            )}
          </div>

          {/* Bottom row for controls and details */}
          <div className="flex gap-5 lg:gap-3 items-center lg:items-stretch mt-4 lg:mt-2">
            {/* Quantity Selector */}
            <div className="flex gap-4 items-center lg:justify-start lg:order-1">
              <button
                className={`${
                  isMutating
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={handleReduceQuantity}
                disabled={isMutating}
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
                disabled={isMutating}
              >
                <Add />
              </button>
            </div>

            {/* Size and Color */}
            <div className="flex gap-3 lg:gap-3 text-sm text-muted-foreground lg:justify-end lg:order-2 lg:mt-0">
              <p>{sizeName}</p>
              <p>{colorName}</p>
            </div>
          </div>

          {/* Stock indicator (optional) */}
          {item.stock < 5 && item.stock > 0 && (
            <div className="mt-2">
              <p className="text-xs text-orange-600">
                {t("lowStock", { count: item.stock })}
              </p>
            </div>
          )}

          {item.stock === 0 && (
            <div className="mt-2">
              <p className="text-xs text-red-600">
                {t("outOfStock")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;