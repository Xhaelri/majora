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
      collector: any;
      amount_cents: number;
      shipping_data: any;
      currency: string;
      is_payment_locked: boolean;
      is_return: boolean;
      is_cancel: boolean;
      is_returned: boolean;
      is_canceled: boolean;
      merchant_order_id: string;
      wallet_notification: any;
      paid_amount_cents: number;
      notify_user_with_email: boolean;
      items: any[];
      order_url: string;
      commission_fees: number;
      delivery_fees_cents: number;
      delivery_vat_cents: number;
      payment_method: string;
      merchant_staff_tag: any;
      api_source: string;
      data: any;
    };
    created_at: string;
    transaction_processed_callback_responses: any[];
    currency: string;
    source_data: {
      pan: string;
      type: string;
      tenure: any;
      sub_type: string;
    };
    api_source: string;
    terminal_id: any;
    merchant_commission: number;
    installment: any;
    discount_details: any[];
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
      gateway_response: any;
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
    other_endpoint_reference: any;
    refunded_amount_cents: number;
    source_id: number;
    is_captured: boolean;
    captured_amount: number;
    merchant_staff_tag: any;
    updated_at: string;
    is_settled: boolean;
    bill_balanced: boolean;
    is_bill: boolean;
    owner: number;
    parent_transaction: any;
  };
  type: string;
}

// Function to verify webhook signature
function verifyWebhookSignature(data: any, signature: string): boolean {
  try {
    // Get HMAC secret from environment
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error("PAYMOB_HMAC_SECRET not found in environment variables");
      return false;
    }

    // Create the concatenated string as per Paymob documentation
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

    // Generate HMAC
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

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-paymob-signature') || req.headers.get('signature') || '';
    const rawBody = await req.text();
    const data: PaymobWebhookData = JSON.parse(rawBody);

    // Verify webhook signature for security
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

    // Find the order in our database
    const order = await db.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status based on transaction success
    let newStatus: 'PROCESSING' | 'CANCELLED' = 'CANCELLED';
    
    if (transaction.success && !transaction.error_occured) {
      newStatus = 'PROCESSING';
    } else if (transaction.is_voided || transaction.is_refunded) {
      newStatus = 'CANCELLED';
    }

    // Update order with transaction details
    await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        paymentTransactionId: transaction.id.toString(),
        updatedAt: new Date(),
      }
    });

    // Log the transaction for debugging
    console.log(`Order ${orderId} updated to status: ${newStatus}, Transaction ID: ${transaction.id}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      orderId,
      status: newStatus
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    );
  }
}
