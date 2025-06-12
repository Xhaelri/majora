"use client";
import { AlignLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePathname } from "next/navigation";
import Link from "../Link/Link";
import { headerData } from "@/constants/constants";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width:768px)");
  const pathname = usePathname();

  return (
    <div>
      {isDesktop ? (
        <AlignLeft size={43} strokeWidth={1} className='w-7 h-7 hover:text-green-900 hoverEffect'/>

      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
        <AlignLeft size={43} strokeWidth={1} className='w-7 h-7 hover:text-green-900 hoverEffect'/>
          </SheetTrigger>
          <SheetContent side="right" >
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </SheetDescription>
            </SheetHeader>
            {headerData.map((item) => (
              <Link
              className={`hover:text-green-900 text-primary hoverEffect relative group ${
                pathname === item?.href && "text-green-900"
                }`}
                key={item?.title}
                href={item.href}
                >
                <SheetClose>
                  <div className="cursor-pointer ">{item?.title}</div>
                </SheetClose>
              </Link>
            ))}
            <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
