# Dailishaw - Internal Pharma Software

A Next.js 14 application for internal pharmaceutical software management with role-based access control.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for authentication and database

## Project Structure

```
.
├── app/
│   ├── (admin)/          # Admin panel routes (role: admin)
│   │   ├── layout.tsx
│   │   └── admin/
│   │       └── page.tsx  # Admin dashboard
│   ├── (user)/           # User panel routes (role: user)
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       └── page.tsx  # User dashboard
│   ├── login/
│   │   └── page.tsx      # Login page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── lib/
│   ├── auth.ts           # Auth helper functions
│   └── supabase/
│       ├── client.ts     # Supabase browser client
│       ├── server.ts     # Supabase server client
│       └── middleware.ts # Supabase middleware helper
├── middleware.ts         # Next.js middleware for route protection
└── .env.local.example    # Environment variables template
```

## Authentication & Authorization

### User Roles
- **admin**: Full access to admin panel and user features
- **user**: Access to user dashboard only

### Protected Routes
- `/admin/*` - Requires admin role
- `/dashboard/*` - Requires authentication (any role)
- `/login` - Public route

### Middleware
The middleware handles:
- Session management via Supabase
- Route protection based on authentication
- Role-based access control
- Automatic redirects for unauthorized access

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local`
3. Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Set Up User Roles in Supabase

Add role information to user metadata during signup:
```typescript
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      role: 'user' // or 'admin'
    }
  }
})
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Routes

- `/` - Home page
- `/login` - Login page (placeholder)
- `/admin/dashboard` - Admin dashboard (requires admin role)
- `/user-dashboard` - User dashboard (requires authentication)

## Development

### Adding New Protected Routes

1. Create route in appropriate folder:
   - Admin routes: `app/(admin)/`
   - User routes: `app/(user)/`

2. The layout files handle authentication automatically

### Auth Helper Functions

Located in `lib/auth.ts`:

- `getCurrentUser()` - Get current authenticated user with role
- `requireAuth()` - Require authentication (throws if not authenticated)
- `requireAdmin()` - Require admin role (throws if not admin)
- `checkRole(roles)` - Check if user has one of the specified roles

## Next Steps

1. Implement login/signup UI with Supabase Auth
2. Create database schema for pharma data
3. Build admin and user dashboard features
4. Add logout functionality
5. Implement actual pharma software features

## License

Internal use only
