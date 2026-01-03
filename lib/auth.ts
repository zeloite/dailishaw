import { createClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'user'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserWithRole {
  id: string
  email: string
  role: UserRole
}

export async function getCurrentUser(): Promise<UserWithRole | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user role from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('getUserProfile error:', error)
    return null
  }

  if (!profile) {
    console.error('getUserProfile: No profile found for userId:', userId)
    return null
  }

  return profile as UserProfile
}

export async function requireAuth(): Promise<UserWithRole> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireAdmin(): Promise<UserWithRole> {
  const user = await requireAuth()
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

export async function checkRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  return allowedRoles.includes(user.role)
}
