"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  MenuIcon,
  ChevronLeftIcon,
  LogOutIcon,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/actions/logout";
import { createClient } from "@/lib/supabase/client";

interface NavigationItem {
  icon: string;
  label: string;
  active: boolean;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  pageTitle?: string;
}

export default function DashboardLayout({
  children,
  navigationItems,
  pageTitle = "Dashboard",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    email?: string;
    userId?: string;
    displayName?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      // Check if user info is already in sessionStorage
      const cachedUserInfo = sessionStorage.getItem("userInfo");
      if (cachedUserInfo) {
        try {
          setUserInfo(JSON.parse(cachedUserInfo));
          setLoading(false);
          return;
        } catch (error) {
          // If parsing fails, continue to fetch
          sessionStorage.removeItem("userInfo");
        }
      }

      const supabase = createClient();

      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Try to get profile information
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .eq("id", user.id)
          .single();

        const userData = {
          email: user.email,
          userId: profile?.user_id,
          displayName: profile?.display_name,
        };

        setUserInfo(userData);
        // Cache the user info in sessionStorage
        sessionStorage.setItem("userInfo", JSON.stringify(userData));
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    // Clear cached user info on logout
    sessionStorage.removeItem("userInfo");
    await logoutAction();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-neutral-900 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-neutral-800 h-screen
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="h-10 w-auto flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dashboard-logo.gif"
              alt="Dailishaw"
              height={40}
              width={160}
              className="object-contain"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors lg:hidden"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
              }`}
            >
              <div className="w-5 h-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-neutral-800">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <LogOutIcon className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors lg:hidden"
            >
              <MenuIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>

          <div className="flex-1 flex justify-center max-w-xs">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
              <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              {loading ? (
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                  <div className="h-2 w-16 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {userInfo?.displayName ||
                      userInfo?.userId ||
                      userInfo?.email ||
                      "User"}
                  </span>
                  {userInfo?.email && userInfo?.userId && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                      {userInfo.email}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
