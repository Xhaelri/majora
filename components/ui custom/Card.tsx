"use client";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import React, { useState } from "react";
import { FullProduct } from "@/types/product";
import Link from "../Link/Link";
import { slugifyAdvanced } from "@/utils/slugify";

type CardProps = {
  productData: FullProduct;
};

const Card = ({ productData }: CardProps) => {
  // Use the first variant as the default
  const primaryVariant = productData.variants?.[0];

  // Use the images from the primary variant
  const primaryImageUrl = primaryVariant?.images?.[0]?.url || "";

  const hoverImageUrl = primaryVariant?.images?.[1]?.url || primaryImageUrl;

  const imageAltText = primaryVariant?.images?.[0]?.altText || productData.name;

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
              <div className="bg-foreground text-secondary absolute top-0 right-0 h-8 w-15 z-20 flex items-center justify-center">
                <p>Sale</p>
              </div>
            ) : null}
            <Image
              src={imageSrc}
              alt={imageAltText}
              fill
              className="object-cover "
            />
          </div>
          <h1 className="text-md font-light  md:tracking-[2px] text-center h-11 line-clamp-2 break-all uppercase">
            {productData.name}
          </h1>
          <div className="text-md font-extralight tracking-widest flex flex-col items-center">
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-2 ">
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
                SAVE {formatPrice(discountAmount)}
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
              <div className="bg-foreground text-secondary absolute top-0 right-0 h-5 w-11 text-sm  md:h-7 md:w-14 md:text-md z-20 flex items-center justify-center">
                <p>Sale</p>
              </div>
            ) : null}
            <Image
              src={imageSrc}
              alt={imageAltText}
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-lg font-extralight tracking-[2px] text-center h-12 overflow-hidden break-all uppercase">
            {productData.name}
          </h1>
          <div className="text-md font-extralight tracking-widest flex flex-col items-center">
            <div className="flex flex-row  gap-3  ">
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
                SAVE {formatPrice(discountAmount)}
              </h2>
            ) : null}
          </div>
        </Link>
      )}
    </div>
  );
};

export default Card;
