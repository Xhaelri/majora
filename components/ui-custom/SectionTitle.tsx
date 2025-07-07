"use client"
import React from "react";

type Props = {
  children: React.ReactNode;
};

const SectionTitle = ({ children }: Props) => {
  return <h1 className="text-3xl font-extralight uppercase text-primary pt-15">{children}</h1>;
};

export default SectionTitle;
