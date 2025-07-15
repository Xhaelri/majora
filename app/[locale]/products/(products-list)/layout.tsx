import ProductsSectionHeader from "@/components/ui-custom/ProductsSectionHeader";
import { heroImages } from "@/constants/constants";
import React from "react";
type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  const headerImage = heroImages[0];

  return (
    <>
      <ProductsSectionHeader image={headerImage}>
        SHOP ALL
      </ProductsSectionHeader>
      {children}
    </>
  );
};

export default layout;
