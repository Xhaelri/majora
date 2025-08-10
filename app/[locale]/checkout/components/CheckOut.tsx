"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import formatPrice from "@/utils/formatPrice";
import {
  createCheckoutSession,
  getShippingRate,
  getUserData,
} from "@/server/actions/checkout-actions";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

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

const EGYPT_GOVERNORATES = [
  "Alexandria",
  "Assiut",
  "Aswan",
  "Beheira",
  "Bani Suef",
  "Cairo",
  "Dakahlia",
  "Damietta",
  "Fayyoum",
  "Gharbiya",
  "Giza",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Marsa Matrouh",
  "Minya",
  "Monofiya",
  "New Valley",
  "North Sinai",
  "Port Said",
  "Qalioubiya",
  "Qena",
  "Red Sea",
  "Sharqiya",
  "Sohag",
  "South Sinai",
  "Suez",
];

export default function CheckoutPage() {
  const { items: cartItems, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentKey, setPaymentKey] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [shippingCost, setShippingCost] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const discountCode = searchParams.get("discountCode") || undefined;
  const discountAmount = Number(searchParams.get("discountAmount")) || 0;

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
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
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
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setInitializing(false);
      }
    };

    loadUserData();
  }, []);

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
      const result = await createCheckoutSession(
        billingData,
        discountCode,
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
  if (initializing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Forms and Cart Summary */}
        <div className="space-y-8">
          {/* Billing Information Form */}
          {!showPayment && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-6">
                Billing Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={billingData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={billingData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="01xxxxxxxxx"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 01xxxxxxxxx or +201xxxxxxxxx
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={billingData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ahmed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={billingData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mohamed"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={billingData.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Building
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={billingData.building}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Building A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Apartment
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={billingData.apartment}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Apt 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Floor
                  </label>
                  <input
                    type="text"
                    name="floor"
                    value={billingData.floor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1st Floor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={billingData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mansoura"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Governorate *
                  </label>
                  <select
                    name="state"
                    value={billingData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Governorate</option>
                    {EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={billingData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country
                  </label>
                  <select
                    name="country"
                    value={billingData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Egypt">Egypt</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={loading}
                className="mt-6 w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          )}

          {/* Payment Iframe */}
          {showPayment && paymentKey && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-6">Complete Payment</h2>
              <div className="relative">
                <iframe
                  src={`https://accept.paymob.com/api/acceptance/iframes/${process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  className="border rounded-md"
                  title="Payment Gateway"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border h-fit sticky top-4">
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
                <span>Coupon Discount</span>
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
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
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
