"use client"
import Image from "next/image";
import React from "react";

type Props = {
  children: React.ReactNode;
  image: {
    src: string;
    alt: string;
  };
};
const ProductsSectionHeader = ({ children, image }: Props) => {
  return (
    <section className="w-full h-[1000px] max-h-[250px] md:max-h-[450px] relative mb-20 md:mb-28">
      <Image src={image.src} alt={image.alt} fill className="object-cover" />
      <div className=" w-20 h-0  rounded-full shadow-[0_0_160px_80px_rgba(128,128,128,0.8)] absolute inset-0 flex items-center justify-center my-auto mx-auto"></div>

      <h1 className="absolute inset-0 flex items-center justify-center text-3xl md:text-5xl font-light uppercase text-secondary">
        {children}
      </h1>
    </section>
  );
};

export default ProductsSectionHeader;
