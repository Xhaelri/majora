"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvailabilityPing from "@/components/ui custom/Availability";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addItemToCart } from "@/redux/slices/cartSlice";
import { CartProductVariant } from "@/types/cartTypes";
import { RootState } from "@/redux/store";

type Variant = CartProductVariant;
// if we need anything else for the variant we should include in the prisma function
type Props = {
  variants: Variant[];
};

const ProductVariants = ({ variants }: Props) => {
  const router = useRouter();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const uniqueSizes = Array.from(
    new Map(variants.map((v) => [v.size.id, v.size])).values()
  );

  const getAvailableColorsForSize = (sizeId: string) =>
    Array.from(
      new Map(
        variants
          .filter((v) => v.size.id === sizeId)
          .map((v) => [v.color.id, v.color])
      ).values()
    );

  useEffect(() => {
    const initialVariant =
      variants.find((v) => v.colorId === "1" && v.stock > 0) ||
      variants.find((v) => v.stock > 0);

    if (initialVariant) {
      setSelectedVariant(initialVariant);
    }
  }, []);

  useEffect(() => {
    if (selectedVariant) {
      router.replace(`?variant=${selectedVariant.id}`, { scroll: false });
    }
  }, [selectedVariant, router]);

  const handleSizeClick = (sizeId: string) => {
    const variant =
      variants.find(
        (v) =>
          v.size.id === sizeId &&
          v.color.id === selectedVariant?.color.id &&
          v.stock > 0
      ) || variants.find((v) => v.size.id === sizeId && v.stock > 0);

    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleColorClick = (colorId: string) => {
    const variant =
      variants.find(
        (v) =>
          v.color.id === colorId &&
          v.size.id === selectedVariant?.size.id &&
          v.stock > 0
      ) || variants.find((v) => v.color.id === colorId && v.stock > 0);

    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const handleAddToCart = () => {
    if (selectedVariant) {
      dispatch(addItemToCart({ productVariant: selectedVariant }));
    }
  };

  console.log(cartItems);

  return (
    <>
      <div className="flex flex-col items-center md:items-start gap-5 pt-15">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-lg tracking-widest font-extralight uppercase py-5">
            Size
          </h1>
          <div className="space-x-3">
            {uniqueSizes.map((size) => {
              const isDisabled = !variants.some(
                (v) => v.size.id === size.id && v.stock > 0
              );
              return (
                <Button
                  key={size.id}
                  variant="stock"
                  size="stock"
                  onClick={() => handleSizeClick(size.id)}
                  className={` ${
                    selectedVariant?.size.id === size.id
                      ? "bg-foreground text-secondary"
                      : ""
                  }`}
                  disabled={isDisabled}
                >
                  {size.name}
                </Button>
              );
            })}
          </div>
        </div>

        {selectedVariant?.size && (
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-lg tracking-widest font-extralight uppercase py-5">
              Color
            </h1>
            <div className="space-x-3">
              {getAvailableColorsForSize(selectedVariant.size.id)
                .sort()
                .map((color) => {
                  const isDisabled = !variants.some(
                    (v) =>
                      v.size.id === selectedVariant.size.id &&
                      v.color.id === color.id &&
                      v.stock > 0
                  );
                  return (
                    <Button
                      key={color.id}
                      variant="color"
                      size="color"
                      onClick={() => handleColorClick(color.id)}
                      className={` ${
                        selectedVariant?.color.id === color.id
                          ? "bg-foreground text-secondary"
                          : ""
                      }`}
                      disabled={isDisabled}
                    >
                      {color.name}
                    </Button>
                  );
                })}
            </div>
          </div>
        )}

        {selectedVariant && (
          <div className="pt-5 md:ps-1 text-md text-muted-foreground">
            {selectedVariant.stock < 5 ? (
              <span className="flex items-center gap-2 text-primary">
                <AvailabilityPing available={false} />
                Low Stock – {selectedVariant.stock} item
                {selectedVariant.stock === 1 ? "" : "s"} left
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <AvailabilityPing available={true} />
                <span className="text-primary">In stock, ready to ship</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="pt-5">
        {(selectedVariant?.stock ?? 0) > 0 ? (
          <Button
            variant={"cartAdd"}
            size={"cartAdd"}
            onClick={handleAddToCart}
          >
            ADD TO CART
          </Button>
        ) : (
          <Button variant={"cartAdd"} size={"cartAdd"} disabled>
            SOLD OUT
          </Button>
        )}
      </div>
      <div className="pt-5">
        {(selectedVariant?.stock ?? 0) > 0 && (
          <Button variant={"cartBuyNow"} size={"cartBuyNow"}>
            BUY IT NOW
          </Button>
        )}
      </div>
    </>
  );
};

export default ProductVariants;
