# Supabase Authentication Setup Guide

## Overview
This guide explains how to set up Supabase authentication with role-based access control (RBAC) for the Dailishaw application.

## Prerequisites
- Supabase account and project created
- Environment variables configured in `.env.local`

## Step 1: Run Database Schema

Execute the SQL schema in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script

This creates:
- `profiles` table with user roles
- Row Level Security (RLS) policies
- Trigger to auto-create profiles on user signup
- Necessary indexes and permissions

## Step 2: Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from:
- Supabase Dashboard → Settings → API

## Step 3: Create Test Users

### Option 1: Via Sign Up Form
1. Run `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Sign up"
4. Fill in email, password, and select role
5. Check email for verification link (if email verification is enabled)

### Option 2: Via Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add user"
3. Enter email and password
4. After user is created, go to SQL Editor and run:

```sql
-- Insert profile for the new user
INSERT INTO public.profiles (id, email, role)
VALUES (
  'user-uuid-here',
  'user@example.com',
  'admin' -- or 'user'
);
```

### Option 3: Disable Email Confirmation (Development Only)

1. Go to Authentication → Settings
2. Uncheck "Enable email confirmations"
3. Now signup will work immediately without email verification

## Authentication Flow

### Login Process
1. User submits email/password
2. Supabase authenticates credentials
3. System fetches user role from `profiles` table
4. User is redirected based on role:
   - `admin` → `/admin/dashboard`
   - `user` → `/user-dashboard`

### Route Protection
Middleware checks:
1. Is user authenticated? → If not, redirect to `/login`
2. Does user have required role? → If not, redirect appropriately
3. Roles are fetched from database, not tokens

### Logout Process
1. User clicks "Logout" button
2. Supabase session is cleared
3. User is redirected to `/login`

## Database Schema Details

### Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,           -- References auth.users(id)
  email TEXT NOT NULL,
  role TEXT NOT NULL,            -- 'admin' or 'user'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Row Level Security Policies
- Users can read their own profile
- Admins can read all profiles
- Only service role can insert/update profiles

### Automatic Profile Creation
A trigger automatically creates a profile entry when a user signs up:
- Reads role from `raw_user_meta_data->>'role'`
- Defaults to `'user'` if not specified
- Links profile to auth.users via UUID

## Security Features

### ✅ Implemented
- Email/password authentication
- Role-based access control (RBAC)
- Protected routes via middleware
- Server-side auth checks
- Row Level Security (RLS) on database
- Secure session management

### 🔒 Best Practices
- Roles stored in database, not JWT tokens
- Middleware validates every request
- Server components verify auth before rendering
- Logout clears all session data

## Testing the Setup

### Test Admin Access
1. Create user with role `admin`
2. Login at `/login`
3. Should redirect to `/admin/dashboard`
4. Try accessing `/user-dashboard` → Should work (admins can access user routes)

### Test User Access
1. Create user with role `user`
2. Login at `/login`
3. Should redirect to `/user-dashboard`
4. Try accessing `/admin/dashboard` → Should redirect back to `/user-dashboard`

### Test Logout
1. Login as any user
2. Click "Logout" button
3. Should redirect to `/login`
4. Try accessing protected routes → Should redirect to `/login`

## Troubleshooting

### Issue: "User profile not found" after login
**Solution:** Run the database schema SQL. The profiles table might not exist or the trigger isn't set up.

### Issue: Email confirmation required
**Solution:** Either:
1. Check email for confirmation link, OR
2. Disable email confirmation in Supabase settings (dev only)

### Issue: "Unauthorized" when accessing protected routes
**Solution:** 
1. Check `.env.local` has correct Supabase credentials
2. Verify user exists in `profiles` table
3. Check browser console for errors

### Issue: Admin users can't access admin routes
**Solution:** Verify the user's role in the database:
```sql
SELECT * FROM public.profiles WHERE email = 'admin@example.com';
```

## API Reference

### Server Actions

#### `loginAction(formData)`
Authenticates user and redirects based on role.

#### `signupAction(formData)`
Creates new user with specified role.

#### `logoutAction()`
Signs out user and redirects to login.

### Auth Helpers (lib/auth.ts)

#### `getCurrentUser()`
Returns authenticated user with role from database.

#### `requireAuth()`
Throws error if user not authenticated.

#### `requireAdmin()`
Throws error if user not admin.

#### `getUserProfile(userId)`
Fetches full profile from database.

## Next Steps

1. ✅ Authentication is fully implemented
2. Add password reset functionality
3. Add email change functionality
4. Implement admin user management UI
5. Add profile editing
6. Set up email templates in Supabase
