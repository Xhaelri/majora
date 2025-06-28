import ProductDetailsCarousel from "@/app/products/[slug]/components/ProductDetailsCarousel";
import { getProductBySlug } from "@/server/db/prisma";
import { formatPrice } from "@/utils/formatPrice";
import React from "react";
import ProductVariants from "./components/ProductVariants";

type Props = {
  slug: string;
};
const ProductDetails = async ({ slug }: Props) => {
  const product = await getProductBySlug(slug);

  const discountAmount = product?.salePrice
    ? product?.price - product?.salePrice
    : 0;

  console.log(product?.images);

  return (
    <section className="container pt-0 md:pt-20">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-15">
        <div className="w-full md:w-1/2">
          <ProductDetailsCarousel images={product?.images ?? []} />
        </div>
        <div className="w-full md:w-1/2">
          <h1 className="text-4xl font-extralight tracking-widest text-center md:text-start">
            {product?.name}
          </h1>
          <div className="flex flex-col items-center md:items-start lg:flex-row gap-0 lg:gap-5 pt-5">
            <div className="flex  gap-5">
              {product?.salePrice ? (
                <h2 className="line-through text-nowrap text-lg">
                  {formatPrice(product?.price ?? 0)}
                </h2>
              ) : null}
              <h2 className=" text-nowrap text-lg">
                {formatPrice(product?.price ?? 0)}
              </h2>
            </div>

            {product?.salePrice ? (
              <h2 className="text-red-500 text-nowrap text-lg">
                SAVE {formatPrice(discountAmount)}
              </h2>
            ) : null}
          </div>
          {product && <ProductVariants variants={product.variants ?? []} />}
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
