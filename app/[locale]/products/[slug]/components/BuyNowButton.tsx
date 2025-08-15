"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface BuyNowButtonProps {
  productVariantId: string | null;
  quantity?: number;
  disabled?: boolean;
  className?: string;
}

export default function BuyNowButton({
  productVariantId,
  quantity = 1,
  disabled = false,
}: BuyNowButtonProps) {
  const t = useTranslations("product");
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    if (isLoading || disabled) return;

    // Check if user is authenticated
    if (!session?.user) {
      toast.error("Please sign in to continue with your purchase");
      router.push(
        "/auth/signin?callbackUrl=" + encodeURIComponent(window.location.href)
      );
      return;
    }

    setIsLoading(true);

    try {
      // Store buy now item data in sessionStorage for the checkout page
      const buyNowData = {
        productVariantId,
        quantity,
        timestamp: Date.now(),
      };

      sessionStorage.setItem("buyNowData", JSON.stringify(buyNowData));

      // Navigate to buy now checkout page
      router.push("/checkout/buy-now");
    } catch (error) {
      console.error("Buy Now error:", error);
      toast.error("Failed to proceed with Buy Now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="cartBuyNow"
      size="cartBuyNow"
      onClick={handleBuyNow}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <p className=" text-sm font-normal">{t("processing")}</p>
      ) : (
        <p className=" text-sm font-normal">{t("buyItNow")}</p>
      )}
    </Button>
  );
}
