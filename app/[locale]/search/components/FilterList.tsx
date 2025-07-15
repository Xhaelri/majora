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
import { Accordion, AccordionItem } from "../../../../components/ui/accordion";
import { Button } from "@/components/ui/button";
import FilterIcon from "@/public/assets/filter-alt-2-svgrepo-com.svg";
import FilterOptions from "./FilterOptions";

export default function FilterList() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1024px)");

  return (
    <div>
      {!isDesktop && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant={"filter"} size={"filter"}>
              <span>
                <FilterIcon />
              </span>
              Filter
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="text-primary overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl tracking-widest uppercase font-light">
                Filter
              </SheetTitle>
            </SheetHeader>
            <Accordion
              type="single"
              collapsible
              className="flex flex-col w-full px-5"
            >
              <AccordionItem value="">
                <FilterOptions />
              </AccordionItem>
            </Accordion>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
