// @/app/products/[slug]/components/ProductVariants.tsx

"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvailabilityPing from "@/components/ui-custom/Availability";
import  AddToCartButton  from "./AddToCartButton";

type Image = {
  url: string;
  altText: string;
};

type Variant = {
  id: string;
  stock: number;
  size: { id: string; name: string };
  color: { id: string; name: string };
  images: Image[];
};

type Props = {
  variants: Variant[];
  onVariantChange: (images: Image[]) => void;
};

const ProductVariants = ({ variants, onVariantChange }: Props) => {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const imagesByColor = React.useMemo(() => {
    const map = new Map<string, Image[]>();
    variants.forEach((variant) => {
      if (!map.has(variant.color.id) && variant.images.length > 0) {
        map.set(variant.color.id, variant.images);
      }
    });
    return map;
  }, [variants]);

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
    const initialVariant = variants.find((v) => v.stock > 0);
    if (initialVariant) {
      setSelectedVariant(initialVariant);
    }
  }, [variants]);

  useEffect(() => {
    if (selectedVariant) {
      router.replace(`?variant=${selectedVariant.id}`, { scroll: false });
      const newImages = imagesByColor.get(selectedVariant.color.id);
      if (newImages) {
        onVariantChange(newImages);
      }
    }
  }, [selectedVariant, router, onVariantChange, imagesByColor]);

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
          <AddToCartButton productVariantId={selectedVariant?.id || ""} />
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
