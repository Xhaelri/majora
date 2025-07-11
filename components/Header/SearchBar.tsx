"use client";

import Image from "next/image";
import SearchInput from "../Search/SearchInput";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { Button } from "../ui/button";

export default function SearchBar() {
  return (
    <>
      <div className="relative group h-full flex items-center">
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Image
                src={"/assets/172546_search_icon.svg"}
                alt="Search-icon"
                width={20}
                height={10}
                className=" hover:text-gray-700 hoverEffect"
              />
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="fixed top-0 mt-10 max-w-screen! w-screen  rounded-none shadow-none z-50 border-b bg-white xl:px-70!"
            >
              <DialogHeader>
                <DialogTitle></DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center">
                <SearchInput isSearchPage={false}/>
                <DialogClose asChild className="">
                  <Button type="button" variant="secondary" className="p-0">
                    <Image
                      src={"/assets/close.svg"}
                      alt="Search-icon"
                      width={30}
                      height={10}
                      className=" hover:text-gray-700 hoverEffect"
                    />
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
