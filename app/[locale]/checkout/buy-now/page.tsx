// app/checkout/buy-now/page.tsx
import { Metadata } from "next";
import BuyNowCheckoutPage from "../components/BuyNowComponent";

export const metadata: Metadata = {
  title: "Buy Now Checkout | Your Store",
  description: "Complete your purchase quickly with our express buy now checkout",
};

export default function BuyNowPage() {
  return <BuyNowCheckoutPage />;
}