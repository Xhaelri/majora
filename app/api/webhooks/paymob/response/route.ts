import { NextRequest, NextResponse } from "next/server";

// Your GET handler for user redirection remains the same.
export async function GET(req: NextRequest) {
  console.log("ℹ️ GET request received on webhook endpoint for user redirection.");
  const { searchParams } = new URL(req.url);

  const success = searchParams.get('success');
  const merchant_order_id = searchParams.get('merchant_order_id');
  const order_id = searchParams.get('order');

  const isSuccessful = success === 'true';
  const redirectUrl = isSuccessful 
    ? `/checkout/success?order=${merchant_order_id || order_id}`
    : `/checkout/failed?order=${merchant_order_id || order_id}`;

  return NextResponse.redirect(new URL(redirectUrl, req.url));
}