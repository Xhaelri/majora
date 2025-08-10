// app/checkout/failed/page.tsx
import { Suspense } from 'react';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

function FailedContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>
        </div>

        <div className="border-t border-b py-4 my-6">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Common reasons for payment failure:</p>
            <ul className="text-left space-y-1">
              <li>• Insufficient funds</li>
              <li>• Incorrect card details</li>
              <li>• Card expired or blocked</li>
              <li>• Network connection issues</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Your cart items are still saved. You can try completing your purchase again.
          </p>
          
          <div className="flex space-x-3">
            <Link 
              href="/checkout" 
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors text-sm flex items-center justify-center"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Link>
            <Link 
              href="/cart" 
              className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Link>
          </div>
          
          <Link 
            href="/" 
            className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}