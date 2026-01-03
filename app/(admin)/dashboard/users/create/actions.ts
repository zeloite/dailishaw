'use server';

import { createClient } from '@supabase/supabase-js';

export async function createUserAction(userId: string, password: string) {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const email = `${userId}.dailishaw@gmail.com`;

    // Create user with admin client - bypasses email confirmation
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        user_id: userId,
      },
    });

    if (authError) {
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Failed to create user' };
    }

    // Create or update profile with role='user' and store plain password for sharing
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        role: 'user',
        is_active: true,
        user_id: userId,
        plain_password: password, // Store for credentials sharing
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      return { error: 'User created but profile setup failed: ' + profileError.message };
    }

    return { success: true, userId };
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' };
  }
}
