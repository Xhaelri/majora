import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
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
          "text-3xl font-semibold font-corinthia text-center flex items-center justify-center text-main-text-color tracking-wider ",
          className
        )}
      >
        {children}
      </h2>
    </Link>
  );
}
