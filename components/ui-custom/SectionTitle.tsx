
"use client"
import React from "react";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
  categoryName?: string;
  href?: string;
};

const SectionTitle = ({ children, categoryName, href }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (categoryName) {
      // Convert category name to URL-friendly format (spaces to hyphens)
      const urlName = categoryName.toLowerCase().replace(/\s+/g, '-');
      router.push(`/category/${urlName}`);
    }
  };

  const isClickable = href || categoryName;

  return (
    <h1 
      onClick={isClickable ? handleClick : undefined}
      className={`text-3xl font-extralight uppercase text-primary pt-15 ${
        isClickable ? 'cursor-pointer hover:text-primary/80 transition-colors duration-200' : ''
      }`}
    >
      {children}
    </h1>
  );
};

export default SectionTitle;