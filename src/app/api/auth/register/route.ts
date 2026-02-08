import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { zohoQueueService } from "@/lib/integrations/zoho/queue-service";
import { registerUser } from "@/lib/auth/user-management"; // Assuming this is where Supabase auth signUp happens

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, companyName, gstNumber, role } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Call a helper function to handle Supabase Auth sign-up and profile creation
    const { user, authError, profileError } = await registerUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      companyName,
      gstNumber,
      role
    });

    if (authError || profileError || !user) {
      console.error("User registration failed:", authError?.message || profileError?.message);
      return NextResponse.json(
        { error: authError?.message || profileError?.message || "User registration failed" },
        { status: 400 }
      );
    }

    // Add user to Zoho CRM sync queue
    await zohoQueueService.addToQueue({
      entity_type: 'user',
      entity_id: user.id,
      operation: 'create',
      zoho_service: 'crm',
      zoho_entity_type: 'Contact',
      request_payload: { email, firstName, lastName, phone, companyName, gstNumber, role } // Mask sensitive data if logging
    });

    return NextResponse.json({ success: true, userId: user.id });

  } catch (error) {
    console.error("API /api/auth/register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
