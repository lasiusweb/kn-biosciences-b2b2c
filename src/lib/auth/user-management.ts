import { supabase, supabaseAdmin } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface RegisterUserParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  gstNumber: string;
  role: "customer" | "b2b_client" | "admin" | "staff";
}

export async function registerUser({
  email,
  password,
  firstName,
  lastName,
  phone,
  companyName,
  gstNumber,
  role,
}: RegisterUserParams) {
  let user: User | null = null;
  let authError: Error | null = null;
  let profileError: Error | null = null;

  try {
    // 1. Sign up user with Supabase Auth
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: (['customer', 'b2b_client'].includes(role) ? role : 'customer') as "customer" | "b2b_client",
          company_name: companyName,
          gst_number: gstNumber,
        },
      },
    });

    if (signUpError) {
      authError = signUpError;
      throw signUpError;
    }

    user = authData.user;

    // 2. Create user profile in users table
    if (user) {
      const { error: insertProfileError } = await supabaseAdmin.from("users").insert({
        id: user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        role: role,
        company_name: companyName,
        gst_number: gstNumber,
      });

      if (insertProfileError) {
        profileError = insertProfileError;
        throw insertProfileError;
      }
    }
  } catch (error: any) {
    console.error("Error in registerUser:", error.message);
  }

  return { user, authError, profileError };
}

export async function getUserRole(): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Fetch role from the public.users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching user role:', profileError?.message);
    return null;
  }

  return profile.role;
}