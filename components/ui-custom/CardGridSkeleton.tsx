
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"; 
export const CardGridSkeleton = () => {
  return (
    <div className="container py-10">
        {/* Skeleton for the Section Title */}
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-10 w-32 mx-auto mb-10" />

        {/* Skeleton for the Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="h-[250px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};