'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-4xl flex items-center justify-center p-4">
        <Image
          src="/dailishaw-splashscreen.gif"
          alt="Dailishaw Splash Screen"
          width={1000}
          height={800}
          priority
          className="object-contain w-full h-auto"
          unoptimized
        />
      </div>
    </main>
  );
}
