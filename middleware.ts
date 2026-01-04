import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware - cookie handling issue between client and server
  return NextResponse.next();

  // Get the pathname first
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/signup", "/"];

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data, error: authError } = await supabase.auth.getUser();
  const user = data.user;

  // Debug: Log cookies and auth status
  console.log("Middleware - Path:", path);
  console.log(
    "Middleware - User:",
    user?.id ? `Authenticated: ${user?.id}` : "Not authenticated"
  );

  // If no user, redirect to login
  if (!user) {
    console.log("Middleware - Redirecting to login (no user)");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User is authenticated at this point (TypeScript non-null assertion needed due to Supabase types)
  const userId = user!.id;

  // Fetch user role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const userRole = profile?.role || "user";
  console.log("Middleware - User role:", userRole);

  // Check admin routes (dashboard and nested routes)
  if (path.startsWith("/dashboard")) {
    if (userRole !== "admin") {
      // Redirect non-admin users to their dashboard
      return NextResponse.redirect(new URL("/user-dashboard", request.url));
    }
  }

  // Check user routes
  if (path.startsWith("/user-dashboard")) {
    if (userRole === "admin") {
      // Redirect admins to their dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
