'use client';

import Link from 'next/link';
import {
  PlayCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import DashboardLayout from '@/components/DashboardLayout';

const navigationItems = [
  {
    icon: '/pajamas-media.svg',
    label: 'Media Viewer',
    active: false,
    href: '/user-dashboard/media',
  },
  {
    icon: '/game-icons-expense.svg',
    label: 'Expense Management',
    active: false,
    href: '/user-dashboard/expenses',
  },
  {
    icon: '/mdi-input.svg',
    label: 'Input',
    active: false,
    href: '/user-dashboard/input',
  },
  {
    icon: '/mdi-investment.svg',
    label: 'Investment',
    active: false,
    href: '/user-dashboard/investment',
  },
];

const actionCards = [
  {
    icon: PlayCircle,
    title: 'Media Viewer',
    description: 'View and browse all media content',
    href: '/user-dashboard/media',
  },
  {
    icon: TrendingUp,
    title: 'Expense Management',
    description: 'Manage and track your expenses',
    href: '/user-dashboard/expenses',
  },
  {
    icon: TrendingUp,
    title: 'Input',
    description: 'Enter and manage input records',
    href: '/user-dashboard/input',
  },
  {
    icon: TrendingUp,
    title: 'Investment',
    description: 'Track and manage investments',
    href: '/user-dashboard/investment',
  },
];

export default function UserDashboard() {
  return (
    <DashboardLayout navigationItems={navigationItems} pageTitle="Dashboard">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {actionCards.map((card, index) => (
            <Link key={index} href={card.href}>
              <Card className="bg-white rounded-xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                  <card.icon className="w-24 h-24 text-[#f9831b] mb-6" />
                  <h3 className="font-['Inter',Helvetica] font-semibold text-gray-900 dark:text-white text-xl mb-3">
                    {card.title}
                  </h3>
                  <p className="font-['Inter',Helvetica] font-normal text-gray-600 dark:text-gray-400 text-base text-center">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
