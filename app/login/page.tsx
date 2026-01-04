"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    const isRemembered = localStorage.getItem("rememberMe") === "true";
    if (remembered && isRemembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const password = (
      e.currentTarget.elements.namedItem("password") as HTMLInputElement
    ).value;
    const emailOrUserId = email;

    try {
      const supabase = createClient();

      // Determine if input is email or user_id
      let loginEmail = emailOrUserId;
      if (!emailOrUserId.includes("@")) {
        loginEmail = `${emailOrUserId}.dailishaw@gmail.com`;
      }

      // Sign in with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

      if (authError || !authData.user) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError("Profile not found. Please contact administrator.");
        setLoading(false);
        return;
      }

      // Check if user is active (for non-admin users)
      if (profile.role === "user" && !profile.is_active) {
        await supabase.auth.signOut();
        setError(
          "Your account has been deactivated. Please contact administrator."
        );
        setLoading(false);
        return;
      }

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", emailOrUserId);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      // Immediate redirect - no delay
      const redirectPath =
        profile.role === "admin" ? "/dashboard" : "/user-dashboard";
      window.location.href = redirectPath;
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 w-full h-screen flex flex-col md:flex-row">
      {/* Left Side - Image */}
      <div className="hidden md:block md:w-1/3 lg:w-1/2 h-1/3 md:h-screen relative bg-gray-100 dark:bg-neutral-800">
        <Image
          src="/rectangle-7.png"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col items-center justify-start px-6 sm:px-12 md:px-8 lg:px-20 xl:px-24 2xl:px-32 h-screen overflow-y-auto md:overflow-visible lg:justify-center">
        {/* Logo */}
        <div className="mb-2 sm:mb-2 md:mb-1 lg:mb-3">
          <Image
            src="/image-3.png"
            alt="Dailishaw Logo"
            width={219}
            height={219}
            className="w-20 sm:w-24 md:w-28 lg:w-44 xl:w-[219px] h-auto object-contain"
            priority
          />
        </div>

        {/* Welcome Text */}
        <h1 className="font-['Inter',Helvetica] font-normal text-black dark:text-white text-2xl sm:text-3xl md:text-3xl lg:text-5xl tracking-[0] leading-[normal] mb-3 sm:mb-3 md:mb-2 lg:mb-4">
          Welcome Back!
        </h1>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[420px] md:max-w-[340px] lg:max-w-[480px] space-y-5 sm:space-y-6 md:space-y-5 lg:space-y-6"
        >
          {/* Email/User ID Field */}
          <div className="space-y-1 sm:space-y-2 md:space-y-1.5 lg:space-y-3">
            <Label
              htmlFor="email"
              className="font-['Inter',Helvetica] font-normal text-black dark:text-white text-sm sm:text-base tracking-[0] leading-[normal]"
            >
              Email or User ID
            </Label>
            <Input
              id="email"
              name="email"
              type="text"
              placeholder="admin@example.com or user_id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full h-10 sm:h-11 md:h-12 bg-white dark:bg-neutral-800 rounded-[10px] border border-solid border-black dark:border-neutral-600 text-black dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1 sm:space-y-2 md:space-y-1.5 lg:space-y-3">
            <Label
              htmlFor="password"
              className="font-['Inter',Helvetica] font-normal text-black dark:text-white text-sm sm:text-base tracking-[0] leading-[normal]"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                className="w-full h-10 sm:h-11 md:h-12 bg-white dark:bg-neutral-800 rounded-[10px] border border-solid border-black dark:border-neutral-600 text-black dark:text-white text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-2 md:gap-1.5">
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  localStorage.setItem("rememberMe", String(e.target.checked));
                }}
                className="w-[15px] h-[15px] bg-white dark:bg-neutral-800 border border-solid border-black dark:border-neutral-600 rounded cursor-pointer"
              />
              <Label
                htmlFor="remember"
                className="font-['Inter',Helvetica] font-normal text-black dark:text-white text-xs sm:text-sm md:text-xs lg:text-base tracking-[0] leading-[normal] cursor-pointer"
              >
                Remember Me
              </Label>
            </div>
            <button
              type="button"
              className="font-['Inter',Helvetica] font-normal text-black dark:text-white text-sm sm:text-base tracking-[0] leading-[normal] hover:underline"
            >
              Forgot Password ?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 sm:h-11 md:h-12 bg-[#f9841b] hover:bg-[#e67610] rounded-[40px] font-['Inter',Helvetica] font-normal text-white text-base sm:text-lg tracking-[0] leading-[normal]"
          >
            {loading ? "Logging in..." : "LOGIN"}
          </Button>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-2 py-4 sm:py-5 md:py-3 lg:py-6">
            <div className="flex-1 h-px bg-black dark:bg-neutral-600"></div>
            <span className="bg-white dark:bg-neutral-900 px-2 sm:px-4 font-['Inter',Helvetica] font-normal text-black dark:text-white text-sm sm:text-base tracking-[0] leading-[normal] whitespace-nowrap">
              Or Continue With
            </span>
            <div className="flex-1 h-px bg-black dark:bg-neutral-600"></div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className="w-full h-10 sm:h-11 md:h-12 bg-white dark:bg-neutral-800 rounded-[40px] border border-solid border-black dark:border-neutral-600 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700"
          >
            <Image
              src="/material-icon-theme-google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="font-['Inter',Helvetica] font-normal text-black dark:text-white text-sm sm:text-base tracking-[0] leading-[normal]">
              Continue with Google
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
