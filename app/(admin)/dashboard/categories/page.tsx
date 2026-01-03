'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  MenuIcon,
  ChevronLeftIcon,
  LogOutIcon,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { logoutAction } from '@/app/actions/logout';
import { Input } from '@/components/ui/Input';
import { updateCategorySortOrder, getCategories } from './actions';

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
    active: true,
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
    image: '/media-image-14.png',
    buttonText: 'Create Category',
    href: '/dashboard/categories/create',
  },
  {
    image: '/media-image-15.png',
    buttonText: 'Add Products',
    href: '/dashboard/products/create',
  },
  {
    image: '/media-image-16.png',
    buttonText: 'Upload Product Images',
    href: '/dashboard/products/images',
  },
];

const recentActivities = [
  'Category Created — Hair',
  'Product Added — ZPTO',
  'Images Uploaded — 2 images',
];

export default function CategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const cats = await getCategories();
    setCategories(cats);
    setLoading(false);
  };

  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    setLoading(true);
    const result = await updateCategorySortOrder(categoryId, direction);
    if (result.success) {
      await fetchCategories();
    }
    setLoading(false);
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

        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
            {actionCards.map((card, index) => (
              <Link key={index} href={card.href}>
                <Card className="bg-white rounded-[10px] shadow-[0px_2px_4px_#bcbcbc33] cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex flex-col items-center">
                    <div className="flex items-center justify-center mb-8 h-[167px]">
                      <img
                        className="max-w-full max-h-full object-cover"
                        alt={card.buttonText}
                        src={card.image}
                      />
                    </div>
                    <Button className="w-full h-[74px] bg-[#f9831b] hover:bg-[#e67610] rounded-[15px] font-['Inter',Helvetica] font-semibold text-white text-base">
                      {card.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="bg-white rounded-[10px] shadow-[0px_2px_4px_#bcbcbc33]">
            <CardContent className="p-6">
              <h2 className="font-['Inter',Helvetica] font-medium text-black text-lg mb-6">
                Arrange Categories
              </h2>
              {loading ? (
                <p className="text-gray-500">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-500">No categories found. Create one to get started.</p>
              ) : (
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-['Inter',Helvetica] font-medium text-black text-base">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">Order: {category.sort_order}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMoveCategory(category.id, 'up')}
                          disabled={index === 0 || loading}
                          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleMoveCategory(category.id, 'down')}
                          disabled={index === categories.length - 1 || loading}
                          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-5 h-5 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-[10px] shadow-[0px_2px_4px_#bcbcbc33] mt-6">
            <CardContent className="p-6">
              <h2 className="font-['Inter',Helvetica] font-medium text-black text-lg mb-6">
                Recent Activity
              </h2>
              <ul className="font-['Inter',Helvetica] font-normal text-[#1e1e1e] text-lg leading-[27px] list-none space-y-3">
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

