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
import { Link } from "@/i18n/navigation";
import { Menu } from "@/constants/constants";
import { Accordion, AccordionItem, AccordionTrigger2 } from "../ui/accordion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCategories } from "@/hooks/useCategory";
import { Skeleton } from "../ui/skeleton";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  const t = useTranslations();
  const locale = useLocale();

  // Fetch categories using the custom hook
  const { categories, isLoading, error } = useCategories();

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Image
            src={"/assets/mobile.svg"}
            alt="Mobile-icon"
            width={20}
            height={20}
            className=" hover:text-gray-700 hoverEffect"
          />
        </SheetTrigger>

        <SheetContent
          side={locale === "ar" ? "right" : "left"}
          className="text-primary overflow-y-auto "
        >
          <SheetHeader>
            <SheetTitle className="text-2xl tracking-widest uppercase font-light">
              {t(Menu[0].title)}
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col justify-between h-full">
            {/* Categories Section */}
            <div className="flex flex-col w-full">
              {isLoading ? (
                // Loading skeleton for categories
                <div className="px-5 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                // Error state
                <div className="px-5 py-4 text-red-600 text-sm">
                  {t("MobileMenu.categoriesError") ||
                    "Failed to load categories"}
                </div>
              ) : (
                // Categories list
                categories.map((category) => (
                  <Accordion
                    key={category.id}
                    type="single"
                    collapsible
                    className="flex flex-col w-full px-5"
                  >
                    <AccordionItem value={category.id}>
                      <AccordionTrigger2 className="text-lg font-light tracking-widest uppercase">
                        <SheetClose asChild>
                          <Link
                            href={`/category/${category.name
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {locale === "ar" ? category.nameAr : category.name}
                          </Link>
                        </SheetClose>
                      </AccordionTrigger2>
                    </AccordionItem>
                  </Accordion>
                ))
              )}
            </div>

            <div>
              {/* Authentication Section */}
              {status === "loading" ? null : status === "authenticated" ? (
                <SheetFooter className="flex flex-row items-center justify-center mt-8">
                  <SheetClose asChild>
                    <Link
                      href={"/account"}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 px-6 w-30 border-1 border-black rounded-none cursor-pointer"
                    >
                      {t("MobileMenu.account")}
                    </Link>
                  </SheetClose>
                </SheetFooter>
              ) : (
                <SheetFooter className="flex flex-row items-center justify-center mt-8 gap-2">
                  <SheetClose asChild>
                    <Link
                      href={"/signin"}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 px-6 w-30 border-1 border-black rounded-none cursor-pointer"
                    >
                      <Image
                        src={"/assets/user2.svg"}
                        alt="User-icon"
                        width={20}
                        height={20}
                        className=" hover:text-gray-700 hoverEffect"
                      />{" "}
                      {t("MobileMenu.login")}
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      href={"/signup"}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 px-6 w-30 border-1 border-black rounded-none cursor-pointer"
                    >
                      {t("MobileMenu.createAccount")}
                    </Link>
                  </SheetClose>
                </SheetFooter>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
