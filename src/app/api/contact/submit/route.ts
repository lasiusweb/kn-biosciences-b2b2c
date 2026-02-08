import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { zohoQueueService } from '@/lib/integrations/zoho/queue-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message, company } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
       console.error('Supabase admin client not initialized');
       return NextResponse.json(
         { error: 'Internal Server Error' },
         { status: 500 }
       );
    }

    // 1. Store in Supabase
    const { data: submission, error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert([
        {
          name,
          email,
          phone,
          subject,
          message,
          company,
          status: 'new',
        },
      ])
      .select('id')
      .single();

    if (dbError) {
      console.error('Error saving contact submission:', dbError);
      throw dbError;
    }

    // 2. Queue for Zoho CRM sync
    await zohoQueueService.addToQueue({
      entity_type: 'contact_submission',
      entity_id: submission.id,
      operation: 'create',
      zoho_service: 'crm',
      zoho_entity_type: 'Lead'
    });

    // 3. TODO: Trigger Email Notification

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
