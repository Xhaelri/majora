import { headerData } from "@/constants/constants";
import React from "react";
import { Menu } from "./Menu";

export function HeaderMenu() {
  return (
    <div className="hidden lg:inline-flex items-center justify-center space-x-2 xl:space-x-7 tracking-wider text-sm capitalize text-nowrap">
      {headerData.map((item) => (
        <Menu key={item.title} title={item.title} href={item.href} />
      ))}
    </div>
  );
}
