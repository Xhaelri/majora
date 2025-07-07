"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { heroImages, heroData } from "@/constants/constants"; // Import both
import HeroData from "./HeroData";
import { AnimatePresence } from "framer-motion";

export default function CarouselWithPagination() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const plugin = React.useRef(
    Autoplay({ delay: 4500, stopOnInteraction: false })
  );

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div>
      <Carousel
        setApi={setApi}
        className="relative"
        plugins={[plugin.current]}
        onMouseLeave={plugin.current.reset}
        opts={{ loop: true }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 flex">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn("h-2 w-10 md:w-30 mx-1 bg-secondary/40", {
                "bg-secondary": current === index,
              })}
            />
          ))}
        </div>
        <CarouselContent>
          {heroImages.map((image, index) => (
            <CarouselItem key={index}>
              <Card>
                <CardContent className="flex aspect-square max-h-[960px] items-center justify-center relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <AnimatePresence mode="wait">
                    <div className="container relative z-10 h-full w-full">
                      <HeroData
                        key={current}
                        button={heroData[index]?.button || "SHOP"}
                        title={heroData[index]?.title}
                        desc={heroData[index]?.desc}
                        variant={heroData[index]?.variant}
                      />
                    </div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
