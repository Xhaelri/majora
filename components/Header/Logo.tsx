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
          "text-4xl font-light text-main-text-color tracking-wider uppercase",
          className
        )}
      >
        {children}
      </h2>
    </Link>
  );
}
