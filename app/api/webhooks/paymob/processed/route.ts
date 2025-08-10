// app/api/webhooks/paymob/processed/route.ts
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
      delivery_needed: boolean;
      merchant: {
        id: number;
        created_at: string;
        phones: string[];
        company_emails: string[];
        company_name: string;
        state: string;
        country: string;
        city: string;
        postal_code: string;
        street: string;
      };
      collector: null | Record<string, unknown>;
      amount_cents: number;
      shipping_data: null | Record<string, unknown>;
      currency: string;
      is_payment_locked: boolean;
      is_return: boolean;
      is_cancel: boolean;
      is_returned: boolean;
      is_canceled: boolean;
      merchant_order_id: string;
      wallet_notification: null | Record<string, unknown>;
      paid_amount_cents: number;
      notify_user_with_email: boolean;
      items: Array<Record<string, unknown>>;
      order_url: string;
      commission_fees: number;
      delivery_fees_cents: number;
      delivery_vat_cents: number;
      payment_method: string;
      merchant_staff_tag: null | string;
      api_source: string;
      data: Record<string, unknown>;
    };
    created_at: string;
    transaction_processed_callback_responses: Array<Record<string, unknown>>;
    currency: string;
    source_data: {
      pan: string;
      type: string;
      tenure: null | string;
      sub_type: string;
    };
    api_source: string;
    terminal_id: null | string;
    merchant_commission: number;
    installment: null | Record<string, unknown>;
    discount_details: Array<Record<string, unknown>>;
    is_void: boolean;
    is_refund: boolean;
    data: {
      gateway_integration_pk: number;
      klass: string;
      created_at: string;
      amount: number;
      currency: string;
      merchant: string;
      order: string;
      txn_response_code: string;
      message: string;
      merchant_txn_ref: string;
      gateway_response: Record<string, unknown>;
    };
    is_hidden: boolean;
    payment_key_claims: {
      user_id: number;
      amount_cents: number;
      currency: string;
      integration_id: number;
      lock_order_when_paid: boolean;
    };
    error_occured: boolean;
    is_live: boolean;
    other_endpoint_reference: null | string;
    refunded_amount_cents: number;
    source_id: number;
    is_captured: boolean;
    captured_amount: number;
    merchant_staff_tag: null | string;
    updated_at: string;
    is_settled: boolean;
    bill_balanced: boolean;
    is_bill: boolean;
    owner: number;
    parent_transaction: null | Record<string, unknown>;
  };
  type: string;
}

type OrderStatus = 'PROCESSING' | 'CANCELLED' | 'PENDING';


function verifyWebhookSignature(data: PaymobWebhookData, signature: string): boolean {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error("PAYMOB_HMAC_SECRET not found in environment variables");
      return false;
    }

    // **FIXED**: The order of keys in the concatenated string for the processed webhook.
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
    ].join('');

    const calculatedSignature = crypto
      .createHmac('sha512', hmacSecret)
      .update(concatenatedString)
      .digest('hex');

    return calculatedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

function determineOrderStatus(transaction: PaymobWebhookData['obj']): OrderStatus {
  // **FIXED**: More robust status determination for the webhook.
  // A successful transaction from the webhook will have `success: true`.
  if (transaction.success && !transaction.error_occured) {
    return 'PROCESSING';
  }
  
  if (transaction.is_voided || transaction.is_refunded) {
    return 'CANCELLED';
  }
  
  if (transaction.pending) {
    return 'PENDING';
  }
  
  return 'CANCELLED';
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-paymob-signature') || req.headers.get('signature') || '';
    const rawBody = await req.text();
    
    let data: PaymobWebhookData;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse webhook JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!verifyWebhookSignature(data, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { obj: transaction } = data;
    const orderId = transaction.order.merchant_order_id;

    if (!orderId) {
      console.error('No merchant_order_id found in webhook data');
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const newStatus = determineOrderStatus(transaction);

    await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        paymentTransactionId: transaction.id.toString(),
        updatedAt: new Date(),
      }
    });

    console.log(`Webhook: Order ${orderId} updated to status: ${newStatus}, Transaction ID: ${transaction.id}, Success: ${transaction.success}, Error: ${transaction.error_occured}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      orderId,
      status: newStatus,
      transactionId: transaction.id
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}