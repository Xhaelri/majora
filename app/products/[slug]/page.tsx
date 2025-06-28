import React from "react";
import ProductDetails from "./ProductDetails";

type Props = {
  params: Promise<{ slug: string }>;
};
const page = async ({ params }: Props) => {
  const { slug } = await params;
  return <ProductDetails slug={slug} />;
};

export default page;
