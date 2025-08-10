"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Thank You for Your Order!</h1>
      <p className="mb-2">
        Your payment was successful and your order has been placed.
      </p>
      {orderId && (
        <p className="text-gray-600 mb-6">Your Order ID is: {orderId}</p>
      )}
      <Link
        href="/"
        className="bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
