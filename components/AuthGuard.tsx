'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

// Cache auth state globally
let authCache: { user: any; profile: any; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 60 seconds

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const now = Date.now();
      
      // Check cache first
      if (authCache && (now - authCache.timestamp) < CACHE_DURATION) {
        if (isMounted) {
          const { user, profile } = authCache;
          if (user && (!requiredRole || profile?.role === requiredRole)) {
            setIsAuthorized(true);
            return;
          }
        }
      }

      // Fast auth check
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      if (requiredRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== requiredRole || (profile.role === 'user' && !profile.is_active)) {
          router.replace(profile?.role === 'admin' ? '/dashboard' : '/login');
          return;
        }

        authCache = { user, profile, timestamp: now };
      }

      if (isMounted) setIsAuthorized(true);
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [pathname, router, requiredRole]);

  return isAuthorized ? <>{children}</> : null;
}
