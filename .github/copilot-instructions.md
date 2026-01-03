<!-- Project-specific Copilot Instructions -->

## Project Overview
Internal pharma software built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase.

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Auth & Database)

## Authentication
- Two user roles: admin and user
- Role-based access control via middleware
- Protected routes for admin and user panels

## Project Structure
- `/app/(admin)/*` - Admin panel routes
- `/app/(user)/*` - User panel routes
- `/lib/supabase/*` - Supabase client and auth helpers
- Middleware for route protection

## Development Guidelines
- Use TypeScript strict mode
- Follow Next.js 14 App Router conventions
- Implement server and client components appropriately
- Use Supabase for authentication and data management
