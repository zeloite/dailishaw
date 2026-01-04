"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import DashboardLayout from "@/components/DashboardLayout";

const navigationItems = [
  {
    icon: "/ix-user-management.svg",
    label: "User Management",
    active: false,
    href: "/dashboard/users",
  },
  {
    icon: "/pajamas-media.svg",
    label: "Media Management",
    active: true,
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
    image: "/media-image-14.png",
    buttonText: "Create Category",
    href: "/dashboard/categories/create",
  },
  {
    image: "/media-image-15.png",
    buttonText: "Add Products",
    href: "/dashboard/products/create",
  },
  {
    image: "/media-image-16.png",
    buttonText: "Upload Product Images",
    href: "/dashboard/products/images",
  },
];

const recentActivities = [
  "Category Created — Hair",
  "Product Added — ZPTO",
  "Images Uploaded — 2 images",
];

export default function CategoriesPage() {
  return (
    <DashboardLayout
      navigationItems={navigationItems}
      pageTitle="Media Management"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {actionCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <Card className="bg-white dark:bg-gray-900 rounded-xl cursor-pointer h-full border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 flex flex-col items-center h-full">
                <div className="flex items-center justify-center mb-8 h-40 w-full">
                  <img
                    className="max-w-full max-h-full object-cover"
                    alt={card.buttonText}
                    src={card.image}
                  />
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
          <h2 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
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
