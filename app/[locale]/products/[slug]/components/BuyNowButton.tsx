"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type ProductVariant = {
  id: string;
  stock: number;
  size: {
    id: string;
    name: string;
    nameAr?: string | null;
  };
  color: {
    id: string;
    name: string;
    nameAr?: string | null;
  };
  images?: Array<{
    url: string;
    altText: string;
    altTextAr?: string | null;
  }>;
};

type ProductInfo = {
  id: string;
  name: string;
  nameAr?: string | null;
  price: number;
  salePrice?: number | null;
  description?: string | null;
};

type Props = {
  productVariant: ProductVariant | null;
  productInfo: ProductInfo;
  className?: string;
  disabled?: boolean;
};

const BuyNowButton = ({
  productVariant,
  productInfo,
  disabled = false,
}: Props) => {
  const router = useRouter();
  const t = useTranslations("product");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuyNow = async () => {
    // Validate that a variant is selected
    if (!productVariant) {
      console.error("Please select size and color");
      return;
    }

    setIsProcessing(true);

    try {
      // Create URL with product data as query parameters
      const buyNowParams = new URLSearchParams({
        // Product variant details
        variantId: productVariant.id,
        productId: productInfo.id,
        productName: productInfo.name,
        price: productInfo.price.toString(),
        salePrice: productInfo.salePrice?.toString() || "",
        sizeName: productVariant.size.name,
        colorName: productVariant.color.name,
        quantity: "1",
        // Add image if available
        ...(productVariant.images?.[0] && {
          imageUrl: productVariant.images[0].url,
          imageAlt: productVariant.images[0].altText,
        }),
      });

      // Navigate to checkout with buy-now flag
      router.push(`/checkout?buyNow=true&${buyNowParams.toString()}`);
    } catch (error) {
      console.error("Error processing buy now:", error);
      // Handle error - maybe show a toast notification
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant={"cartBuyNow"}
      size={"cartBuyNow"}
      onClick={handleBuyNow}
      disabled={disabled || isProcessing || !productVariant}
    >
      {isProcessing ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {t("processing") || "Processing..."}
        </div>
      ) : (
        t("buyItNow") || "Buy Now"
      )}
    </Button>
  );
};

export default BuyNowButton;
