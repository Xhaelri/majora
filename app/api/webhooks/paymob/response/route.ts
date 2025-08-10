
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
  locale?: string; // Optional locale parameter
}

function verifyResponseSignature(query: PaymobResponseData): boolean {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error("PAYMOB_HMAC_SECRET not found in environment variables");
      return false;
    }

    // Create the concatenated string for response verification
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
    ].join('');

    const calculatedSignature = crypto
      .createHmac('sha512', hmacSecret)
      .update(concatenatedString)
      .digest('hex');

    return calculatedSignature === query.hmac;
  } catch (error) {
    console.error('Error verifying response signature:', error);
    return false;
  }
}

// Helper function to detect locale from referrer or default to 'en'
function detectLocale(request: NextRequest): string {
  const referer = request.headers.get('referer');
  if (referer) {
    const url = new URL(referer);
    const pathSegments = url.pathname.split('/');
    const potentialLocale = pathSegments[1];
    if (potentialLocale === 'ar' || potentialLocale === 'en') {
      return potentialLocale;
    }
  }
  return 'en'; // Default locale
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract all query parameters
    const queryData: Partial<PaymobResponseData> = {};
    searchParams.forEach((value, key) => {
      (queryData as any)[key] = value;
    });

    const orderId = queryData.merchant_order_id;
    const success = queryData.success === 'true';
    const hmac = queryData.hmac;
    
    // Detect locale from request
    const locale = queryData.locale || detectLocale(req);

    if (!orderId) {
      console.error('No merchant_order_id found in response');
      return NextResponse.redirect(new URL(`/${locale}/checkout/failed`, req.url));
    }

    // Verify signature if HMAC is provided
    if (hmac && !verifyResponseSignature(queryData as PaymobResponseData)) {
      console.error('Invalid response signature');
      return NextResponse.redirect(new URL(`/${locale}/checkout/failed`, req.url));
    }

    // Find the order
    const order = await db.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return NextResponse.redirect(new URL(`/${locale}/checkout/failed`, req.url));
    }

    // Update order status
    let newStatus: 'PROCESSING' | 'CANCELLED'  = 'CANCELLED';
    
    if (success && queryData.error_occured !== 'true') {
      newStatus = 'PROCESSING';
    } else if (queryData.is_voided === 'true' || queryData.is_refunded === 'true') {
      newStatus = 'CANCELLED';
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        paymentTransactionId: queryData.id || null,
        updatedAt: new Date(),
      }
    });

    // Log the transaction
    console.log(`Payment response processed for order ${orderId}: ${newStatus}`);

    // Redirect based on success/failure with proper locale
    const redirectUrl = success 
      ? `/${locale}/checkout/success?orderId=${orderId}`
      : `/${locale}/checkout/failed?orderId=${orderId}`;

    return NextResponse.redirect(new URL(redirectUrl, req.url));

  } catch (error) {
    console.error('Response processing error:', error);
    const locale = detectLocale(req);
    return NextResponse.redirect(new URL(`/${locale}/checkout/failed`, req.url));
  }
}

// Also handle POST requests for response callback
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const queryData: Partial<PaymobResponseData> = {};
    
    // Convert form data to query object
    formData.forEach((value, key) => {
      (queryData as any)[key] = value.toString();
    });

    const orderId = queryData.merchant_order_id;
    const success = queryData.success === 'true';

    if (!orderId) {
      return NextResponse.json({ error: 'No order ID' }, { status: 400 });
    }

    // Update order status
    const newStatus = success ? 'PROCESSING' : 'CANCELLED';
    
    await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        paymentTransactionId: queryData.id || null,
        updatedAt: new Date(),
      }
    });

    console.log(`Payment POST response processed for order ${orderId}: ${newStatus}`);

    return NextResponse.json({ success: true, orderId, status: newStatus });

  } catch (error) {
    console.error('Response POST processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}