import formatPrice from "@/utils/formatPrice";
import { useTranslations } from "next-intl";
import React from "react";

interface AppliedDiscount {
  code: string;
  amount: number;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}

type Props = {
  appliedDiscount: AppliedDiscount | null;
  discountCode: string;
  discountLoading: boolean;
  setDiscountCode: (value: React.SetStateAction<string>) => void;
  handleApplyDiscount: () => Promise<void>;
  handleRemoveDiscount: () => void;
};

const DiscountSection = ({
  appliedDiscount,
  discountCode,
  discountLoading,
  setDiscountCode,
  handleApplyDiscount,
  handleRemoveDiscount,
}: Props) => {
  const  t  = useTranslations('common');

  return (
    <>
      <div className="bg-white p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">{t('checkout.discountCode')}</h2>

        {!appliedDiscount ? (
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder={t('checkout.discount.enterCode')}
              className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={discountLoading}
            />
            <button
              onClick={handleApplyDiscount}
              disabled={discountLoading || !discountCode.trim()}
              className="px-4 py-2 bg-black text-white hover:bg-black/80 disabled:cursor-not-allowed"
            >
              {discountLoading ? t('checkout.discount.applying') : t('checkout.discount.apply')}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
            <div>
              <span className="text-sm font-medium text-green-800">
                {t('checkout.discount.code')} &quot;{appliedDiscount.code}&quot; {t('checkout.discount.applied')}
              </span>
              <p className="text-xs text-green-600">
                {t('checkout.discount.youSaved')} {formatPrice(appliedDiscount.amount)}
              </p>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              {t('checkout.discount.remove')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DiscountSection;