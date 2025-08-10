import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

// 1. UPDATED: More accurate type definition, especially for the nested 'data' object.
interface PaymobWebhookData {
  type: "TRANSACTION" | "TOKEN"; // And other possible types
  obj: {
    id: number;
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_standalone_payment: boolean;
    is_voided: boolean;
    is_refunded: boolean;
    is_3d_secure: boolean;
    integration_id: number;
    profile_id: number;
    has_parent_transaction: boolean;
    order: {
      id: number;
      created_at: string;
      merchant_order_id: string | null; // Acknowledged that it can be null
    };
    created_at: string;
    currency: string;
    source_data: {
      pan: string;
      type: string;
      sub_type: string;
    };
    // This 'data' object contains crucial response codes
    data: {
      txn_response_code?: string;
      acq_response_code?: string;
      message?: string;
    };
    error_occured: boolean;
    owner: number;
    parent_transaction: null | Record<string, unknown>;
  };
}

type OrderStatus = "PROCESSING" | "CANCELLED" | "PENDING";

function verifyWebhookSignature(
  data: PaymobWebhookData,
  signature: string
): boolean {
  // This function appears correct according to Paymob docs. No changes needed.
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error("PAYMOB_HMAC_SECRET not found in environment variables");
      return false;
    }

    const concatenatedString = [
      data.obj.amount_cents.toString(),
      data.obj.created_at,
      data.obj.currency,
      data.obj.error_occured.toString(),
      data.obj.has_parent_transaction.toString(),
      data.obj.id.toString(),
      data.obj.integration_id.toString(),
      data.obj.is_3d_secure.toString(),
      data.obj.is_auth.toString(),
      data.obj.is_capture.toString(),
      data.obj.is_refunded.toString(),
      data.obj.is_standalone_payment.toString(),
      data.obj.is_voided.toString(),
      data.obj.order.id.toString(),
      data.obj.owner.toString(),
      data.obj.pending.toString(),
      data.obj.source_data.pan,
      data.obj.source_data.sub_type,
      data.obj.source_data.type,
      data.obj.success.toString(),
    ].join("");

    const calculatedSignature = crypto
      .createHmac("sha512", hmacSecret)
      .update(concatenatedString)
      .digest("hex");

    console.log("🔐 Signature verification:", {
      match: calculatedSignature === signature,
    });

    return calculatedSignature === signature;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

// 2. UPDATED: Simplified and more accurate status determination logic.
function determineOrderStatus(transaction: PaymobWebhookData["obj"]): {
  status: OrderStatus;
  isSuccess: boolean;
} {
  const isSuccess = transaction.success && !transaction.error_occured;
  let status: OrderStatus;

  if (isSuccess) {
    status = "PROCESSING";
  } else if (transaction.pending) {
    status = "PENDING";
  } else {
    // Covers failed, voided, refunded, etc.
    status = "CANCELLED";
  }

  console.log("📊 Transaction status determination:", {
    success: transaction.success,
    pending: transaction.pending,
    error_occured: transaction.error_occured,
    final_status: status,
    is_success_for_actions: isSuccess,
  });

  return { status, isSuccess };
}

async function clearUserCart(userId: string) {
  try {
    console.log(`🧹 Clearing cart for user: ${userId}`);
    const cart = await db.cart.findUnique({ where: { userId } });
    if (cart) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
      console.log(`✅ Cart cleared for user: ${userId}`);
    }
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-paymob-signature") || "";
    const rawBody = await req.text();
    const data: PaymobWebhookData = JSON.parse(rawBody);

    console.log("🔔 Webhook received:", {
      type: data.type,
      transactionId: data.obj.id,
      paymobOrderId: data.obj.order.id,
      merchantOrderId: data.obj.order.merchant_order_id,
    });

    // We'll skip signature verification in dev, but it's crucial for production.
    if (process.env.NODE_ENV === "production") {
      if (!signature || !verifyWebhookSignature(data, signature)) {
        console.error("❌ Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
      console.log("✅ Webhook signature verified");
    } else {
      console.log("⚠️ Signature verification skipped (dev mode)");
    }

    const { obj: transaction } = data;

    // 3. UPDATED: Flexible order identification logic.
    const merchantOrderId = transaction.order.merchant_order_id;
    const paymobOrderId = transaction.order.id.toString();

    if (!merchantOrderId && !paymobOrderId) {
      console.error("❌ No merchant_order_id or paymob order ID found in webhook.");
      return NextResponse.json({ error: "Missing order identifier" }, { status: 400 });
    }

    // 4. UPDATED: Dynamic database query.
    // This now searches for EITHER the merchantOrderId OR the paymobOrderId.
    // Ensure you have a 'paymobOrderId' field (or similar) on your Order model.
    const order = await db.order.findFirst({
      where: {
        OR: [
          ...(merchantOrderId ? [{ merchantOrderId: merchantOrderId }] : []),
          ...(paymobOrderId ? [{ paymobOrderId: paymobOrderId }] : []),
        ],
      },
      include: { user: true },
    });

    if (!order) {
      console.error(`❌ Order not found with merchantOrderId: '${merchantOrderId}' or paymobOrderId: '${paymobOrderId}'`);
      // Return 200 OK to prevent Paymob from retrying a webhook for an order you can't find.
      return NextResponse.json({ message: "Order not found, but webhook acknowledged." });
    }

    console.log("📦 Order found:", {
      id: order.id,
      currentStatus: order.status,
    });

    // Avoid reprocessing an already finalized order
    if (order.status === "PROCESSING" || order.status === "CANCELLED") {
      console.log(`- Order ${order.id} is already finalized. No update needed.`);
      return NextResponse.json({ message: "Order already processed." });
    }

    const { status: newStatus, isSuccess } = determineOrderStatus(transaction);

    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paymentTransactionId: transaction.id.toString(),
        // You are already saving paymobOrderId, which is great!
        updatedAt: new Date(),
      },
    });

    if (isSuccess && order.userId) {
      await clearUserCart(order.userId);
    }

    console.log(`✅ Order ${updatedOrder.id} updated successfully to ${newStatus}`);
    return NextResponse.json({ success: true, newStatus: newStatus });

  } catch (error) {
    console.error("💥 Webhook processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Webhook processing failed", details: errorMessage }, { status: 500 });
  }
}

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