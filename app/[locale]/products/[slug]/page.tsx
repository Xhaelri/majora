import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import { getProductBySlug } from "@/server/db-actions/product-actions";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
    const result = await getProductBySlug(slug);

    if (!result.success || !result.data) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    const product = result.data;

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        images: product.variants?.[0]?.images?.[0]
          ? [product.variants[0].images[0]]
          : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product Error",
      description: "An error occurred while loading the product.",
    };
  }
}

const ProductPage = async ({ params }: Props) => {
  try {
    const { slug } = await params;
    const result = await getProductBySlug(slug);

    if (!result.success || !result.data) {
      notFound();
    }

    return <ProductDetails product={result.data} />;
  } catch (error) {
    console.error("Error loading product:", error);
    throw error;
  }
};

export default ProductPage;