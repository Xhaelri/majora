"use client";
import { headerData } from "@/constants/constants";
import Link from "../Link/Link";
import { usePathname } from "next/navigation";
import React from "react";

export default function HeaderMenu() {
  const pathname = usePathname();
  return (
    <div className="hidden lg:inline-flex  items-center justify-center space-x-9 tracking-wider text-sm capitalize text-nowrap ">
      {headerData.map((item) => (
        <Link
          className={`hover:text-green-900 text-primary hoverEffect relative group ${
            pathname === item?.href && "text-green-900"
          }`}
          key={item?.title}
          href={item.href}
        >
          <h1 className="navText">{item?.title}</h1>
          <span
            className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-foreground hoverEffect group-hover:w-1/2 group-hover:left-0 ${
              pathname === item?.href && "w-1/2"
            }`}
          />
          <span
            className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-foreground hoverEffect group-hover:w-1/2 group-hover:right-0 ${
              pathname === item?.href && "w-1/2"
            }`}
          />
        </Link>
      ))}
    </div>
  );
}
