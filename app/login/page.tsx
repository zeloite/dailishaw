'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Test if JavaScript is running
  console.log('LoginPage component loaded');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailOrUserId = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const supabase = createClient();

      // Determine if input is email or user_id
      let loginEmail = emailOrUserId;
      if (!emailOrUserId.includes('@')) {
        loginEmail = `${emailOrUserId}.dailishaw@gmail.com`;
      }

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError || !authData.user) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError('Profile not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      // Check if user is active (for non-admin users)
      if (profile.role === 'user' && !profile.is_active) {
        await supabase.auth.signOut();
        setError('Your account has been deactivated. Please contact administrator.');
        setLoading(false);
        return;
      }

      // Immediate redirect - no delay
      const redirectPath = profile.role === 'admin' ? '/dashboard' : '/user-dashboard';
      window.location.href = redirectPath;
      
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 lg:min-h-screen relative">
        <Image
          src="/rectangle-7.png"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-start py-8 px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 2xl:px-32">
        {/* Logo */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 xl:w-[219px] xl:h-[219px] mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-[40px]">
          <Image
            src="/image-3.png"
            alt="Dailishaw Logo"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Welcome Text */}
        <h1 className="font-['Inter',Helvetica] font-normal text-black text-3xl sm:text-4xl md:text-5xl tracking-[0] leading-[normal] mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-[83px]">
          Welcome Back!
        </h1>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[591px] space-y-6 sm:space-y-7 md:space-y-8 lg:space-y-[37px]">
          {/* Email/User ID Field */}
          <div className="space-y-2 sm:space-y-3 md:space-y-[17px]">
            <Label
              htmlFor="email"
              className="font-['Inter',Helvetica] font-normal text-black text-sm sm:text-base tracking-[0] leading-[normal]"
            >
              Email or User ID
            </Label>
            <Input
              id="email"
              name="email"
              type="text"
              placeholder="admin@example.com or user_id"
              required
              disabled={loading}
              className="w-full h-12 sm:h-14 md:h-16 lg:h-[75px] bg-white rounded-[10px] border border-solid border-black text-black text-base placeholder:text-gray-400"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2 sm:space-y-3 md:space-y-[17px]">
            <Label
              htmlFor="password"
              className="font-['Inter',Helvetica] font-normal text-black text-sm sm:text-base tracking-[0] leading-[normal]"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                className="w-full h-12 sm:h-14 md:h-16 lg:h-[75px] bg-white rounded-[10px] border border-solid border-black text-black text-base pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="w-[15px] h-[15px] bg-white border border-solid border-black"
              />
              <Label
                htmlFor="remember"
                className="font-['Inter',Helvetica] font-normal text-black text-sm sm:text-base tracking-[0] leading-[normal] cursor-pointer"
              >
                Remember Me
              </Label>
            </div>
            <button
              type="button"
              className="font-['Inter',Helvetica] font-normal text-black text-sm sm:text-base tracking-[0] leading-[normal] hover:underline"
            >
              Forgot Password ?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 sm:h-14 md:h-16 lg:h-[75px] bg-[#f9841b] hover:bg-[#e67610] rounded-[40px] font-['Inter',Helvetica] font-normal text-white text-lg sm:text-xl md:text-2xl tracking-[0] leading-[normal]"
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </Button>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 py-6 sm:py-7 md:py-8 lg:py-[33px]">
            <div className="flex-1 h-px bg-black"></div>
            <span className="bg-white px-2 sm:px-4 font-['Inter',Helvetica] font-normal text-black text-sm sm:text-base tracking-[0] leading-[normal] whitespace-nowrap">
              Or Continue With
            </span>
            <div className="flex-1 h-px bg-black"></div>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className="w-full h-12 sm:h-14 md:h-16 lg:h-[75px] bg-white rounded-[40px] border border-solid border-black flex items-center justify-center gap-2 sm:gap-3 hover:bg-gray-50"
          >
            <Image
              src="/material-icon-theme-google.svg"
              alt="Google"
              width={30}
              height={30}
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-[30px] md:h-[30px]"
            />
            <span className="font-['Inter',Helvetica] font-normal text-black text-base sm:text-lg md:text-xl tracking-[0] leading-[normal]">
              Continue with Google
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
