"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carouselProduct";
import { cn } from "@/lib/tailwind-utils";
import Image from "next/image";
import useMediaQuery from "@/hooks/useMediaQuery";
import { ImageDialog } from "@/components/ui-custom/ImageDialog";
import { useLocale } from "next-intl";

type ProductDetailsCarouselProps = {
  images: string[];
};

export default function ProductDetailsCarousel({
  images,
}: ProductDetailsCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogCurrentIndex, setDialogCurrentIndex] = React.useState(0);

  const isDesktop = useMediaQuery("(min-width:768px)");
  const locale = useLocale();
  const isRTL = locale === "ar";

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

  const handleMainImageClick = (index: number) => {
    setDialogCurrentIndex(index);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogNext = () => {
    const nextIndex = isRTL
      ? (dialogCurrentIndex - 1 + images.length) % images.length
      : (dialogCurrentIndex + 1) % images.length;
    setDialogCurrentIndex(nextIndex);
    api?.scrollTo(nextIndex);
  };

  const handleDialogPrev = () => {
    const prevIndex = isRTL
      ? (dialogCurrentIndex + 1) % images.length
      : (dialogCurrentIndex - 1 + images.length) % images.length;
    setDialogCurrentIndex(prevIndex);
    api?.scrollTo(prevIndex);
  };

  // Helper function to generate alt text from image filename or URL
  const getAltText = (imageUrl: string, index: number) => {
    // Extract filename from URL for alt text
    const filename = imageUrl.split('/').pop()?.split('.')[0];
    return filename || `Product image ${index + 1}`;
  };

  // Convert string array to format expected by ImageDialog
  const dialogImages = images.map((imageUrl, index) => ({
    url: imageUrl,
    altText: getAltText(imageUrl, index),
  }));

  return isDesktop ? (
    <>
      <div className="flex gap-4 w-full">
        {/* Thumbnail Column - Full Height */}
        <div className="w-20 flex flex-col gap-2">
          <div className="grid grid-rows-[repeat(auto-fit,minmax(0,1fr))] gap-2 h-[600px]">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className={cn(
                  "cursor-pointer relative overflow-hidden  border-1 transition-all",
                  current === index + 1
                    ? "border-gray-800 opacity-100"
                    : "border-transparent opacity-70 hover:opacity-90"
                )}
                onClick={() => handleThumbClick(index)}
                style={{ height: `${600 / images.length - (8 * (images.length - 1)) / images.length}px` }}
              >
                <Image
                  src={imageUrl}
                  alt={getAltText(imageUrl, index)}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Image - Full Width */}
        <div className="flex-1">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <CarouselContent>
              {images.map((imageUrl, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden w-full">
                    <CardContent className="p-0">
                      <div className="relative h-[600px] w-full">
                        <Image
                          src={imageUrl}
                          alt={getAltText(imageUrl, index)}
                          fill
                          className="object-cover cursor-pointer"
                          loading="eager"
                          onClick={() => handleMainImageClick(index)}
                          sizes="(min-width: 768px) calc(100vw - 120px), 100vw"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
      <ImageDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        images={dialogImages}
        currentIndex={dialogCurrentIndex}
        onNext={handleDialogNext}
        onPrev={handleDialogPrev}
      />
    </>
  ) : (
    <>
      <div className="mx-auto">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          <CarouselContent className="h-full w-full">
            {images.map((imageUrl, index) => (
              <CarouselItem
                key={index}
                onClick={() => handleMainImageClick(index)}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden w-full">
                  <CardContent className="relative w-full">
                    <Image
                      src={imageUrl}
                      alt={getAltText(imageUrl, index)}
                      width={600}
                      height={300}
                      className="object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
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
                "h-2.5 w-2.5 rounded-full border-primary/50 bg-primary/50",
                {
                  "border-primary bg-primary h-3.5 w-3.5":
                    current === index + 1,
                }
              )}
            />
          ))}
        </div>
      </div>
      <ImageDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        images={dialogImages}
        currentIndex={dialogCurrentIndex}
        onNext={handleDialogNext}
        onPrev={handleDialogPrev}
      />
    </>
  );
}