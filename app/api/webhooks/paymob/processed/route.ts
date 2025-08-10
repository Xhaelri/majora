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
      return false;
    }

    const concatenatedString = [
      data.obj.amount_cents,
      data.obj.created_at,
      data.obj.currency,
      data.obj.error_occured,
      data.obj.has_parent_transaction,
      data.obj.id,
      data.obj.integration_id,
      data.obj.is_3d_secure,
      data.obj.is_auth,
      data.obj.is_capture,
      data.obj.is_refunded,
      data.obj.is_standalone_payment,
      data.obj.is_voided,
      data.obj.order.id,
      data.obj.owner,
      data.obj.pending,
      data.obj.source_data.pan,
      data.obj.source_data.sub_type,
      data.obj.source_data.type,
      data.obj.success,
    ].join("");

    const calculatedSignature = crypto
      .createHmac("sha512", hmacSecret)
      .update(concatenatedString)
      .digest("hex");

    return calculatedSignature === signature;
  } catch (error) {
    console.log(error)
    return false;
  }
}

function determineOrderStatus(
  transaction: PaymobWebhookData["obj"]
): OrderStatus {
  if (transaction.success && !transaction.error_occured) {
    return "PROCESSING";
  }
  if (transaction.is_voided || transaction.is_refunded) {
    return "CANCELLED";
  }
  if (transaction.pending) {
    return "PENDING";
  }
  return "CANCELLED";
}

export async function POST(req: NextRequest) {
  try {
    const signature =
      req.headers.get("x-paymob-signature") ||
      req.headers.get("signature") ||
      "";
    const rawBody = await req.text();
    let data: PaymobWebhookData;
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
        console.log(error)
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (
      process.env.NODE_ENV === "production" &&
      !verifyWebhookSignature(data, signature)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { obj: transaction } = data;
    const merchantOrderId = transaction.order.merchant_order_id;

    if (!merchantOrderId) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { merchantOrderId: merchantOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const newStatus = determineOrderStatus(transaction);

    await db.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paymentTransactionId: transaction.id.toString(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
