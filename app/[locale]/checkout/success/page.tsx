// app/[locale]/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const t = useTranslations("checkout");

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        {/* <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" /> */}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t("success.title")}
        </h1>
        
        <p className="text-lg text-gray-600 mb-4">
          {t("success.description")}
        </p>
        
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              {t("success.orderIdLabel")}
            </p>
            <p className="text-lg font-mono text-gray-900">{orderId}</p>
          </div>
        )}
        
        <p className="text-gray-600 mb-8">
          {t("success.confirmationEmail")}
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
          >
            {t("success.continueShopping")}
          </Link>
          
          <Link
            href="/account/orders"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors"
          >
            {t("success.viewOrders")}
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("success.whatHappensNext")}
          </h2>
          <div className="text-left space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>{t("success.step1")}</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>{t("success.step2")}</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>{t("success.step3")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
