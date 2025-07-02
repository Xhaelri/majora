import { headerData } from "@/constants/constants";
import React from "react";
import { Menu } from "./Menu";

export function HeaderMenu() {
  return (
    <div className="inline-flex items-center justify-start  tracking-wider capitalize text-nowrap">
      {headerData.map((item) => (
        <Menu key={item.title} title={item.title} href={item.href} />
      ))}
    </div>
  );
}
