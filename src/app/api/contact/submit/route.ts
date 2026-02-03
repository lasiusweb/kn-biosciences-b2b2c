import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { zohoCRMService } from '@/lib/microservices/zoho-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

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
    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert([
        {
          name,
          email,
          phone,
          subject,
          message,
          status: 'new',
        },
      ]);

    if (dbError) {
      console.error('Error saving contact submission:', dbError);
      throw dbError;
    }

    // 2. Sync to Zoho CRM as a lead
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '.'; // Zoho requires Last Name

    await zohoCRMService.createLead({
      First_Name: firstName,
      Last_Name: lastName,
      Email: email,
      Phone: phone,
      Description: `Subject: ${subject}\n\nMessage: ${message}`,
      Lead_Source: 'Website Contact Form',
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
