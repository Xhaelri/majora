
// app/[locale]/checkout/failed/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { XCircleIcon } from "@heroicons/react/24/solid";

export default function CheckoutFailedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const t = useTranslations("checkout");

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t("failed.title")}
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          {t("failed.description")}
        </p>
        
        {orderId && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-red-600 mb-1">
              {t("failed.orderIdLabel")}
            </p>
            <p className="text-lg font-mono text-red-800">{orderId}</p>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            {t("failed.possibleReasons")}
          </h3>
          <ul className="text-left text-sm text-yellow-700 space-y-1">
            <li>• {t("failed.reason1")}</li>
            <li>• {t("failed.reason2")}</li>
            <li>• {t("failed.reason3")}</li>
            <li>• {t("failed.reason4")}</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/checkout"
            className="block w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
          >
            {t("failed.tryAgain")}
          </Link>
          
          <Link
            href="/cart"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors"
          >
            {t("failed.returnToCart")}
          </Link>
          
          <Link
            href="/"
            className="block w-full text-gray-600 py-2 px-6 hover:text-gray-800 transition-colors"
          >
            {t("failed.continueShopping")}
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {t("failed.needHelp")}{" "}
            <Link 
              href="/contact" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("failed.contactSupport")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}