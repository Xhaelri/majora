"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import formatPrice from "@/utils/formatPrice";
import {
  createCheckoutSession,
  getShippingRate,
  getUserData,
  validateDiscountCode,
} from "@/server/actions/checkout-actions";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import DiscountSection from "./DiscountSection";
import BillingForm from "./BillingForm";
import PaymentIframe from "./PaymentIframe";

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

export default function CheckoutPage() {
  const { items: cartItems, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentKey, setPaymentKey] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Discount state
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
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

  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Load user data and handle discount from URL on component mount
  useEffect(() => {
    const loadUserDataAndDiscount = async () => {
      try {
        // Load user data if authenticated
        if (session) {
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

        // Check for discount code in URL parameters
        const urlDiscountCode = searchParams.get("discount");
        if (urlDiscountCode) {
          setDiscountCode(urlDiscountCode);

          // Auto-apply the discount code from the cart
          const subtotal = cartItems.reduce((sum, item) => {
            const fullPrice = item.productVariant.product.price;
            return sum + fullPrice * item.quantity;
          }, 0);

          const saleDiscount = cartItems.reduce((sum, item) => {
            const { price, salePrice } = item.productVariant.product;
            if (salePrice && salePrice < price) {
              return sum + (price - salePrice) * item.quantity;
            }
            return sum;
          }, 0);

          const orderAmount = subtotal - saleDiscount;

          if (orderAmount > 0) {
            setDiscountLoading(true);
            try {
              const result = await validateDiscountCode(urlDiscountCode, orderAmount);
              if (result.discount) {
                setAppliedDiscount(result.discount);
              } else if (result.error) {
                setError(`Discount error: ${result.error}`);
              }
            } catch (error) {
              console.error("Failed to apply URL discount:", error);
            } finally {
              setDiscountLoading(false);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }finally {
        setInitializing(false);
      }
    };

      loadUserDataAndDiscount();
  }, [session, searchParams, cartItems]);


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

  // Calculate totals - now only uses cart items
  const subtotal = cartItems.reduce((sum, item) => {
    const fullPrice = item.productVariant.product.price;
    return sum + fullPrice * item.quantity;
  }, 0);

  const saleDiscount = cartItems.reduce((sum, item) => {
    const { price, salePrice } = item.productVariant.product;
    if (salePrice && salePrice < price) {
      return sum + (price - salePrice) * item.quantity;
    }
    return sum;
  }, 0);

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
      setError("Please enter a discount code");
      return;
    }

    setDiscountLoading(true);
    setError(null);

    try {
      const result = await validateDiscountCode(discountCode, subtotal - saleDiscount);

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
        setError(
          `${
            field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, " $1")
          } is required`
        );
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^(\+201|01)[0-9]{9}$/;
    if (!phoneRegex.test(billingData.phoneNumber.replace(/\s/g, ""))) {
      setError(
        "Please enter a valid Egyptian phone number (01xxxxxxxxx or +201xxxxxxxxx)"
      );
      return false;
    }

    return true;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) return;
    if (shippingCost === null) {
      setError("Please select a governorate to calculate shipping.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Pass the discount code (not the amount) to server for re-validation
      const result = await createCheckoutSession(
        billingData,
        appliedDiscount?.code,
        shippingCost
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setPaymentKey(result.paymentKey);
      setShowPayment(true);
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };



  if (count === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p>Add some items to your cart before checking out.</p>
        </div>
      </div>
    );
  }

    if (initializing || session === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-5">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="flex flex-col-reverse lg:flex-row gap-8">
        {/* Left Column - Forms and Cart Summary */}
        <div className="space-y-8 lg:max-w-1/2 order-1">
          {/* Discount Code Section */}
          {!showPayment && (
            <DiscountSection
              appliedDiscount={appliedDiscount}
              discountCode={discountCode}
              discountLoading={discountLoading}
              setDiscountCode={setDiscountCode}
              handleApplyDiscount={handleApplyDiscount}
              handleRemoveDiscount={handleRemoveDiscount}
            />
          )}

          {/* Billing Information Form */}
          {!showPayment && (
            <BillingForm
              loading={loading}
              error={error}
              billingData={billingData}
              handleInputChange={handleInputChange}
              handleProceedToPayment={handleProceedToPayment}
            />
          )}

          {/* Payment Iframe */}
          {showPayment && paymentKey && (
            <PaymentIframe paymentKey={paymentKey} />
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white p-6 shadow-sm border h-fit sticky top-4 lg:max-w-1/2 order-2">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          {/* Cart Items */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-2 bg-gray-50 rounded-md"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                  {item.productVariant.images?.[0] && (
                    <Image
                      src={item.productVariant.images[0].url.trimStart()}
                      alt={item.productVariant.images[0].altText}
                      className="w-full h-full object-cover"
                      width={16}
                      height={16}
                    />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {item.productVariant.product.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {item.productVariant.size.name} •{" "}
                    {item.productVariant.color.name}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-medium flex-shrink-0">
                  {formatPrice(
                    (item.productVariant.product.salePrice ||
                      item.productVariant.product.price) * item.quantity
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({count} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {saleDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Sale Discount</span>
                <span>-{formatPrice(saleDiscount)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Coupon Discount ({appliedDiscount?.code})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span className={shippingCost === null ? "text-gray-500" : ""}>
                {shippingCost === null
                  ? "Select governorate"
                  : shippingCost === 0
                  ? "Free"
                  : formatPrice(shippingCost)}
              </span>
            </div>

            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 ">
            <div className="flex items-center">
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
                Secure payment powered by Paymob
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}