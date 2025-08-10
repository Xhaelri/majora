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
    // Additional fields that might be present
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

    // Convert boolean and number values to strings as Paymob expects
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
    // Default to CANCELLED for any other case (failed transactions, etc.)
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

export async function POST(req: NextRequest) {
  try {
    // Get signature from headers (try multiple possible header names)
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
      console.log("⚠️ Webhook signature verification skipped");
    }

    const { obj: transaction } = data;
    const merchantOrderId = transaction.order.merchant_order_id;

    if (!merchantOrderId) {
      console.error("❌ No merchant_order_id in webhook data");
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    console.log("🔍 Looking for order with merchantOrderId:", merchantOrderId);

    // Find the order using merchantOrderId
    const order = await db.order.findUnique({
      where: { merchantOrderId: merchantOrderId },
      include: {
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
      console.error(
        `❌ Order not found with merchantOrderId: ${merchantOrderId}`
      );
      // Try to find by internal ID as fallback
      const orderById = await db.order.findUnique({
        where: { id: merchantOrderId },
      });

      if (orderById) {
        console.log("🔄 Found order by internal ID, updating merchantOrderId");
        await db.order.update({
          where: { id: merchantOrderId },
          data: { merchantOrderId: merchantOrderId },
        });
      } else {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    }

    console.log("📦 Order found:", {
      id: order?.id || merchantOrderId,
      currentStatus: order?.status,
      totalAmount: order?.totalAmount,
    });

    const { status: newStatus, isSuccess } = determineOrderStatus(transaction);

    // Update the order with new status and transaction details
    const updatedOrder = await db.order.update({
      where: {
        merchantOrderId: merchantOrderId,
      },
      data: {
        status: newStatus,
        paymentTransactionId: transaction.id.toString(),
        paymobOrderId: transaction.order.id.toString(),
        // Ensure merchantOrderId is saved if it wasn't before
        merchantOrderId: merchantOrderId,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Order ${updatedOrder.id} updated successfully:`, {
      oldStatus: order?.status,
      newStatus: newStatus,
      transactionId: transaction.id,
      paymobOrderId: transaction.order.id,
      merchantOrderId: merchantOrderId,
      isSuccess: isSuccess,
    });

    // Log the webhook processing result
    console.log("🎯 Webhook processing completed:", {
      orderId: updatedOrder.id,
      status: newStatus,
      success: isSuccess,
      transactionId: transaction.id,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      orderId: updatedOrder.id,
      status: newStatus,
    });
  } catch (error) {
    console.error("💥 Webhook processing error:", error);

    // Return a more detailed error response
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

// Handle GET requests (some webhook services might send GET)
export async function GET(req: NextRequest) {
  console.log("ℹ️ GET request received on webhook endpoint");
  return NextResponse.json(
    { message: "Webhook endpoint is active. Use POST for webhook data." },
    { status: 200 }
  );
}
