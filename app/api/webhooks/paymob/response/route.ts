import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

interface PaymobWebhookData {
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
      merchant_order_id: string;
    };
    created_at: string;
    currency: string;
    source_data: {
      pan: string;
      type: string;
      sub_type: string;
    };
    error_occured: boolean;
    owner: number;
    parent_transaction: null | Record<string, unknown>;
    txn_response_code?: string;
    acq_response_code?: string;
  };
  type: string;
}

type OrderStatus = "PROCESSING" | "CANCELLED" | "PENDING";

function verifyWebhookSignature(
  data: PaymobWebhookData,
  signature: string
): boolean {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error("PAYMOB_HMAC_SECRET not found in environment variables");
      return false;
    }

    // Paymob expects these values in this exact order and format
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
      provided: signature,
      calculated: calculatedSignature,
      match: calculatedSignature === signature,
    });

    return calculatedSignature === signature;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

function determineOrderStatus(transaction: PaymobWebhookData["obj"]): {
  status: OrderStatus;
  isSuccess: boolean;
} {
  // Check for success - must be true AND no error occurred
  const isTransactionSuccess =
    transaction.success && !transaction.error_occured;

  // Additional check for transaction response code if available
  const isApproved =
    transaction.txn_response_code === "APPROVED" ||
    transaction.acq_response_code === "APPROVED";

  // Consider it successful if basic success is true OR if we have an approved response code
  const isSuccess = isTransactionSuccess || (transaction.success && isApproved);

  let status: OrderStatus;

  if (isSuccess) {
    status = "PROCESSING";
  } else if (transaction.is_voided || transaction.is_refunded) {
    status = "CANCELLED";
  } else if (transaction.pending) {
    status = "PENDING";
  } else {
    status = "CANCELLED";
  }

  console.log("📊 Transaction status determination:", {
    success: transaction.success,
    error_occured: transaction.error_occured,
    pending: transaction.pending,
    is_voided: transaction.is_voided,
    is_refunded: transaction.is_refunded,
    txn_response_code: transaction.txn_response_code,
    final_status: status,
    is_success: isSuccess,
  });

  return { status, isSuccess };
}

// Helper function to clear user cart after successful payment
async function clearUserCart(userId: string) {
  try {
    console.log(`🧹 Clearing cart for user: ${userId}`);
    
    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (cart) {
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      console.log(`✅ Cart cleared for user: ${userId}`);
    }
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get signature from headers
    const signature =
      req.headers.get("x-paymob-signature") ||
      req.headers.get("signature") ||
      req.headers.get("hmac") ||
      "";

    console.log("🔔 Webhook received with headers:", {
      signature: signature ? "present" : "missing",
      contentType: req.headers.get("content-type"),
      userAgent: req.headers.get("user-agent"),
    });

    const rawBody = await req.text();
    console.log("📝 Raw webhook body:", rawBody.substring(0, 500) + "...");

    let data: PaymobWebhookData;
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      console.error("❌ Invalid JSON payload:", error);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    console.log("📦 Parsed webhook data:", {
      type: data.type,
      transactionId: data.obj.id,
      orderId: data.obj.order.id,
      merchantOrderId: data.obj.order.merchant_order_id,
      success: data.obj.success,
      pending: data.obj.pending,
      error_occured: data.obj.error_occured,
    });

    // Verify signature only in production and if signature is provided
    if (process.env.NODE_ENV === "production" && signature) {
      if (!verifyWebhookSignature(data, signature)) {
        console.error("❌ Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
      console.log("✅ Webhook signature verified");
    } else {
      console.log("⚠️ Webhook signature verification skipped (dev mode)");
    }

    const { obj: transaction } = data;
    const merchantOrderId = transaction.order.merchant_order_id;

    if (!merchantOrderId) {
      console.error("❌ No merchant_order_id in webhook data");
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    console.log("🔍 Looking for order with merchantOrderId:", merchantOrderId);

    // Find the order using merchantOrderId
    const order = await db.order.findFirst({
      where: { 
        OR: [
          { merchantOrderId: merchantOrderId },
          { id: merchantOrderId } // Fallback to internal ID
        ]
      },
      include: {
        user: true,
        orderItems: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      console.error(`❌ Order not found with merchantOrderId: ${merchantOrderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("📦 Order found:", {
      id: order.id,
      currentStatus: order.status,
      totalAmount: order.totalAmount,
      userId: order.userId,
    });

    const { status: newStatus, isSuccess } = determineOrderStatus(transaction);

    // Update the order with new status and transaction details
    const updatedOrder = await db.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: newStatus,
        paymentTransactionId: transaction.id.toString(),
        paymobOrderId: transaction.order.id.toString(),
        merchantOrderId: merchantOrderId,
        updatedAt: new Date(),
      },
    });

    // Clear cart only if payment is successful and user exists
    if (isSuccess && order.userId) {
      await clearUserCart(order.userId);
    }

    console.log(`✅ Order ${updatedOrder.id} updated successfully:`, {
      oldStatus: order.status,
      newStatus: newStatus,
      transactionId: transaction.id,
      paymobOrderId: transaction.order.id,
      merchantOrderId: merchantOrderId,
      isSuccess: isSuccess,
      cartCleared: isSuccess && order.userId ? true : false,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      orderId: updatedOrder.id,
      status: newStatus,
    });
  } catch (error) {
    console.error("💥 Webhook processing error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Handle GET requests - this is what's being called after payment redirect
export async function GET(req: NextRequest) {
  console.log("ℹ️ GET request received on webhook endpoint");
  
  const { searchParams } = new URL(req.url);
  
  // Log all query parameters for debugging
  console.log("🔍 GET request parameters:", Object.fromEntries(searchParams.entries()));
  
  // Extract common Paymob response parameters
  const success = searchParams.get('success');
  const txn_response_code = searchParams.get('txn_response_code');
  const merchant_order_id = searchParams.get('merchant_order_id');
  const order_id = searchParams.get('order');
  
  // If we have payment result parameters, this is a payment redirect
  if (success !== null || merchant_order_id || order_id) {
    console.log("🔄 Payment redirect detected:", {
      success,
      txn_response_code,
      merchant_order_id,
      order_id,
    });
    
    // Redirect to a success/failure page based on success parameter
    const isSuccessful = success === 'true' || txn_response_code === 'APPROVED';
    const redirectUrl = isSuccessful 
      ? `/checkout/success?order=${merchant_order_id || order_id}`
      : `/checkout/failed?order=${merchant_order_id || order_id}`;
    
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
  
  // Regular GET request to webhook endpoint
  return NextResponse.json(
    { 
      message: "Webhook endpoint is active. Use POST for webhook data.",
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}