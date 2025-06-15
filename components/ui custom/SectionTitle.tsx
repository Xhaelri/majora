import React from "react";

type Props = {
  children: React.ReactNode;
};

const SectionTitle = ({ children }: Props) => {
  return <h1 className="text-5xl font-extralight text-primary pt-15">{children}</h1>;
};

export default SectionTitle;
