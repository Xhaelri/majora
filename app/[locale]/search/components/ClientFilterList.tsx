"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import FilterIcon from "@/public/assets/filter-alt-2-svgrepo-com.svg";
import ClientFilterOptions from "./ClientFilterOptions";
import { useTranslations } from "next-intl";
import type { Category } from "@prisma/client";

// Define filter types
export type FilterOptions = {
  availability?: "in-stock" | "out-of-stock";
  priceRange?: { from: number; to: number };
  categories?: string[];
};

type Props = {
  filters: FilterOptions;
  onUpdateFilter: (
    key: keyof FilterOptions,
    value: "in-stock" | "out-of-stock" | { from: number; to: number } | string[] | undefined
  ) => void;
  categories: Category[];
  resultCount: number;
  totalCount: number;
};

export default function ClientFilterList({ 
  filters, 
  onUpdateFilter, 
  categories, 
  // resultCount, 
  // totalCount 
}: Props) {
  const t = useTranslations("filters");
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1024px)");

  return (
    <div className="flex items-center gap-4">
      {/* Results count
      <span className="text-sm text-gray-600">
        {resultCount} of {totalCount} products
      </span> */}

      {/* Mobile filter button */}
      {!isDesktop && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant={"filter"} size={"filter"}>
              <span>
                <FilterIcon />
              </span>
              {t("filter")}
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="text-primary overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl tracking-widest uppercase font-light">
                {t("filter")}
              </SheetTitle>
            </SheetHeader>
            <Accordion
              type="single"
              collapsible
              className="flex flex-col w-full px-5"
            >
              <AccordionItem value="filters">
                <ClientFilterOptions
                  filters={filters}
                  onUpdateFilter={onUpdateFilter}
                  categories={categories}
                />
              </AccordionItem>
            </Accordion>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}