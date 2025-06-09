import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}
export default function Container({ children, className }: Props) {
  return (
    <div className={cn("max-w-screen-xl mx-auto px-4",className)}>
      {children}
    </div>
  );
}
