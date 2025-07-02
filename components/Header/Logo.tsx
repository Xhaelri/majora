import { cn } from "@/lib/utils";
import Link from "../Link/Link";
import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Logo({ children, className }: Props) {
  return (
    <Link href={"/"}>
      <h2
        className={cn(
          "text-xl font-bold text-center flex items-center justify-center text-main-text-color tracking-wider uppercase",
          className
        )}
      >
        {children}
      </h2>
    </Link>
  );
}
