# Dailishaw - Internal Pharma Management System

A Next.js-based internal pharmaceutical management system with role-based access control, built with TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 **Authentication & Authorization**: Secure login with role-based access (Admin & User)
- 👥 **User Management**: Create, manage, and share user credentials
- 📦 **Product Management**: Organize products by categories with image support
- 💰 **Expense Tracking**: Monitor and manage expenses with detailed analytics
- 📊 **Dynamic Dashboard**: Real-time KPIs with growth metrics
- 📱 **Media Gallery**: Fullscreen image viewer with swipe navigation
- 🎨 **Modern UI**: Minimalistic design with orange theme

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zeloite/dailishaw.git
   cd dailishaw
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Run the SQL scripts in `supabase/schema.sql` to create tables
   - Run `supabase/setup-admin.sql` to create initial admin user

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zeloite/dailishaw)

1. Click the deploy button above
2. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy and visit your live site!

## Project Structure

```
dailishaw/
├── app/
│   ├── (admin)/          # Admin-only routes
│   │   └── dashboard/    # Admin dashboard pages
│   ├── (user)/           # User-only routes
│   │   └── user-dashboard/
│   ├── actions/          # Server actions
│   ├── api/              # API routes
│   └── login/            # Authentication pages
├── components/           # Reusable React components
│   └── ui/               # UI component library
├── lib/
│   ├── supabase/         # Supabase client configs
│   ├── hooks/            # Custom React hooks
│   └── actions/          # Server-side actions
├── supabase/             # Database schemas
└── public/               # Static assets
```

## User Roles

### Admin
- Full access to all features
- User management and credential sharing
- Product and category management
- Expense tracking and analytics
- Dashboard with growth metrics

### User
- Personal dashboard
- Expense submission
- Media gallery access
- Limited administrative functions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |

## Database Schema

The application uses the following main tables:
- `profiles` - User profiles with roles
- `product_categories` - Product categories
- `products` - Product information
- `product_images` - Product images with sort order
- `expenses` - Expense records

See `supabase/schema.sql` for complete schema.

## Contributing

This is an internal project. For contributions, please follow the standard Git workflow:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - Internal use only

## Support

For issues or questions, contact the development team.

---

Built with ❤️ for internal pharmaceutical management
