# Login System Documentation

## Overview
Dailishaw has a dual login system supporting both Admin and User authentication with role-based access control.

## Login Methods

### Admin Login
- **Input**: Email address (e.g., `admin@example.com`)
- **Authentication**: Standard Supabase auth with email + password
- **Redirect**: `/dashboard` (Admin Dashboard)

### User Login
- **Input**: User ID (e.g., `john_doe` or `dailishaw_john`)
- **Authentication**: User ID is converted to internal email format: `{user_id}@dailishaw.local`
- **Redirect**: `/user-dashboard` (User Dashboard)
- **Active Status Check**: Inactive users are blocked from login

## How It Works

### Login Flow
1. User enters Email/User ID and Password
2. System detects if input contains `@`:
   - **Yes** → Email login (Admin)
   - **No** → User ID login (convert to `{user_id}@dailishaw.local`)
3. Authenticate with Supabase
4. Fetch user profile from `profiles` table
5. Check role and active status
6. Redirect to appropriate dashboard

### Database Schema
```sql
profiles:
  - id (uuid, references auth.users)
  - role (text: 'admin' or 'user')
  - user_id (text, unique, nullable for admin)
  - display_name (text)
  - is_active (boolean, default true)
```

## Setup Instructions

### Step 1: Run Database Schema
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `/supabase/schema.sql`
3. Run the SQL to create all tables, policies, and triggers

### Step 2: Create Admin User
**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users → Add User
2. Enter admin email and password
3. The trigger will auto-create profile with 'user' role
4. Go to Table Editor → profiles → Find the user → Update role to 'admin'

**Option B: Via SQL**
```sql
-- First create auth user in Supabase Dashboard, then run:
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-from-auth-users';
```

### Step 3: Create Regular Users (Admin Panel)
Once logged in as admin, use the User Management panel to:
1. Create new users with user_id and password
2. System will create auth user with email: `{user_id}@dailishaw.local`
3. Set username, password, and share credentials
4. Users can login with their user_id (no @domain needed)

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only see their own data
- Admins have full access to all data

### Middleware Protection
- Unauthenticated users → Redirected to `/login`
- Non-admin accessing `/dashboard/*` → Redirected to `/user-dashboard`
- Admin accessing `/user-dashboard` → Redirected to `/dashboard`

### Active Status Check
- Only applies to regular users (not admins)
- Inactive users cannot login
- Admin can toggle user active status in User Management

## File Structure
```
app/
├── login/
│   ├── page.tsx          # Login UI (accepts email or user_id)
│   └── actions.ts        # Login logic with user_id conversion
├── (admin)/
│   └── dashboard/        # Admin routes (role: admin)
└── (user)/
    └── user-dashboard/   # User routes (role: user)
lib/
├── auth.ts               # Auth helpers (getCurrentUser, requireAdmin, etc.)
└── supabase/
    ├── server.ts         # Server-side Supabase client
    └── middleware.ts     # Session management
middleware.ts             # Route protection & role checking
```

## Example Credentials

### Admin
- **Email**: `admin@yourcompany.com`
- **Password**: Set during creation
- **Login Input**: `admin@yourcompany.com`

### Regular User
- **User ID**: `john_doe` (created by admin)
- **Password**: Set by admin
- **Login Input**: `john_doe` (no @domain)
- **Internal Email**: `john_doe@dailishaw.local` (auto-generated)

## Testing the Login

1. **Test Admin Login**:
   - Go to `/login`
   - Enter admin email and password
   - Should redirect to `/dashboard`

2. **Test User Login** (after creating user in admin panel):
   - Go to `/login`
   - Enter user_id (e.g., `john_doe`) and password
   - Should redirect to `/user-dashboard`

3. **Test Inactive User**:
   - Deactivate user in admin panel
   - Try to login
   - Should see "Account deactivated" error

## Troubleshooting

### "Profile not found"
- Schema not run yet → Run `/supabase/schema.sql`
- Profile table missing data → Check RLS policies
- Auth trigger not working → Manually create profile entry

### "Invalid credentials"
- Wrong email/user_id or password
- User hasn't been created yet (for user_id login)
- Check Supabase Auth dashboard for user existence

### Redirect not working
- Check middleware.ts is properly configured
- Verify profile.role is set correctly in database
- Clear browser cache and cookies

## Next Steps
After successful login:
1. **Admin**: Implement User Management CRUD operations
2. **User**: Build User Dashboard and Expense Management
3. **Both**: Implement logout functionality
4. **Security**: Add password reset flow
