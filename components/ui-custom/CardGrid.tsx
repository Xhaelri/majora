"use client";
import React from "react";
import Card from "./Card";
import useMediaQuery from "@/hooks/useMediaQuery";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { FullProduct } from "@/types/product";

interface CardGridProps {
  products: FullProduct[];
  isProductsPage: boolean;
}

const CardGrid = ({ products, isProductsPage = false }: CardGridProps) => {
  const isDesktop = useMediaQuery("(min-width:768px)");

  return (
    <div className="overflow-x-hidden container">
      {isDesktop ? (
        <div className="overflow-hidden ">
          <div className="grid grid-cols-5 sm:gap-3 lg:gap-3 xl:gap-6 2xl:gap-12 w-full ">
            {products.map((product) => (
              <Card key={product.id} productData={product} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {isProductsPage ? (
            <div className="overflow-hidden ">
              <div
                className="grid grid-cols-2 gap-4 sm:gap-3 lg:gap-3 xl:gap-6 2xl:gap-12 w-full "
                style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
              >
                {products.map((product) => (
                  <Card key={product.id} productData={product} />
                ))}
              </div>
            </div>
          ) : (
            <div className="relative " dir="ltr">
              <Carousel
                opts={{
                  align: "start",
                  
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {products.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="basis-1/2 md:basis-1/3 pl-4"
                    >
                      <div className="p-1">
                        <Card productData={product} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
              </Carousel>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CardGrid;
