"use client";
import useMediaQuery from "@/hooks/useMediaQuery";
import formatPrice from "@/utils/formatPrice";
import Image from "next/image";
import React, { useState } from "react";
import { FullProduct } from "@/types/product";
import { Link } from "@/i18n/navigation";
import slugifyAdvanced from "@/utils/slugify";
import { useLocale, useTranslations } from "next-intl";

type CardProps = {
  productData: FullProduct;
};

const Card = ({ productData }: CardProps) => {
  const locale = useLocale();
  const t = useTranslations("product");
  const isRTL = locale === "ar";
  const primaryVariant = productData.variants?.[0];

  const primaryImageUrl = primaryVariant?.images?.[0]?.url || "";

  const hoverImageUrl = primaryVariant?.images?.[1]?.url || primaryImageUrl;

  const imageAltText = isRTL
    ? primaryVariant?.images?.[0]?.altTextAr
    : primaryVariant?.images?.[0]?.altText ||
      primaryVariant?.images?.[0]?.altText;

  const isOnSale =
    productData.salePrice !== null && productData.salePrice < productData.price;

  const currentPrice = isOnSale
    ? productData.salePrice ?? productData.price
    : productData.price;

  const originalPrice = productData.price;
  const discountAmount = isOnSale ? originalPrice - currentPrice : 0;

  const [imageSrc, setImageSrc] = useState(primaryImageUrl);
  const isDesktop = useMediaQuery("(min-width:768px)");
  
  return (
    <div>
      {isDesktop ? (
        <Link
          href={`/products/${slugifyAdvanced(productData.name)}`}
          className="flex flex-col  items-center justify-center gap-2 w-full max-w-[260px]"
        >
          <div
            className="w-full aspect-[2/3] relative cursor-pointer "
            onMouseEnter={() => setImageSrc(hoverImageUrl)}
            onMouseLeave={() => setImageSrc(primaryImageUrl)}
          >
            {isOnSale ? (
              <div className="bg-foreground text-secondary absolute top-0 right-0 h-8 w-15 z-5 flex items-center justify-center">
                <p>{t('sale')}</p>
              </div>
            ) : null}
            <Image
              src={imageSrc}
              alt={imageAltText!}
              width={"300"}
              height={"500"}
              className="object-cover "
              loading={"lazy"}
            />
          </div>
          <h1
            className={`text-md font-light  ${
              isRTL ? "font-medium" : "md:tracking-[2px]"
            } text-center h-11 line-clamp-2 break-all uppercase`}
          >
            {isRTL ? productData.nameAr : productData.name}
          </h1>
          <div className="text-md font-extralight tracking-widest flex flex-col items-center">
            <div className="flex flex-col xl:flex-row gap-0 lg:gap-2 ">
              {isOnSale ? (
                <h2 className="line-through text-nowrap text-sm">
                  {formatPrice(originalPrice)}
                </h2>
              ) : null}
              <h2 className="text-center text-nowrap text-sm">
                {formatPrice(currentPrice)}
              </h2>
            </div>
            {isOnSale ? (
              <h2 className="text-red-500 text-nowrap text-sm">
                {t('save')} {formatPrice(discountAmount)}
              </h2>
            ) : null}
          </div>
        </Link>
      ) : (
        <Link
          href={`/products/${slugifyAdvanced(productData.name)}`}
          className="flex flex-col items-center gap-2 w-full max-w-[260px]"
        >
          <div className="w-full aspect-[2/3] relative cursor-pointer">
            {isOnSale ? (
              <div className="bg-foreground text-secondary absolute top-0 right-0 h-5 w-11 text-sm  md:h-7 md:w-14 md:text-md z-5 flex items-center justify-center">
                <p>{t('sale')}</p>
              </div>
            ) : null}
            <Image
              src={imageSrc}
              alt={imageAltText!}
              width={"300"}
              height={"500"}
              className="object-cover"
              loading={"eager"}
            />
          </div>
          <h1
            className={`text-lg font-extralight ${
              isRTL ? " font-medium" : "md:tracking-[2px]"
            } text-center h-15 overflow-hidden break-all uppercase`}
          >
            {isRTL ? productData.nameAr : productData.name}
          </h1>
          <div className="text-md font-extralight tracking-widest flex flex-col items-center">
            <div className="flex flex-col sm:flex-row  sm:gap-3  ">
              {isOnSale ? (
                <h2 className="line-through text-nowrap text-sm">
                  {formatPrice(originalPrice)}
                </h2>
              ) : null}
              <h2 className="text-center text-nowrap text-sm">
                {formatPrice(currentPrice)}
              </h2>
            </div>
            {isOnSale ? (
              <h2 className="text-red-500 text-nowrap text-sm">
                {t('save')} {formatPrice(discountAmount)}
              </h2>
            ) : null}
          </div>
        </Link>
      )}
    </div>
  );
};

export default Card;