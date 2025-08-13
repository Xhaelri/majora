// app/checkout/success/page.tsx
import { CheckCircle, Package, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function CheckoutSuccessPage() {
  const t = await getTranslations("checkout.success");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">{t("description")}</p>
        </div>
        <div className="border-t border-b py-4 my-6">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {t("processing")}
            </div>
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2" />
              {t("step3")}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex space-x-3">
            <Link
              href="/account"
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors text-sm"
            >
              {t("viewOrders")}
            </Link>
            <Link
              href="/"
              className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
