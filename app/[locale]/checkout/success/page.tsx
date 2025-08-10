// app/checkout/success/page.tsx
import { Suspense } from 'react';
import { CheckCircle, Package, Clock } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        <div className="border-t border-b py-4 my-6">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Processing
            </div>
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              1-3 Business Days
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You will receive an email confirmation shortly with your order details.
          </p>
          
          <div className="flex space-x-3">
            <Link 
              href="/orders" 
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors text-sm"
            >
              View Orders
            </Link>
            <Link 
              href="/" 
              className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}