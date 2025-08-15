"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import formatPrice from "@/utils/formatPrice";
import {
  getBuyNowItemDetails,
  createBuyNowCheckoutSession,
} from "@/server/actions/buy-now-actions";
import {
  getShippingRate,
  getUserData,
  validateDiscountCode,
} from "@/server/actions/checkout-actions";
import DiscountSection from "../components/DiscountSection";
import BillingForm from "../components/BillingForm";
import PaymentIframe from "../components/PaymentIframe";
import { useTranslations } from "next-intl";

interface AppliedDiscount {
  code: string;
  amount: number;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

interface BillingData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface BuyNowItem {
  id: string;
  quantity: number;
  productVariantId: string;
  productVariant: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    productId: string;
    sizeId: string;
    colorId: string;
    stock: number;
    sku: string | null;
    product: {
      id: string;
      name: string;
      price: number;
      salePrice: number | null;
      description: string | null;
    };
    size: {
      id: string;
      name: string;
    };
    color: {
      id: string;
      name: string;
    };
    images: Array<{
      id: string;
      url: string;
      altText: string;
    }>;
  };
}

export default function BuyNowCheckoutPage() {
  const  t  = useTranslations('checkout');
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentKey, setPaymentKey] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [buyNowItem, setBuyNowItem] = useState<BuyNowItem | null>(null);

  // Discount state
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] =
    useState<AppliedDiscount | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  const [billingData, setBillingData] = useState<BillingData>({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    apartment: "",
    floor: "",
    street: "",
    building: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Egypt",
  });

  // Load buy now item and user data
  useEffect(() => {
    const loadBuyNowData = async () => {
      try {
        // Get buy now data from sessionStorage
        const buyNowDataStr = sessionStorage.getItem("buyNowData");
        if (!buyNowDataStr) {
          setError(t('buyNow.sessionExpired'));
          return;
        }

        const buyNowData = JSON.parse(buyNowDataStr);

        // Check if data is not too old (15 minutes)
        if (Date.now() - buyNowData.timestamp > 15 * 60 * 1000) {
          sessionStorage.removeItem("buyNowData");
          setError(t('buyNow.sessionExpired'));
          return;
        }

        // Load item details
        const itemResult = await getBuyNowItemDetails(
          buyNowData.productVariantId,
          buyNowData.quantity
        );

        if (itemResult.error || !itemResult.item) {
          setError(itemResult.error || t('buyNow.failedToLoad'));
          return;
        }

        setBuyNowItem(itemResult.item);

        // Load user data if authenticated
        if (session?.user) {
          const userData = await getUserData(session.user.id);
          if (userData) {
            setBillingData((prev) => ({
              ...prev,
              email: userData.email ?? "",
              firstName: userData.firstName ?? "",
              lastName: userData.lastName ?? "",
              phoneNumber: userData.phone ?? "",
              street: userData.address ?? "",
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load buy now data:", error);
        setError(t('buyNow.failedToLoadCheckout'));
      } finally {
        setInitializing(false);
      }
    };

    if (session !== undefined) {
      // Wait for session to load
      loadBuyNowData();
    }
  }, [session, t]);

  const handleGovernorateChange = useCallback(async (governorate: string) => {
    if (governorate) {
      const rate = await getShippingRate(governorate);
      setShippingCost(rate);
    } else {
      setShippingCost(null);
    }
  }, []);

  useEffect(() => {
    if (billingData.state) {
      handleGovernorateChange(billingData.state);
    }
  }, [billingData.state, handleGovernorateChange]);

  // Calculate totals
  const subtotal = buyNowItem
    ? buyNowItem.productVariant.product.price * buyNowItem.quantity
    : 0;

  const saleDiscount =
    buyNowItem && buyNowItem.productVariant.product.salePrice
      ? (buyNowItem.productVariant.product.price -
          buyNowItem.productVariant.product.salePrice) *
        buyNowItem.quantity
      : 0;

  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const total = subtotal - saleDiscount - discountAmount + (shippingCost || 0);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setError(t('discount.enterDiscountCode'));
      return;
    }

    setDiscountLoading(true);
    setError(null);

    try {
      const result = await validateDiscountCode(
        discountCode,
        subtotal - saleDiscount
      );

      if (result.error) {
        setError(result.error);
        setAppliedDiscount(null);
      } else if (result.discount) {
        setAppliedDiscount(result.discount);
        setError(null);
      }
    } catch (error) {
      console.error("Failed to apply discount:", error);
      setError("Failed to apply discount code");
      setAppliedDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setError(null);
  };

  const validateForm = () => {
    const required = [
      "email",
      "firstName",
      "lastName",
      "phoneNumber",
      "street",
      "city",
      "state",
    ];
    for (const field of required) {
      if (!billingData[field as keyof BillingData]) {
        setError(t(`validation.${field}Required`));
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingData.email)) {
      setError(t('validation.validEmail'));
      return false;
    }

    const phoneRegex = /^(\+201|01)[0-9]{9}$/;
    if (!phoneRegex.test(billingData.phoneNumber.replace(/\s/g, ""))) {
      setError(t('validation.validPhone'));
      return false;
    }

    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) return;
    if (shippingCost === null) {
      setError(t('validation.selectGovernorate'));
      return;
    }
    if (!buyNowItem) {
      setError(t('buyNow.productMissing'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createBuyNowCheckoutSession(
        {
          productVariantId: buyNowItem.productVariantId,
          quantity: buyNowItem.quantity,
        },
        billingData,
        shippingCost,
        appliedDiscount?.code
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.paymentKey) {
        setPaymentKey(result.paymentKey);
        setShowPayment(true);
        // Clear the session storage as we're now in payment flow
        sessionStorage.removeItem("buyNowData");
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (session === null) {
      router.push(
        "/auth/signin?callbackUrl=" + encodeURIComponent("/checkout/buy-now")
      );
    }
  }, [session, router]);

  if (initializing || session === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !buyNowItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">{t('error')}</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push("/products")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  if (!buyNowItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">{t('loadingProduct')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5">
      <h1 className="text-2xl font-bold mb-8">{t('title')}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-8 lg:max-w-1/2 order-1">
          {!showPayment && (
            <>
              <DiscountSection
                appliedDiscount={appliedDiscount}
                discountCode={discountCode}
                discountLoading={discountLoading}
                setDiscountCode={setDiscountCode}
                handleApplyDiscount={handleApplyDiscount}
                handleRemoveDiscount={handleRemoveDiscount}
              />

              <BillingForm
                loading={loading}
                error={error}
                billingData={billingData}
                handleInputChange={handleInputChange}
                handleProceedToPayment={handleProceedToPayment}
              />
            </>
          )}

          {showPayment && paymentKey && (
            <PaymentIframe paymentKey={paymentKey} />
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white p-6 shadow-sm border h-fit sticky top-4 lg:max-w-1/2 order-2">
          <h2 className="text-xl font-semibold mb-6">{t('orderSummary')}</h2>

          {/* Product Item */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 p-2 bg-gray-50 rounded-md">
              <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                {buyNowItem.productVariant.images?.[0] && (
                  <Image
                    src={buyNowItem.productVariant.images[0].url.trimStart()}
                    alt={buyNowItem.productVariant.images[0].altText}
                    className="w-full h-full object-cover"
                    width={64}
                    height={64}
                  />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-medium truncate">
                  {buyNowItem.productVariant.product.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {buyNowItem.productVariant.size.name} • {buyNowItem.productVariant.color.name}
                </p>
                <p className="text-xs text-gray-500">
                  {t('summary.quantity')} {buyNowItem.quantity}
                </p>
              </div>
              <div className="text-sm font-medium flex-shrink-0">
                {formatPrice(
                  (buyNowItem.productVariant.product.salePrice ||
                    buyNowItem.productVariant.product.price) *
                    buyNowItem.quantity
                )}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {t('summary.subtotal')} ({buyNowItem.quantity} {buyNowItem.quantity === 1 ? t('summary.item') : t('summary.items')})
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {saleDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>{t('summary.saleDiscount')}</span>
                <span>-{formatPrice(saleDiscount)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>{t('summary.couponDiscount')} ({appliedDiscount?.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>{t('summary.delivery')}</span>
              <span className={shippingCost === null ? "text-gray-500" : ""}>
                {shippingCost === null
                  ? t('summary.selectGovernorate')
                  : shippingCost === 0
                  ? t('summary.free')
                  : formatPrice(shippingCost)}
              </span>
            </div>

            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>{t('summary.total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200">
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-green-700">
                {t('securePayment')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}