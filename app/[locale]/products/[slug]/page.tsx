import { getAllProductSlugs, getProductBySlug } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";


export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs(); 
    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params
    const product = await getProductBySlug(slug);

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        images: product.variants?.[0]?.images?.[0] ? [product.variants[0].images[0]] : [],
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
    const {slug} = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      notFound();
    }

    return <ProductDetails product={product} />;
  } catch (error) {
    console.error("Error loading product:", error);
    // You might want to return a custom error page here
    throw error; // This will trigger Next.js error boundary
  }
};

export default ProductPage;