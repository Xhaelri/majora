import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const success = searchParams.get('success');
    const orderId = searchParams.get('merchant_order_id');

    if (orderId) {
        if (success === 'true') {
            await db.order.update({
                where: { id: orderId },
                data: { status: 'PROCESSING' }
            });
            // Optionally, you can clear the cart here as a fallback
            // but it's better to do it when the order is created.
        } else {
            await db.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });
        }
    }
    
    // Redirect to a success or failure page
    const redirectUrl = success === 'true' 
        ? `/order-confirmation?orderId=${orderId}`
        : `/order-failed?orderId=${orderId}`;

    return NextResponse.redirect(new URL(redirectUrl, req.url));
}