// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { getCartData } from "@/server/actions/cart";

export async function GET() {
  try {
    const cartData = await getCartData();
    
    return NextResponse.json(cartData, {
      headers: {
        // Add cache headers for better performance
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json(
      { items: [], count: 0 },
      { status: 500 }
    );
  }
}