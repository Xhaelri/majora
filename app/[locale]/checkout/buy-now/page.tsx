// app/checkout/buy-now/page.tsx
import { Metadata } from "next";
import BuyNowCheckoutPage from "../components/BuyNowComponent";

export const metadata: Metadata = {
  title: "Buy Now Checkout | Majora",
  description:
    "Complete your purchase quickly with our express buy now checkout",
};

export default function BuyNowPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <BuyNowCheckoutPage />
      </div>
    </div>
  );
}
