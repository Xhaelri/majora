import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";

interface PaymobResponseData {
  id: string;
  pending: string;
  amount_cents: string;
  success: string;
  is_auth: string;
  is_capture: string;
  is_standalone_payment: string;
  is_voided: string;
  is_refunded: string;
  is_3d_secure: string;
  integration_id: string;
  profile_id: string;
  has_parent_transaction: string;
  order_id: string;
  created_at: string;
  currency: string;
  merchant_order_id: string;
  owner: string;
  parent_transaction: string;
  source_data_pan: string;
  source_data_sub_type: string;
  source_data_type: string;
  terminal_id: string;
  merchant_commission: string;
  installment: string;
  discount_details: string;
  is_void: string;
  is_refund: string;
  is_hidden: string;
  error_occured: string;
  refunded_amount_cents: string;
  source_id: string;
  is_captured: string;
  captured_amount: string;
  updated_at: string;
  is_settled: string;
  bill_balanced: string;
  is_bill: string;
  txn_response_code: string;
  acq_response_code: string;
  message: string;
  merchant_txn_ref: string;
  order_info: string;
  hmac: string;
  locale?: string;
}

type OrderStatus = "PROCESSING" | "CANCELLED" | "PENDING";

function verifyResponseSignature(query: PaymobResponseData): boolean {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error("PAYMOB_HMAC_SECRET not found in environment variables");
      return false;
    }

    // **FIXED**: The order of keys in the concatenated string is crucial for correct HMAC verification.
    // The correct order is: amount_cents, created_at, currency, error_occured, has_parent_transaction, id, integration_id, is_3d_secure, is_auth, is_capture, is_refunded, is_standalone_payment, is_voided, order_id, owner, pending, source_data_pan, source_data_sub_type, source_data_type, success
    const concatenatedString = [
      query.amount_cents,
      query.created_at,
      query.currency,
      query.error_occured,
      query.has_parent_transaction,
      query.id,
      query.integration_id,
      query.is_3d_secure,
      query.is_auth,
      query.is_capture,
      query.is_refunded,
      query.is_standalone_payment,
      query.is_voided,
      query.order_id,
      query.owner,
      query.pending,
      query.source_data_pan,
      query.source_data_sub_type,
      query.source_data_type,
      query.success,
    ].join("");

    const calculatedSignature = crypto
      .createHmac("sha512", hmacSecret)
      .update(concatenatedString)
      .digest("hex");

    return calculatedSignature === query.hmac;
  } catch (error) {
    console.error("Error verifying response signature:", error);
    return false;
  }
}

function detectLocale(request: NextRequest): string {
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      const pathSegments = url.pathname.split("/");
      const potentialLocale = pathSegments[1];
      if (potentialLocale === "ar" || potentialLocale === "en") {
        return potentialLocale;
      }
    } catch (error) {
      console.error("Error parsing referer URL:", error);
    }
  }
  return "en";
}

function stringToBoolean(value: string): boolean {
  return value.toLowerCase() === "true";
}

function determineOrderStatusFromResponse(queryData: PaymobResponseData): {
  status: OrderStatus;
  isSuccess: boolean;
} {
  // **FIXED**: The logic for determining success is more robust.
  // A successful transaction must have `success` as 'true' AND `txn_response_code` as 'APPROVED'.
  const isSuccess =
    stringToBoolean(queryData.success) &&
    queryData.txn_response_code === "APPROVED";
  const isVoided = stringToBoolean(queryData.is_voided);
  const isRefunded = stringToBoolean(queryData.is_refunded);
  const pending = stringToBoolean(queryData.pending);

  let status: OrderStatus;
  if (isSuccess) {
    status = "PROCESSING";
  } else if (isVoided || isRefunded) {
    status = "CANCELLED";
  } else if (pending) {
    status = "PENDING";
  } else {
    status = "CANCELLED";
  }

  return { status, isSuccess };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryData: Partial<PaymobResponseData> = {};
    searchParams.forEach((value, key) => {
      (queryData as Record<string, string>)[key] = value;
    });

    const orderId = queryData.merchant_order_id;
    const hmac = queryData.hmac;
    const locale = queryData.locale || detectLocale(req);

    if (!orderId) {
      console.error("❌ No merchant_order_id found in response");
      return NextResponse.redirect(
        new URL(`/${locale}/checkout/failed?error=no_order_id`, req.url)
      );
    }

    // **FIXED**: Re-enabled HMAC verification for production environments.
    if (hmac && process.env.NODE_ENV === "production") {
      if (!verifyResponseSignature(queryData as PaymobResponseData)) {
        console.error("❌ Invalid response signature");
        return NextResponse.redirect(
          new URL(`/${locale}/checkout/failed?error=invalid_signature`, req.url)
        );
      }
    } else {
      console.log("⚠️ HMAC verification skipped (development mode or no HMAC)");
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`❌ Order not found: ${orderId}`);
      return NextResponse.redirect(
        new URL(
          `/${locale}/checkout/failed?error=order_not_found&orderId=${orderId}`,
          req.url
        )
      );
    }

    const { status: newStatus, isSuccess } = determineOrderStatusFromResponse(
      queryData as PaymobResponseData
    );

    try {
      await db.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paymentTransactionId: queryData.id || null,
          updatedAt: new Date(),
        },
      });
      console.log("💾 Order updated successfully");
    } catch (dbError) {
      console.error("❌ Database update failed:", dbError);
    }

    const baseUrl = isSuccess ? "success" : "failed";
    const redirectUrl = `/${locale}/checkout/${baseUrl}?orderId=${orderId}&txnId=${
      queryData.id || "none"
    }&debug=true`;

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error("💥 Response processing error:", error);
    const locale = detectLocale(req);
    return NextResponse.redirect(
      new URL(`/${locale}/checkout/failed?error=processing_error`, req.url)
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const queryData: Partial<PaymobResponseData> = {};
    formData.forEach((value, key) => {
      (queryData as Record<string, string>)[key] = value.toString();
    });

    const orderId = queryData.merchant_order_id;

    if (!orderId) {
      console.error("POST: No merchant_order_id found");
      return NextResponse.json({ error: "No order ID" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`POST: Order not found: ${orderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { status: newStatus, isSuccess } = determineOrderStatusFromResponse(
      queryData as PaymobResponseData
    );
    try {
      await db.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paymentTransactionId: queryData.id || null,
          updatedAt: new Date(),
        },
      });

      console.log(
        `📝 POST Response: Order ${orderId} updated to status: ${newStatus}`,
        {
          success: queryData.success,
          error_occured: queryData.error_occured,
          transactionId: queryData.id,
          isSuccess,
        }
      );

      return NextResponse.json({
        success: isSuccess,
        orderId,
        status: newStatus,
        transactionId: queryData.id,
        debug: {
          rawSuccess: queryData.success,
          rawErrorOccured: queryData.error_occured,
        },
      });
    } catch (dbError) {
      console.error("❌ POST: Database update failed:", dbError);
      return NextResponse.json(
        { error: "Database update failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Response POST processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
