"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function SortDropDown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <Select
      onValueChange={(value) => {
        router.push(pathname + "?" + createQueryString("sort", value));
      }}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-9 w-full font-light items-center justify-between whitespace-nowrap cursor-pointer border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          "w-44"
        )}
      >
        <SelectValue placeholder="Sort by" />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sorting Options</SelectLabel>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="name-asc">Alphabetically, A-Z</SelectItem>
          <SelectItem value="name-desc">Alphabetically, Z-A</SelectItem>
          <SelectItem value="price-asc">Price, low to high</SelectItem>
          <SelectItem value="price-desc">Price, high to low</SelectItem>
          <SelectItem value="date-desc">Date, new to old</SelectItem>
          <SelectItem value="date-asc">Date, old to new</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}