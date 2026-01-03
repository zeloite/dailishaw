'use client';

import { useState, useEffect } from 'react';
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
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { logoutAction } from '@/app/actions/logout';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

const navigationItems = [
  {
    icon: '/ix-user-management.svg',
    label: 'User Management',
    active: false,
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

const actionCards = [
  {
    image: '/user-image-14.png',
    buttonText: 'Create User',
    useIcon: false,
    href: '/dashboard/users/create',
  },
  {
    image: '/user-image-15.png',
    buttonText: 'Set Username & Password',
    useIcon: false,
    href: '/dashboard/users',
  },
  {
    image: '/user-image-16.png',
    buttonText: 'Share Credentials',
    useIcon: false,
    href: '/dashboard/users',
  },
  {
    buttonText: 'Active Users',
    useIcon: true,
    href: '/dashboard/users',
  },
];

const recentActivities = [
  'User Created — 05 Jan 2026, 10:30 AM',
  'Credentials Set — 05 Jan 2026, 10:35 AM',
  'Credentials Sent — Pending',
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const supabase = createClient();
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, is_active, role')
        .eq('role', 'user');

      if (!error && users) {
        setTotalUsers(users.length);
        setActiveUsers(users.filter(u => u.is_active).length);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50
        w-[264px] bg-white flex-shrink-0 flex flex-col h-screen overflow-hidden
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between px-4 pt-4">
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
            className="p-2 rounded-md hover:bg-gray-100"
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

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOutIcon className="w-6 h-6 text-[#5d5d5d]" />
            <span className="font-['Inter',Helvetica] font-normal text-base text-[#5d5d5d]">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-[264px]' : 'ml-0'}`}>
        <header className="h-20 bg-white shadow-[0px_2px_4px_#d9d9d940] flex items-center px-4 lg:px-6 gap-3 lg:gap-6">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <MenuIcon className="w-6 h-6 text-gray-900" />
            </button>
          )}

          <h1 className="font-['Inter',Helvetica] font-medium text-black text-xl lg:text-[32px] whitespace-nowrap">
            Dashboard
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

        <div className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Users Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Users</p>
                    <h3 className="text-white text-3xl font-bold">
                      {loading ? '...' : totalUsers}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-blue-100" />
                      <span className="text-blue-100 text-xs">+12% from last month</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users Card */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Active Users</p>
                    <h3 className="text-white text-3xl font-bold">
                      {loading ? '...' : activeUsers}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-green-100" />
                      <span className="text-green-100 text-xs">+8% this week</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Expenses Card */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium mb-1">Total Expenses</p>
                    <h3 className="text-white text-3xl font-bold">₹28.4K</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-orange-100" />
                      <span className="text-orange-100 text-xs">+23% from last month</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Rate Card */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Growth Rate</p>
                    <h3 className="text-white text-3xl font-bold">+24.5%</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <ArrowUpRight className="w-4 h-4 text-purple-100" />
                      <span className="text-purple-100 text-xs">Compared to last quarter</span>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions - Takes 2 columns */}
            <Card className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl">
                    Quick Actions
                  </h2>
                  <Link href="/dashboard/users">
                    <Button variant="ghost" size="sm" className="text-[#6aabfd] hover:text-[#5a9bed]">
                      View All →
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/dashboard/users/create">
                    <div className="group relative overflow-hidden bg-gradient-to-br from-[#f9831b] to-[#fa9d4b] rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <UserPlus className="w-10 h-10 text-white mb-3" />
                      <h3 className="text-white font-semibold text-lg mb-1">Create User</h3>
                      <p className="text-white/80 text-sm">Add new user to the system</p>
                    </div>
                  </Link>

                  <Link href="/dashboard/users/active">
                    <div className="group relative overflow-hidden bg-gradient-to-br from-[#6aabfd] to-[#8ec0ff] rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <Users className="w-10 h-10 text-white mb-3" />
                      <h3 className="text-white font-semibold text-lg mb-1">Active Users</h3>
                      <p className="text-white/80 text-sm">View and manage users</p>
                    </div>
                  </Link>

                  <Link href="/dashboard/categories">
                    <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <Image src="/pajamas-media.svg" alt="Media" width={40} height={40} className="mb-3 brightness-0 invert" />
                      <h3 className="text-white font-semibold text-lg mb-1">Media Management</h3>
                      <p className="text-white/80 text-sm">Manage media categories</p>
                    </div>
                  </Link>

                  <Link href="/dashboard/expenses">
                    <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                      <DollarSign className="w-10 h-10 text-white mb-3" />
                      <h3 className="text-white font-semibold text-lg mb-1">Expense Monitoring</h3>
                      <p className="text-white/80 text-sm">Track expenses and reports</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white rounded-xl shadow-md border border-gray-100">
              <CardContent className="p-6">
                <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New user created</p>
                      <p className="text-xs text-gray-500 mt-1">User ID: john_doe</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">User activated</p>
                      <p className="text-xs text-gray-500 mt-1">User ID: sarah_smith</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>4 hours ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Expense submitted</p>
                      <p className="text-xs text-gray-500 mt-1">Amount: ₹3,200</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>5 hours ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Monthly report generated</p>
                      <p className="text-xs text-gray-500 mt-1">December 2025</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-gray-200 hover:bg-gray-50"
                >
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white rounded-xl shadow-md border border-gray-100">
              <CardContent className="p-6">
                <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl mb-6">
                  System Overview
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">System Status</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">Operational</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Database Connection</span>
                    <span className="text-sm font-semibold text-green-600">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Last Backup</span>
                    <span className="text-sm font-semibold text-gray-600">Today, 3:00 AM</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                    <span className="text-sm font-semibold text-gray-600">2.4 GB / 10 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-md border-0">
              <CardContent className="p-6">
                <h2 className="font-['Inter',Helvetica] font-semibold text-white text-xl mb-4">
                  Welcome Back, Admin
                </h2>
                <p className="text-gray-300 text-sm mb-6">
                  Your dashboard is ready. Monitor your pharma operations, manage users, and track expenses all in one place.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/users/create">
                    <Button className="bg-[#f9831b] hover:bg-[#e67610] text-white">
                      Create New User
                    </Button>
                  </Link>
                  <Link href="/dashboard/expenses">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      View Expenses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
