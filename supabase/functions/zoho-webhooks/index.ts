import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Webhook verification using HMAC-SHA256
async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = hexToBuffer(signature);
  const bodyBuffer = encoder.encode(body);

  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBuffer,
    bodyBuffer
  );
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function handleInventoryWebhook(payload: any): Promise<Response> {
  try {
    const { eventType, data } = payload;

    // Process different webhook events
    switch (eventType) {
      case 'item.created':
      case 'item.updated':
        await handleItemUpdate(data);
        break;
      
      case 'inventory.adjusted':
        await handleInventoryAdjustment(data);
        break;
      
      default:
        console.log('[Zoho Webhook] Unhandled event type:', eventType);
    }

    return new Response(
      JSON.stringify({ status: 'success', message: 'Webhook processed' }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error('[Zoho Webhook] Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ status: 'error', message: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
}

async function handleItemUpdate(itemData: any): Promise<void> {
  try {
    const { item_id, sku, stock_on_hand, available_stock } = itemData;
    
    if (!sku) {
      console.log('[Zoho Webhook] No SKU in item data, skipping');
      return;
    }

    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Find variant by SKU
    const variantResponse = await fetch(`${supabaseUrl}/rest/v1/product_variants?sku=eq.${encodeURIComponent(sku)}`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    });

    if (!variantResponse.ok) {
      console.error('[Zoho Webhook] Failed to find variant by SKU:', await variantResponse.text());
      return;
    }

    const variants = await variantResponse.json();
    if (!variants || variants.length === 0) {
      console.log('[Zoho Webhook] No variant found for SKU:', sku);
      return;
    }

    const variant = variants[0];
    
    // Update stock quantity
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/product_variants?id=eq.${variant.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        stock_quantity: stock_on_hand,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) {
      console.error('[Zoho Webhook] Failed to update variant stock:', await updateResponse.text());
      return;
    }

    // Log the sync operation
    await logInventorySync(variant.id, 'pull_from_zoho', 0, stock_on_hand, stock_on_hand - 0);

    console.log(`[Zoho Webhook] Updated variant ${sku}: ${stock_on_hand} units`);

  } catch (error) {
    console.error('[Zoho Webhook] Error handling item update:', error);
  }
}

async function handleInventoryAdjustment(adjustmentData: any): Promise<void> {
  try {
    // Similar logic to handle inventory adjustments
    // This could include stock takes, transfers, etc.
    
  } catch (error) {
    console.error('[Zoho Webhook] Error handling inventory adjustment:', error);
  }
}

async function logInventorySync(
  variantId: string, 
  operation: string, 
  supabaseQty: number, 
  zohoQty: number, 
  difference: number
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(`${supabaseUrl}/rest/v1/zoho_inventory_sync_logs`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        variant_id: variantId,
        operation,
        supabase_quantity: supabaseQty,
        zoho_quantity: zohoQty,
        difference,
        status: 'success',
        sync_timestamp: new Date().toISOString(),
      }),
    });

  } catch (error) {
    console.error('[Zoho Webhook] Error logging inventory sync:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('x-zoho-webhook-signature');
    const secret = Deno.env.get('ZOHO_WEBHOOK_SECRET') || '';

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(body, signature || '', secret);
    
    if (!isValid) {
      console.warn('[Zoho Webhook] Invalid or missing webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(body);
    console.log('[Zoho Webhook] Received valid webhook event:', payload.eventType);
    return await handleInventoryWebhook(payload);

  } catch (error) {
    console.error('[Zoho Webhook] Error processing request:', error);
    
    return new Response(
      JSON.stringify({ status: 'error', message: 'Internal server error' }),
      { headers: corsHeaders, status: 500 }
    );
  }
});