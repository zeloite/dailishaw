'use client';

import { AuthGuard } from '@/components/AuthGuard';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="user">
      {children}
    </AuthGuard>
  );
}

