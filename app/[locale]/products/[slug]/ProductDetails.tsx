"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import AvailabilityPing from "@/components/ui-custom/Availability";
import { FullProduct } from "@/types/product";
import formatPrice from "@/utils/formatPrice";
import ProductDetailsCarousel from "./components/ProductDetailsCarousel";
import AddToCartButton from "./components/AddToCartButton";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import BuyNowButton from "./components/BuyNowButton";

type Image = {
  url: string;
  altText: string;
  altTextAr?: string | null;
};

type Variant = {
  id: string;
  stock: number;
  size: { id: string; name: string; nameAr?: string | null };
  color: { id: string; name: string; nameAr?: string | null };
  images?: Image[]; // Make images optional to avoid undefined errors
};

type Props = {
  product: FullProduct;
};

const ProductDetails = ({ product }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Effect to initialize state and sync FROM the URL (e.g., on load or back/forward)
  useEffect(() => {
    const variantId = searchParams.get("variant");
    let initialVariant: Variant | undefined;

    if (variantId) {
      initialVariant = product.variants.find(
        (v: { id: string }) => v.id === variantId
      );
    }

    // If no valid variant in URL, find the first available one
    if (!initialVariant) {
      initialVariant = product.variants.find(
        (v: { stock: number }) => v.stock > 0
      );
    }

    // If all are out of stock, default to the first variant
    if (!initialVariant && product.variants.length > 0) {
      initialVariant = product.variants[0];
    }

    if (initialVariant) {
      setSelectedVariant(initialVariant);
    }
  }, [product.variants, searchParams]);

  // Effect to sync state TO the URL when the user makes a selection
  useEffect(() => {
    if (selectedVariant && selectedVariant.id !== searchParams.get("variant")) {
      router.replace(`?variant=${selectedVariant.id}`, { scroll: false });
    }
  }, [selectedVariant, router, searchParams]);

  // Memoize derived values for performance
  const uniqueSizes = useMemo<Variant["size"][]>(
    () =>
      Array.from(
        new Map(
          product.variants.map((v: Variant) => [v.size.id, v.size])
        ).values()
      ) as Variant["size"][],
    [product.variants]
  );

  const getAvailableColorsForSize = (sizeId: string): Variant["color"][] =>
    Array.from(
      new Map(
        product.variants
          .filter((v: Variant) => v.size.id === sizeId)
          .map((v: Variant) => [v.color.id, v.color])
      ).values()
    ) as Variant["color"][];

  const handleSizeClick = (sizeId: string) => {
    const variant =
      product.variants.find(
        (v: {
          size: { id: string };
          color: { id: string | undefined };
          stock: number;
        }) =>
          v.size.id === sizeId &&
          v.color.id === selectedVariant?.color.id &&
          v.stock > 0
      ) ||
      product.variants.find(
        (v: { size: { id: string }; stock: number }) =>
          v.size.id === sizeId && v.stock > 0
      );

    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleColorClick = (colorId: string) => {
    const variant = product.variants.find(
      (v: {
        color: { id: string };
        size: { id: string | undefined };
        stock: number;
      }) =>
        v.color.id === colorId &&
        v.size.id === selectedVariant?.size.id &&
        v.stock > 0
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  // Derive images and price from the current state
  const imagesForCarousel = selectedVariant?.images ?? [];
  const discountAmount = product.salePrice
    ? product.price - product.salePrice
    : 0;

  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section className="container pt-0 lg:py-20">
      <div className="flex flex-col lg:flex-row items-center justify-center lg:items-start ">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 100 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-1/2 flex"
        >
          <ProductDetailsCarousel images={imagesForCarousel} />
        </motion.div>
        <div className="w-full lg:w-1/2">
          <h1 className="text-4xl font-extralight tracking-widest text-center lg:text-start">
            {isRTL && product.nameAr ? product.nameAr : product.name}
          </h1>
          <div className="flex flex-col items-center lg:items-start lg:flex-row gap-0 lg:gap-5 pt-5">
            <div className="flex gap-5">
              {product.salePrice && (
                <h2 className="line-through text-nowrap text-lg">
                  {formatPrice(product.price)}
                </h2>
              )}
              <h2 className="text-nowrap text-lg">
                {formatPrice(product.salePrice ?? product.price)}
              </h2>
            </div>
            {product.salePrice && (
              <h2 className="text-red-500 text-nowrap text-lg">
                {t("product.save")} {formatPrice(discountAmount)}
              </h2>
            )}
          </div>

          {/* Variant Selection UI */}
          <div className="flex flex-col items-center lg:items-start gap-5 pt-15">
            <div className="flex flex-col items-center lg:items-start">
              <h1 className="text-lg tracking-widest font-extralight uppercase py-5">
                {t("product.size")}
              </h1>
              <div className="space-x-3">
                {uniqueSizes.map((size: Variant["size"]) => {
                  const isDisabled = !product.variants.some(
                    (v: Variant) => v.size.id === size.id && v.stock > 0
                  );
                  return (
                    <Button
                      key={size.id}
                      variant="stock"
                      size="stock"
                      onClick={() => handleSizeClick(size.id)}
                      className={`${
                        selectedVariant?.size.id === size.id
                          ? "bg-foreground text-secondary"
                          : ""
                      } ${isRTL ? "w-fit" : ""}`}
                      disabled={isDisabled}
                    >
                      {isRTL && size.nameAr ? size.nameAr : size.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {selectedVariant?.size && (
              <div className="flex flex-col items-center lg:items-start">
                <h1 className="text-lg tracking-widest font-extralight uppercase py-5">
                  {t("product.color")}
                </h1>
                <div className="space-x-3">
                  {getAvailableColorsForSize(selectedVariant.size.id).map(
                    (color: Variant["color"]) => {
                      const isDisabled = !product.variants.some(
                        (v: Variant) =>
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
                          className={
                            selectedVariant?.color.id === color.id
                              ? "bg-foreground text-secondary"
                              : ""
                          }
                          disabled={isDisabled}
                        >
                          {isRTL && color.nameAr ? color.nameAr : color.name}
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {selectedVariant && (
              <div className="pt-5 lg:ps-1 text-md text-muted-foreground">
                {selectedVariant.stock < 5 && selectedVariant.stock > 0 ? (
                  <span className="flex items-center gap-2 text-primary">
                    <AvailabilityPing available={false} />
                    {t("product.lowStock")} – {selectedVariant.stock}{" "}
                    {t("product.item")}
                    {selectedVariant.stock === 1 ? "" : t("product.items")}{" "}
                    {t("product.left")}
                  </span>
                ) : selectedVariant.stock > 0 ? (
                  <div className="flex items-center gap-2">
                    <AvailabilityPing available={true} />
                    <span className="text-primary">
                      {t("product.inStockReady")}
                    </span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-5">
            {(selectedVariant?.stock ?? 0) > 0 ? (
              <AddToCartButton productVariantId={selectedVariant?.id || ""} />
            ) : (
              <Button variant={"cartAdd"} size={"cartAdd"} disabled>
                {t("product.soldOut")}
              </Button>
            )}
          </div>
          <div className="pt-5">
            {(selectedVariant?.stock ?? 0) > 0 && (
              // In your ProductDetails component, replace the BuyNowButton usage with:

              <div className="pt-5">
                {(selectedVariant?.stock ?? 0) > 0 && (
                  <BuyNowButton
                    productVariantId={selectedVariant?.id || null}
                    quantity={1}
                    disabled={selectedVariant?.stock == 0}
                    className="flex-1"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
