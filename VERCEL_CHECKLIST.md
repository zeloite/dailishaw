# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment ✅

- [ ] All changes committed to Git
- [ ] Build passes locally (`npm run build`)
- [ ] Environment variables documented in `.env.example`
- [ ] Supabase project is set up and running
- [ ] Database tables created (run `supabase/schema.sql`)
- [ ] Admin user created (run `supabase/setup-admin.sql`)

## Vercel Setup ✅

- [ ] GitHub repository pushed to remote
- [ ] Vercel account created/logged in
- [ ] Project imported to Vercel from GitHub
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Build command: `npm run build` (auto-configured)
- [ ] Output directory: `.next` (auto-configured)

## Environment Variables ✅

Add these in Vercel Project Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1...`

**Important**: Add variables to all environments (Production, Preview, Development)

## Supabase Configuration ✅

In Supabase Dashboard → Authentication → URL Configuration:

- [ ] Site URL updated to: `https://your-app.vercel.app`
- [ ] Redirect URLs includes: `https://your-app.vercel.app/**`
- [ ] Optionally add preview URLs: `https://*.vercel.app/**`

## Deploy ✅

- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Visit deployment URL

## Post-Deployment Testing ✅

- [ ] Home page loads correctly
- [ ] Login page accessible
- [ ] Can log in with admin credentials
- [ ] Admin dashboard displays data
- [ ] User dashboard works
- [ ] Product images load
- [ ] Media gallery functions
- [ ] Expense tracking works
- [ ] No console errors in browser

## Production Checklist ✅

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Analytics enabled in Vercel dashboard
- [ ] Error tracking configured
- [ ] Team members added to Vercel project
- [ ] Supabase usage limits checked
- [ ] Backup strategy in place

## Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Verify `npm run build` works locally
3. Ensure all dependencies in `package.json`
4. Check Node.js version compatibility

### Authentication Errors
1. Verify environment variables are correct
2. Check Supabase redirect URLs
3. Ensure Supabase project is active
4. Test with Incognito/Private window

### Database Connection Issues
1. Verify Supabase URL and key
2. Check Supabase project status
3. Review database connection limits
4. Check RLS policies in Supabase

### Images Not Loading
1. Check Supabase Storage configuration
2. Verify storage bucket is public
3. Review CORS settings in Supabase
4. Check image paths in database

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Project Issues](https://github.com/zeloite/dailishaw/issues)

---

**Quick Deploy**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zeloite/dailishaw)
