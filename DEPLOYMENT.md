# Vercel Deployment Guide

## Prerequisites
- GitHub account with this repository pushed
- Vercel account (sign up at https://vercel.com)
- Supabase project with database configured

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel
1. Go to https://vercel.com/new
2. Import your `dailishaw` repository from GitHub
3. Vercel will auto-detect Next.js framework

### 3. Configure Environment Variables
In Vercel project settings, add these environment variables:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**How to add:**
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development environments
3. Click "Save"

### 4. Deploy
- Click "Deploy" button
- Vercel will build and deploy your application
- You'll get a live URL like: `https://dailishaw.vercel.app`

## Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Post-Deployment Setup

### Update Supabase Redirect URLs
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel domain to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

### Test Your Deployment
1. Visit your Vercel URL
2. Try logging in with admin credentials
3. Test key features:
   - Dashboard loading
   - User management
   - Product/Category management
   - Media uploads

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Ensure all environment variables are set
- Verify `npm run build` works locally

### Authentication Issues
- Verify Supabase credentials are correct
- Check redirect URLs in Supabase settings
- Ensure middleware is properly configured

### Database Connection Issues
- Verify Supabase project is active
- Check database connection limits
- Review Supabase logs

## Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Supabase redirect URLs with custom domain

## Continuous Deployment
- Every push to `main` branch auto-deploys to production
- Pull requests create preview deployments
- You can configure deployment branches in Vercel settings

## Performance Optimization
- Vercel automatically optimizes:
  - Image delivery via CDN
  - Edge caching
  - Serverless functions
  - Static asset compression

## Monitoring
- View analytics in Vercel dashboard
- Monitor function execution times
- Track deployment history
- Set up alerts for build failures
