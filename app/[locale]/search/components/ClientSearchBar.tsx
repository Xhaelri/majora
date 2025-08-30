"use client";

import Image from "next/image";
import ClientSearchInput from "@/app/[locale]/search/components/ClientSearchInput";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import type { Category } from "@prisma/client";
import { FullProduct } from "@/types/product-types";

// Extended types with relations

type Props = {
  products: FullProduct[];
  categories: Category[];
};

export default function ClientSearchBar({ products, categories }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative group h-full flex items-center">
      <Dialog>
        <DialogTrigger asChild>
          <Image
            src={"/assets/172546_search_icon.svg"}
            alt="Search-icon"
            width={20}
            height={20}
            className=" hover:text-gray-700 hoverEffect cursor-pointer"
          />
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="fixed top-0 mt-10 max-w-screen w-screen rounded-none shadow-none z-50 border-b bg-white xl:px-70"
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Search</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <ClientSearchInput
              products={products}
              categories={categories}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
            />
            <DialogClose asChild>
              <button
                type="button"
                className="p-0 bg-transparent border-0 cursor-pointer"
                ref={closeButtonRef}
                aria-label="Close search"
              >
                <Image
                  src={"/assets/close.svg"}
                  alt="Close"
                  width={30}
                  height={30}
                  className=" hover:text-gray-700 hoverEffect"
                />
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}