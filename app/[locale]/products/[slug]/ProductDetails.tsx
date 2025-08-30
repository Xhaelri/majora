"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import AvailabilityPing from "@/components/ui-custom/Availability";
import formatPrice from "@/utils/formatPrice";
import ProductDetailsCarousel from "./components/ProductDetailsCarousel";
import AddToCartButton from "./components/AddToCartButton";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import BuyNowButton from "./components/BuyNowButton";
import { FullProduct } from "@/types/product-types";

type ProductVariant = FullProduct["variants"][0];

type Props = {
  product: FullProduct;
};

const ProductDetails = ({ product }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>();

  useEffect(() => {
    const variantId = searchParams.get("variant");
    let initialVariant: ProductVariant | undefined;

    if (variantId) {
      initialVariant = product.variants.find((v) => v.id === variantId);
    }

    if (!initialVariant) {
      initialVariant = product.variants.find((v) => v.stock > 0);
    }

    if (!initialVariant && product.variants.length > 0) {
      initialVariant = product.variants[0];
    }

    if (initialVariant) {
      setSelectedVariant(initialVariant);
    }
  }, [product.variants, searchParams]);

  useEffect(() => {
    if (selectedVariant && selectedVariant.id !== searchParams.get("variant")) {
      router.replace(`?variant=${selectedVariant.id}`, { scroll: false });
    }
  }, [selectedVariant, router, searchParams]);

  // Get unique sizes from variants (now working with string values)
  const uniqueSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    product.variants.forEach(variant => {
      sizeSet.add(variant.size);
    });
    return Array.from(sizeSet);
  }, [product.variants]);

  // Get available colors for a specific size
  const getAvailableColorsForSize = (size: string) => {
    const colorSet = new Set<string>();
    product.variants
      .filter((v) => v.size === size)
      .forEach(variant => {
        colorSet.add(variant.color);
      });
    return Array.from(colorSet);
  };

  const handleSizeClick = (size: string) => {
    const variant =
      product.variants.find(
        (v) =>
          v.size === size &&
          v.color === selectedVariant?.color &&
          v.stock > 0
      ) || product.variants.find((v) => v.size === size && v.stock > 0);

    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleColorClick = (color: string) => {
    const variant = product.variants.find(
      (v) =>
        v.color === color &&
        v.size === selectedVariant?.size &&
        v.stock > 0
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  };

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
                {uniqueSizes.map((size) => {
                  const isDisabled = !product.variants.some(
                    (v) => v.size === size && v.stock > 0
                  );
                  return (
                    <Button
                      key={size}
                      variant="stock"
                      size="stock"
                      onClick={() => handleSizeClick(size)}
                      className={`${
                        selectedVariant?.size === size
                          ? "bg-foreground text-secondary"
                          : ""
                      } ${isRTL ? "w-fit" : ""}`}
                      disabled={isDisabled}
                    >
                      {size}
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
                  {getAvailableColorsForSize(selectedVariant.size).map(
                    (color) => {
                      const isDisabled = !product.variants.some(
                        (v) =>
                          v.size === selectedVariant.size &&
                          v.color === color &&
                          v.stock > 0
                      );
                      return (
                        <Button
                          key={color}
                          variant="color"
                          size="color"
                          onClick={() => handleColorClick(color)}
                          className={`w-fit ${
                            selectedVariant?.color === color
                              ? "bg-foreground text-secondary"
                              : ""
                          }`}
                          disabled={isDisabled}
                        >
                          {color}
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
              <BuyNowButton
                productVariantId={selectedVariant?.id || null}
                quantity={1}
                disabled={selectedVariant?.stock === 0}
                className="flex-1"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;