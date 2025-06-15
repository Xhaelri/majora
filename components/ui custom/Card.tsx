"use client";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatPrice } from "@/lib/formatPrice";
import { Product } from "@/types/product";
import Image from "next/image";
import React, { useState } from "react";

type CardProps = {
  productData: Product;
};

const Card = ({ productData }: CardProps) => {
  const primaryImageUrl =
    productData.images.length > 0 ? productData.images[0].url : "";

  const hoverImageUrl =
    productData.images.length > 1 ? productData.images[1].url : primaryImageUrl;

  const isOnSale =
    productData.salePrice !== null && productData.salePrice < productData.price;

  const currentPrice = isOnSale
    ? productData.salePrice ?? productData.price
    : productData.price;

  const originalPrice = productData.price;
  const discountAmount = isOnSale ? originalPrice - currentPrice : 0;

  const imageAltText =
    productData.images.length > 0
      ? productData.images[0].altText || productData.name
      : productData.name;

  const [imageSrc, setImageSrc] = useState(primaryImageUrl);
  const isDesktop = useMediaQuery("(min-width:768px)");

  return (
    <div>
      {isDesktop ? (
        <div className="flex flex-col  items-center justify-center gap-2 w-full max-w-[260px] ">
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
          <h1 className="text-lg font-extralight  md:tracking-[2px] text-center h-12 overflow-hidden break-all uppercase">
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
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full max-w-[260px]">
          <div className="w-full aspect-[2/3] relative cursor-pointer">
            {isOnSale ? (
              <div className="bg-foreground text-secondary absolute top-0 right-0 h-7 w-14 z-20 flex items-center justify-center">
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
          <h1 className="text-lg font-extralight tracking-[4px] text-center h-12 overflow-hidden break-all uppercase">
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
        </div>
      )}
    </div>
  );
};

export default Card;
