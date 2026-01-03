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
  Users,
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

const actionCards = [
  {
    image: '/user-image-14.png',
    buttonText: 'Create User',
    useIcon: false,
    href: '/dashboard/users/create',
  },
  {
    image: '/user-image-16.png',
    buttonText: 'Share Credentials',
    useIcon: false,
    href: '/dashboard/users/share',
  },
  {
    buttonText: 'Active Users',
    useIcon: true,
    href: '/dashboard/users/active',
  },
];

const recentActivities = [
  'User Created — 05 Jan 2026, 10:30 AM',
  'Credentials Set — 05 Jan 2026, 10:35 AM',
  'Credentials Sent — Pending',
];

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
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
            User Management
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
            {actionCards.map((card, index) => (
              <Link key={index} href={card.href}>
                <Card className="bg-white rounded-[10px] shadow-[0px_2px_4px_#bcbcbc33] cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-4 lg:p-6 flex flex-col items-center h-full">
                    <div className="flex items-center justify-center mb-6 lg:mb-8 h-[120px] sm:h-[140px] lg:h-[167px] w-full">
                      {card.useIcon ? (
                        <Users className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-[#f9831b]" />
                      ) : (
                        <img
                          className="max-w-full max-h-full object-contain"
                          alt={card.buttonText}
                          src={card.image}
                        />
                      )}
                    </div>
                  <Button className="w-full h-[60px] sm:h-[68px] lg:h-[74px] bg-[#f9831b] hover:bg-[#e67610] rounded-[15px] font-['Inter',Helvetica] font-semibold text-white text-sm sm:text-base whitespace-normal leading-tight px-4">
                    {card.buttonText}
                  </Button>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>

          <Card className="bg-white rounded-[10px] shadow-[0px_2px_4px_#bcbcbc33]">
            <CardContent className="p-4 lg:p-6">
              <h2 className="font-['Inter',Helvetica] font-medium text-black text-base lg:text-lg mb-4 lg:mb-6">
                Recent Activity
              </h2>
              <ul className="font-['Inter',Helvetica] font-normal text-[#1e1e1e] text-sm sm:text-base lg:text-lg leading-relaxed lg:leading-[27px] list-none space-y-2 lg:space-y-3">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="before:content-['•'] before:mr-2">
                    {activity}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
