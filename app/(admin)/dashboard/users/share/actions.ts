"use server";

import { createClient } from "@supabase/supabase-js";

export async function fetchUsersWithEmailsAction() {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id, display_name, plain_password")
      .eq("role", "user")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return { error: error.message };
    }

    const usersWithEmail = await Promise.all(
      (data || []).map(async (profile) => {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(
          profile.id
        );
        return {
          ...profile,
          email: authData.user?.email || "",
        };
      })
    );

    return { data: usersWithEmail };
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function updateUserPasswordAction(
  userId: string,
  newPassword: string
) {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Update password in auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (authError) {
      return { error: authError.message };
    }

    // Update plain_password in profiles table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ plain_password: newPassword })
      .eq("id", userId);

    if (profileError) {
      return {
        error:
          "Password updated in auth but failed to update profile: " +
          profileError.message,
      };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred" };
  }
}
