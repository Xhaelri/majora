"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carouselProduct";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Image = {
  url: string;
  altText: string; 
};

type ProductDetailsCarouselProps = {
  images: Image[];
};

export default function ProductDetailsCarousel({
  images,
}: ProductDetailsCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const isDesktop = useMediaQuery("(min-width:768px)");
  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  const handleThumbClick = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );
  return isDesktop ? (
    <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-start">
      <div className="md:w-1/5 w-full order-2 md:order-1 flex justify-center md:justify-start">
        <Carousel
          orientation="vertical"
          opts={{
            align: "start",
          }}
          className="w-full max-h-[500px]"
        >
          <CarouselContent className="flex flex-row md:flex-col gap-3 h-fit  md:h-full">
            {images.map((image, index) => (
              <CarouselItem
                key={index}
                className={cn(
                  "basis-1/3 md:basis-1/4 lg:basis-1/5 cursor-pointer",
                  current === index + 1
                    ? "opacity-100 border-1 border-gray-800 "
                    : "opacity-70"
                )}
                onClick={() => handleThumbClick(index)}
              >
                <Card className="w-full h-[150px] overflow-hidden">
                  <CardContent className="p-0 flex w-full h-full items-center justify-center relative">
                    <Image
                      src={image.url}
                      alt={image.altText}
                      fill
                      className="object-cover w-full h-full"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Main Product Image Carousel (horizontal) */}
      <div className=" w-full order-1 md:order-2 flex justify-center items-center">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent className="h-full w-full">
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <Card className="overflow-hidden w-full">
                  <CardContent className="relative aspect-[4/5] w-full">
                    <Image
                      src={image.url}
                      alt={image?.altText}
                      fill
                      className="object-cover"
                    />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  ) : (
    <div className="mx-auto">
      <Carousel setApi={setApi} className="w-full ">
        <CarouselContent className="h-full w-full">
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden w-full">
                <CardContent className="relative aspect-[4/5] w-full">
                  <Image
                    src={image.url}
                    alt={image.altText}
                    fill
                    className="object-cover"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mt-4 flex items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full  border-primary/50 bg-primary/50",
              {
                "border-primary bg-primary h-3.5 w-3.5": current === index + 1,
              }
            )}
          />
        ))}
      </div>
    </div>
  );
}
