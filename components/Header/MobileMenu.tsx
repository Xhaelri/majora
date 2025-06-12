"use client";
import { AlignLeft } from "lucide-react";
import React, { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Link from "../Link/Link";
import { headerData } from "@/constants/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Separator } from "../ui/separator";
import UserIcon from "./UserIcon";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:768px)");

  return (
    <div>
      {isDesktop ? (
        <AlignLeft
          size={43}
          strokeWidth={1}
          className="w-7 h-7 hover:text-green-900 hoverEffect"
        />
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <AlignLeft
              size={43}
              strokeWidth={1}
              className="w-7 h-7 hover:text-green-900 hoverEffect"
            />
          </SheetTrigger>
          <SheetContent side="right" className="text-primary  overflow-y-auto">
            <SheetHeader>
              <SheetTitle></SheetTitle>
            </SheetHeader>
            {headerData.slice(1).map((item) => (
              <Accordion
                key={item?.title}
                type="single"
                collapsible
                className="flex flex-col w-full p-5 "
              >
                <AccordionItem value={`${item?.title}`}>
                  <AccordionTrigger className="text-2xl">
                    {item?.title}
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-1 text-balance ps-5 text-lg">
                    <p>Our flagship</p>
                    <p>Key features</p>
                  </AccordionContent>
                  <Separator className="bg-primary mt-[-10px]" />
                </AccordionItem>
              </Accordion>

              // <Link
              // className={`hover:text-green-900 text-primary hoverEffect relative group ${
              //   pathname === item?.href && "text-green-900"
              //   }`}
              //   key={item?.title}
              //   href={item.href}
              //   >
              //   <SheetClose>
              //     <div className="cursor-pointer ">{item?.title}</div>
              //   </SheetClose>
              // </Link>
            ))}
            <SheetFooter className="flex flex-row items-center justify-center">
              <SheetClose asChild>
                <Link
                  href={"/"}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap  text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 px-6 w-40 border-1 border-black rounded-none cursor-pointer "
                >
                  <UserIcon /> Login
                </Link>
              </SheetClose>

              <SheetClose asChild>
                <Link
                  href={"/"}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap  text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 px-6 w-40 border-1 border-black rounded-none cursor-pointer "
                >
                  Create Account
                </Link>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
