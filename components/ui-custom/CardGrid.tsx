"use client";
import Card from "./Card";
import useMediaQuery from "@/hooks/useMediaQuery";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { motion } from "framer-motion";
import { FullProduct } from "@/types/product-types";

interface CardGridProps {
  products: FullProduct[];
  isProductsPage: boolean;
}

const CardGrid = ({ products, isProductsPage = false }: CardGridProps) => {
  const isDesktop = useMediaQuery("(min-width:768px)");
const loading = !products || products.length === 0;

  if (loading) {
    // This skeleton loader now directly mirrors the structure of the final output,
    // which prevents layout shifts when the real content loads.
    return (
      <div className="overflow-x-hidden container">
        {isDesktop ? (
          // --- Desktop Skeleton Grid ---
          <div className="grid grid-cols-5 sm:gap-3 lg:gap-3 xl:gap-6 2xl:gap-12 w-full">
            {Array.from({ length: 10 }).map((_, i) => ( // Show 10 skeletons for a fuller look
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {isProductsPage ? (
              // --- Mobile Products Page Grid Skeleton ---
              <div className="grid grid-cols-2 gap-4 w-full">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // --- Mobile Carousel Skeleton ---
              <div className="flex space-x-4 -ml-4 pl-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse basis-1/2 md:basis-1/3 flex-shrink-0 p-1">
                           <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded-lg mb-4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                      </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden container">
      {isDesktop ? (
        <div className="overflow-hidden ">
          <div className="grid grid-cols-5 sm:gap-3 lg:gap-3 xl:gap-6 2xl:gap-12 w-full ">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 100 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card key={product.id} productData={product} />
              </motion.div>
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
                  <motion.div
                    key={product.id}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 100 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card key={product.id} productData={product} />
                  </motion.div>
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
                        <motion.div
                          key={product.id}
                          initial={{ y: 20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 100 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                        >
                          <Card productData={product} />
                        </motion.div>
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
