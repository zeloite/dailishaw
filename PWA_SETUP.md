# PWA (Progressive Web App) Setup

## Overview
This application now works as a Progressive Web App with offline support and automatic image caching.

## Features

### 🌐 Offline Support
- Works without internet connection after initial load
- Service worker caches all essential resources
- Cached content remains available for 24 hours

### 📸 Image Preloading & Caching
- All product images are automatically preloaded and cached
- Images load instantly from cache on subsequent visits
- No repeated server requests for the same images

### 🔄 Automatic Cache Management
- Cache automatically expires after 24 hours
- Old cache is cleared once per day
- Fresh content is fetched in the background while serving cached version

### 📱 Install as App
- Can be installed on mobile devices and desktop
- Works like a native app when installed
- Appears in app drawer on Android
- Can be added to home screen on iOS

## How It Works

### Service Worker (`/public/sw.js`)
- Intercepts all network requests
- Serves cached content when available
- Falls back to network if cache is unavailable
- Caches successful responses automatically

### Cache Strategy
1. **Static Assets**: Cached immediately on service worker install
   - HTML pages (`/`, `/login`, `/dashboard`, etc.)
   - Dashboard logo GIF
   - Manifest file

2. **Images & Resources**: Cached on first request
   - Product images from Supabase
   - Icons, CSS, JavaScript files
   - SVG, PNG, JPG, WEBP files

3. **Cache Expiry**: 24 hours
   - After 24 hours, content is refreshed from server
   - Expired cache is automatically deleted
   - Manual cache clear happens once per day

### PWA Hooks (`/lib/hooks/usePWA.tsx`)

#### `usePWA()`
Monitors online/offline status and handles PWA installation.

```typescript
const { isOnline, isInstallable, installPWA } = usePWA();
```

- `isOnline`: Boolean indicating internet connectivity
- `isInstallable`: Whether the app can be installed
- `installPWA()`: Triggers the install prompt

#### `useImagePreloader(urls)`
Preloads and caches images in the background.

```typescript
const { isPreloading, preloadProgress, clearOldCache } = useImagePreloader(imageUrls);
```

- `isPreloading`: Boolean indicating if preloading is in progress
- `preloadProgress`: Number (0-100) showing preload percentage
- `clearOldCache()`: Manually clear expired cache entries

## UI Indicators

### Online/Offline Indicator
- Green badge with WiFi icon when online
- Red badge with WiFi-off icon when offline
- Visible in media viewer (top-right corner)

### Preloading Indicator
- Blue badge with spinning loader
- Shows percentage of images preloaded
- Appears during initial cache population

## Installation

### On Android (Chrome/Edge)
1. Open the website in Chrome or Edge
2. Tap the menu (⋮) in top-right
3. Select "Install app" or "Add to Home screen"
4. Follow the prompts

### On iOS (Safari)
1. Open the website in Safari
2. Tap the Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

### On Desktop (Chrome/Edge)
1. Look for the install icon (⊕) in the address bar
2. Click it and confirm installation
3. The app will open in its own window

## Cache Management

### Automatic
- Cache is checked and cleared once per day
- Expires after 24 hours automatically
- Background updates keep content fresh

### Manual
To manually clear the cache:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Check "Unregister service workers" and "Cache storage"
5. Click "Clear site data"

Or clear through browser settings:
- Chrome: Settings → Privacy → Clear browsing data → Cached images
- Safari: Settings → Safari → Clear History and Website Data
- Edge: Settings → Privacy → Clear browsing data → Cached data

## Testing Offline Mode

### In Browser
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Reload the page
5. The app should still work with cached content

### On Mobile
1. Turn on Airplane mode
2. Open the app
3. Navigate through cached pages
4. Images should load from cache

## Deployment Notes

### Vercel
The PWA setup works automatically on Vercel. No additional configuration needed.

### Custom Server
Ensure the service worker file is served with proper headers:
```
Cache-Control: no-cache, no-store, must-revalidate
Service-Worker-Allowed: /
```

This is already configured in `next.config.js`.

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure the site is served over HTTPS (required for SW)
- Clear browser cache and hard reload (Ctrl+Shift+R)

### Images Not Caching
- Check Network tab in DevTools
- Look for failed requests
- Verify Supabase CORS settings allow your domain

### Cache Not Clearing
- Manually unregister the service worker
- Clear site data in DevTools
- Check `localStorage.lastCacheClear` value

### Offline Mode Not Working
- Ensure service worker is registered
- Check if content was cached on first visit
- Try visiting pages while online first

## File Structure

```
/public
  ├── sw.js                 # Service worker
  ├── manifest.json         # PWA manifest
  └── offline.html          # Offline fallback page

/lib/hooks
  └── usePWA.tsx           # PWA React hooks

/components
  └── PWAInitializer.tsx   # Registers service worker

/app
  └── layout.tsx           # Includes PWA meta tags
```

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet
- ⚠️ Opera Mini (Limited support)
- ❌ Internet Explorer (Not supported)

## Performance Benefits

1. **Faster Load Times**: Cached resources load instantly
2. **Reduced Server Load**: Fewer requests to Supabase
3. **Better UX**: Works offline, no loading delays
4. **Data Savings**: Images cached, not re-downloaded
5. **Native-like Experience**: Can be installed as an app

## Security

- Service worker only works over HTTPS
- Cache is scoped to your domain
- No sensitive data is cached (only public images)
- User authentication still requires network connection

## Future Enhancements

- [ ] Background sync for offline form submissions
- [ ] Push notifications for updates
- [ ] Selective cache clearing (by category)
- [ ] Cache size monitoring and limits
- [ ] Offline indicator with retry logic
- [ ] Update notification when new version available
