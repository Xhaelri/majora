import { XCircle, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function CheckoutFailedPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const isRTL = locale === "ar";
  const t = await getTranslations("checkout.failed");

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600">{t("description")}</p>
        </div>

        <div className="border-t border-b py-4 my-6">
          <div className="text-sm text-gray-600">
            <p className="mb-2">{t("possibleReasons")}</p>
            <ul className="space-y-1">
              <li>• {t("reason1")}</li>
              <li>• {t("reason2")}</li>
              <li>• {t("reason3")}</li>
              <li>• {t("reason4")}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">{t("cartSaved")}</p>

          <div className="flex space-x-3">
            <Link
              href="/cart"
              className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("returnToCart")}
            </Link>
          </div>

          <Link
            href="/"
            className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// export default function CheckoutFailedPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center">
//           Loading...
//         </div>
//       }
//     >
//       <FailedContent/>
//     </Suspense>
//   );
// }
