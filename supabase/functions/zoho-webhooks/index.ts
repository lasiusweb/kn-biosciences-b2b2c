import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Webhook verification - in production, verify with Zoho's webhook signature
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  // This is a simplified verification - implement proper Zoho webhook verification
  // For now, we'll accept all webhooks but log them for verification
  console.log('Webhook received:', { body, signature });
  return true;
}

async function handleInventoryWebhook(payload: any): Promise<Response> {
  try {
    console.log('[Zoho Webhook] Processing inventory webhook:', payload);

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
    console.log('[Zoho Webhook] Processing inventory adjustment:', adjustmentData);
    
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

    // Verify webhook signature (simplified)
    if (!verifyWebhookSignature(body, signature || '', secret)) {
      console.log('[Zoho Webhook] Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(body);
    return await handleInventoryWebhook(payload);

  } catch (error) {
    console.error('[Zoho Webhook] Error processing request:', error);
    
    return new Response(
      JSON.stringify({ status: 'error', message: 'Internal server error' }),
      { headers: corsHeaders, status: 500 }
    );
  }
});