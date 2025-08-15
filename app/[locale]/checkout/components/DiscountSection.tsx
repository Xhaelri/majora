import formatPrice from "@/utils/formatPrice";
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
  return (
    <>
        <div className="bg-white p-6  shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Discount Code</h2>

          {!appliedDiscount ? (
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="Enter discount code"
                className="flex-1 px-3 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={discountLoading}
              />
              <button
                onClick={handleApplyDiscount}
                disabled={discountLoading || !discountCode.trim()}
                className="px-4 py-2 bg-black text-white  hover:bg-black/80  disabled:cursor-not-allowed"
              >
                {discountLoading ? "Applying..." : "Apply"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
              <div>
                <span className="text-sm font-medium text-green-800">
                  Code &quot;{appliedDiscount.code}&quot; applied
                </span>
                <p className="text-xs text-green-600">
                  You saved {formatPrice(appliedDiscount.amount)}
                </p>
              </div>
              <button
                onClick={handleRemoveDiscount}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          )}
        </div>
    </>
  );
};

export default DiscountSection;
