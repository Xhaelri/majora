import { getProductBySlug, getAllProductSlugs } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs(); 
  return slugs.map((slug) => ({
    slug,
  }));
}

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  return {
    title: product?.name,
    description: product?.description,
    openGraph: {
      images: [product?.variants[0].images[0]],
    },
  };
}
const ProductPage = async ({ params }: Props) => {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
};

export default ProductPage;
