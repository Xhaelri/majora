
import { getProductBySlug } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";

type Props = {
  params: {
    slug: string;
  };
};

const ProductPage = async ({ params }: Props) => {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
};

export default ProductPage;
