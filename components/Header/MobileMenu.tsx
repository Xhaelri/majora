"use client";
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
import { mobileMenue } from "@/constants/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionTrigger2,
} from "../ui/accordion";
import UserIcon from "./UserIcon";
import Mobile from "@/assets/mobile.svg";
import { useSession } from "next-auth/react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const session = useSession();

  return (
    <div>
      {isDesktop ? (
        <Mobile className="w-5 h-5 hover:text-gray-700 hoverEffect lg:hidden" />
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Mobile className="w-5 h-5 hover:text-gray-700 hoverEffect lg:hidden" />
          </SheetTrigger>

          <SheetContent side="left" className="text-primary overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl tracking-widest uppercase font-light">
                Menu
              </SheetTitle>
            </SheetHeader>
            {mobileMenue.map((item) => (
              <Accordion
                key={item?.title}
                type="single"
                collapsible
                className="flex flex-col w-full px-5"
              >
                <AccordionItem value={`${item?.title}`}>
                  {item?.items ? (
                    <AccordionTrigger className="text-lg font-light uppercase">
                      <Link href={`/categories/${item?.href}`}>{item?.title}</Link>
                    </AccordionTrigger>
                  ) : (
                    <AccordionTrigger2 className="text-lg font-light tracking-widest uppercase">
                      <Link href={`/categories/${item?.href}`}>{item?.title}</Link>
                    </AccordionTrigger2>
                  )}

                  {/* <AccordionContent className="flex flex-col gap-1 text-balance ps-2 ">
                    {item.items &&
                      item.items.map((subItem) => (
                          <p
                            key={subItem}
                            className="text-[16px] text-gray-700"
                          >
                            {subItem}
                          </p>
                      ))}
                  </AccordionContent> */}
                  {/* <Separator className="bg-primary mt-[-10px]" /> */}
                </AccordionItem>
              </Accordion>

              // <Link
              // className={`hover:text-gray-700 text-primary hoverEffect relative group ${
              //   pathname === item?.href && "text-gray-700"
              //   }`}
              //   key={item?.title}
              //   href={item.href}
              //   >
              //   <SheetClose>
              //     <div className="cursor-pointer ">{item?.title}</div>
              //   </SheetClose>
              // </Link>
            ))}
            {session?.data?.user ? (
              <SheetFooter className="flex flex-row items-center justify-center">
                <SheetClose asChild>
                  <Link
                    href={"/account"}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap  text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 px-6 w-30 border-1 border-black rounded-none cursor-pointer "
                  >
                    Account
                  </Link>
                </SheetClose>
              </SheetFooter>
            ) : (
              <SheetFooter className="flex flex-row items-center justify-center">
                <SheetClose asChild>
                  <Link
                    href={"/signin"}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap  text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 px-6 w-30 border-1 border-black rounded-none cursor-pointer "
                  >
                    <UserIcon /> Login
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link
                    href={"/signup"}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap  text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 px-6 w-30 border-1 border-black rounded-none cursor-pointer "
                  >
                    Create Account
                  </Link>
                </SheetClose>
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
