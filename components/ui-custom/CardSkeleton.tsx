import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import useMediaQuery from "@/hooks/useMediaQuery";

const CardSkeleton = () => {
  const isDesktop = useMediaQuery("(min-width:768px)");
  
  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full max-w-[260px]">
      {/* Image skeleton */}
      <div className="w-full aspect-[2/3] relative">
        <Skeleton className="w-full h-full rounded-none" />
        {/* Sale badge skeleton (sometimes visible) */}
        {Math.random() > 0.7 && (
          <div className="absolute top-0 right-0 h-8 w-15 z-5">
            <Skeleton className="w-full h-full rounded-none" />
          </div>
        )}
      </div>
      
      {/* Product name skeleton */}
      <div className={`w-full space-y-2 ${isDesktop ? 'h-11' : 'h-15'} flex flex-col justify-center`}>
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </div>
      
      {/* Price skeleton */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex flex-col xl:flex-row gap-0 lg:gap-2">
          {/* Sometimes show crossed out price */}
          {Math.random() > 0.6 && (
            <Skeleton className="h-4 w-16 mb-1" />
          )}
          <Skeleton className="h-4 w-20" />
        </div>
        {/* Sometimes show save amount */}
        {Math.random() > 0.7 && (
          <Skeleton className="h-4 w-24" />
        )}
      </div>
    </div>
  );
};

export default CardSkeleton;