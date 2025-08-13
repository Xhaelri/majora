import React from "react";

type Props = {
  paymentKey: string | null;
};

const PaymentIframe = ({ paymentKey }: Props) => {
  return (
    <>
      <div className="bg-white p-6  shadow-sm border lg:min-w-[400px]">
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
    </>
  );
};

export default PaymentIframe;
