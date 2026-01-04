"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import DashboardLayout from "@/components/DashboardLayout";

const navigationItems = [
  {
    icon: "/ix-user-management.svg",
    label: "User Management",
    active: true,
    href: "/dashboard/users",
  },
  {
    icon: "/pajamas-media.svg",
    label: "Media Management",
    active: false,
    href: "/dashboard/categories",
  },
  {
    icon: "/game-icons-expense.svg",
    label: "Expense Monitoring",
    active: false,
    href: "/dashboard/expenses",
  },
];

const actionCards = [
  {
    image: "/user-image-14.png",
    buttonText: "Create User",
    useIcon: false,
    href: "/dashboard/users/create",
  },
  {
    image: "/user-image-16.png",
    buttonText: "Share Credentials",
    useIcon: false,
    href: "/dashboard/users/share",
  },
  {
    buttonText: "Active Users",
    useIcon: true,
    href: "/dashboard/users/active",
  },
];

const recentActivities = [
  "User Created — 05 Jan 2026, 10:30 AM",
  "Credentials Set — 05 Jan 2026, 10:35 AM",
  "Credentials Sent — Pending",
];

export default function UsersPage() {
  const router = useRouter();

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      pageTitle="User Management"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {actionCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <Card className="bg-white dark:bg-gray-900 rounded-xl h-full cursor-pointer border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 flex flex-col items-center h-full">
                <div className="flex items-center justify-center mb-6 w-full h-40">
                  {card.useIcon ? (
                    <Users className="w-24 h-24 text-orange-500" />
                  ) : (
                    <img
                      className="max-w-full max-h-full object-contain"
                      alt={card.buttonText}
                      src={card.image}
                    />
                  )}
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  {card.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {recentActivities.map((activity, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-gray-400 dark:text-gray-500 mt-1">•</span>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
