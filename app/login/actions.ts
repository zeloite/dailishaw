'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const emailOrUserId = formData.get('email') as string
  const password = formData.get('password') as string

  if (!emailOrUserId || !password) {
    return { error: 'Email/User ID and password are required' }
  }

  const supabase = await createClient()

  // Determine if input is email or user_id
  // If it contains @, it's an email (admin login)
  // Otherwise, it's a user_id, convert to internal email format
  let loginEmail = emailOrUserId
  
  if (!emailOrUserId.includes('@')) {
    // User ID login - convert to internal email format
    loginEmail = `${emailOrUserId}@dailishaw.local`
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  })

  if (error) {
    return { error: 'Invalid credentials' }
  }

  // Get user profile to determine role
  const profile = await getUserProfile(data.user.id)

  if (!profile) {
    await supabase.auth.signOut()
    return { error: 'Profile not found. Please contact administrator.' }
  }

  // Check if user is active (only for non-admin users)
  if (profile.role === 'user' && !profile.is_active) {
    await supabase.auth.signOut()
    return { error: 'Your account has been deactivated. Please contact administrator.' }
  }

  // Return success with redirect path (don't use redirect() here)
  revalidatePath('/', 'layout')
  
  return { 
    success: true,
    redirectTo: profile.role === 'admin' ? '/dashboard' : '/user-dashboard'
  }
}

export async function signupAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'user'

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Failed to create user' }
  }

  // Manually create profile entry (in case trigger doesn't work or email confirmation is enabled)
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      email: data.user.email,
      role: role,
    })

  // Ignore error if profile already exists (trigger might have created it)
  if (profileError && !profileError.message.includes('duplicate')) {
    console.error('Profile creation error:', profileError)
  }

  return { 
    success: true,
    message: 'Account created successfully. Please check your email to verify your account.' 
  }
}
