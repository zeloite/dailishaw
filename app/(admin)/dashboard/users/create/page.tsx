'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  MenuIcon,
  ChevronLeftIcon,
  LogOutIcon,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { createUserAction } from './actions';
import { logoutAction } from '@/app/actions/logout';

const navigationItems = [
  {
    icon: '/ix-user-management.svg',
    label: 'User Management',
    active: true,
    href: '/dashboard/users',
  },
  {
    icon: '/pajamas-media.svg',
    label: 'Media Management',
    active: false,
    href: '/dashboard/categories',
  },
  {
    icon: '/game-icons-expense.svg',
    label: 'Expense Monitoring',
    active: false,
    href: '/dashboard/expenses',
  },
];

export default function CreateUserPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const userId = formData.get('user_id') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
      setError('User ID can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    try {
      // Call server action to create user with admin privileges
      const result = await createUserAction(userId, password);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(`User "${userId}" created successfully!`);
      setLoading(false);

      // Reset form
      (e.target as HTMLFormElement).reset();

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/users');
      }, 2000);

    } catch (err) {
      console.error('Create user error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:translate-x-0 z-30 w-[264px] h-full bg-white flex flex-col transition-transform duration-300`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="relative w-[200px] h-[80px] cursor-pointer">
            <Image
              src="/dashboard-logo.gif"
              alt="Dailishaw Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <nav className="mt-8 flex-1">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="relative flex items-center gap-7 px-8 py-4 cursor-pointer hover:bg-gray-50"
            >
              {item.active && (
                <div className="absolute left-0 top-0 w-1 h-full bg-[#fa841c]" />
              )}
              <div className="relative w-6 h-6">
                <Image 
                  src={item.icon} 
                  alt={item.label} 
                  fill
                  className={item.active ? '[filter:invert(56%)_sepia(89%)_saturate(1821%)_hue-rotate(187deg)_brightness(101%)_contrast(98%)]' : ''}
                />
              </div>
              <span
                className={`font-['Inter',Helvetica] font-normal text-base ${
                  item.active ? 'text-[#6aabfd]' : 'text-[#5d5d5d]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <LogOutIcon className="w-5 h-5 text-[#5d5d5d]" />
            <span className="font-['Inter',Helvetica] font-normal text-[#5d5d5d] text-base">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main
        className={`flex-1 flex flex-col ${
          sidebarOpen ? 'lg:ml-[264px]' : ''
        } transition-all duration-300`}
      >
        <header className="h-20 bg-white shadow-[0px_2px_4px_#d9d9d940] flex items-center px-4 lg:px-6 gap-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <MenuIcon className="w-6 h-6 text-gray-900" />
            </button>
          )}

          <h1 className="font-['Inter',Helvetica] font-medium text-black text-xl lg:text-[32px] whitespace-nowrap">
            Create User
          </h1>

          <div className="hidden md:flex flex-1 max-w-[327px] relative ml-6">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                type="text"
                placeholder="Type to Search"
                className="w-full h-[41px] pl-12 pr-4 bg-white rounded-[10px] border border-black font-['Inter',Helvetica] font-medium text-[15px] placeholder:text-[#b8b3b3]"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 lg:gap-6">
            <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 cursor-pointer text-gray-900" />

            <div className="hidden sm:flex items-center gap-3 cursor-pointer">
              <Avatar className="w-[30px] h-[30px]">
                <AvatarImage src="/ellipse-1.svg" alt="Admin" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-['Inter',Helvetica] font-normal text-black text-[15px] whitespace-nowrap">
                Admin
              </span>
              <ChevronDownIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          <Button
            onClick={() => router.push('/dashboard/users')}
            variant="ghost"
            className="mb-6 flex items-center gap-2 text-[#5d5d5d] hover:text-black"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to User Management
          </Button>

          <div className="max-w-2xl bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl">
                  Create New User
                </h2>
                <p className="text-sm text-gray-600">
                  Add a new user to the system with login credentials
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="user_id" className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm">
                  User ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="user_id"
                  name="user_id"
                  type="text"
                  placeholder="Enter user ID (e.g., john_doe)"
                  required
                  disabled={loading}
                  className="w-full h-12 bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-gray-400 transition-all"
                />
                <p className="text-xs text-gray-600">
                  Only letters, numbers, and underscores allowed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                  disabled={loading}
                  className="w-full h-12 bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                <p className="text-xs text-gray-600">
                  Minimum 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Re-enter password"
                  required
                  disabled={loading}
                  className="w-full h-12 bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-[#f9831b] hover:bg-[#e67610] rounded-lg font-['Inter',Helvetica] font-semibold text-white text-base shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/users')}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 h-12 rounded-lg border-2 font-['Inter',Helvetica] font-semibold text-base hover:bg-gray-50 transition-all"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
