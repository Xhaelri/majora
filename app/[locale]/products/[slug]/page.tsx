import { getAllProductSlugs, getProductBySlug } from "@/server/db/prisma";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs(); 

    const params = [];
    // Generate params for all locale/slug combinations
    for (const lang of routing.locales) {
      for (const slug of slugs) {
        params.push({
          lang: lang,
          slug: slug,
        });
      }
    }
    
    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Update Props to match your URL structure
type Props = {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
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
    const { lang, slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      notFound();
    }

    return <ProductDetails product={product} />;
  } catch (error) {
    console.error("Error loading product:", error);
    throw error;
  }
};

export default ProductPage;