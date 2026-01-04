"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // User is logged in, check their role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const userRole = profile?.role || "user";

        // Redirect to appropriate dashboard
        if (userRole === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/user-dashboard");
        }
      } else {
        // Not logged in, go to login page after splash
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }

      setChecking(false);
    };

    checkAuth();
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
