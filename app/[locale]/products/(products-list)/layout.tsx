import CategorySectionHeader from "@/components/Home-Section/CategorySectionHeader";
import { heroImages } from "@/constants/constants";
import React from "react";
type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  const headerImage = heroImages[0];

  return (
    <>
      <CategorySectionHeader image={headerImage}>
        SHOP ALL
      </CategorySectionHeader>
      {children}
    </>
  );
};

export default layout;
