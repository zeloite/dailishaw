"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

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
    image: "/user-image-15.png",
    buttonText: "Set Username & Password",
    useIcon: false,
    href: "/dashboard/users",
  },
  {
    image: "/user-image-16.png",
    buttonText: "Share Credentials",
    useIcon: false,
    href: "/dashboard/users",
  },
  {
    buttonText: "Active Users",
    useIcon: true,
    href: "/dashboard/users",
  },
];

interface Activity {
  id: string;
  type: "user_created" | "user_activated" | "expense_submitted";
  userName?: string;
  userId?: string;
  amount?: number;
  timestamp: string;
}

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expensesGrowth, setExpensesGrowth] = useState(0);
  const [userGrowth, setUserGrowth] = useState(0);
  const [activeUserGrowth, setActiveUserGrowth] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchDashboardStats = async () => {
    try {
      const supabase = createClient();

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, is_active, role, created_at")
        .eq("role", "user");

      if (!usersError && users) {
        setTotalUsers(users.length);
        setActiveUsers(users.filter((u) => u.is_active).length);

        // Calculate user growth (current month vs last month)
        const now = new Date();
        const currentMonthStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );

        const currentMonthUsers = users.filter(
          (u) => new Date(u.created_at) >= currentMonthStart
        ).length;
        const lastMonthUsers = users.filter(
          (u) =>
            new Date(u.created_at) >= lastMonthStart &&
            new Date(u.created_at) < currentMonthStart
        ).length;

        if (lastMonthUsers > 0) {
          const growth =
            ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;
          setUserGrowth(Math.round(growth));
        } else if (currentMonthUsers > 0) {
          setUserGrowth(100);
        }

        // Calculate active user growth (current month vs last month active users)
        const totalUsersLastMonth = users.filter(
          (u) => new Date(u.created_at) < currentMonthStart
        ).length;
        const totalUsersPrevMonth = users.filter(
          (u) => new Date(u.created_at) < lastMonthStart
        ).length;

        if (totalUsersPrevMonth > 0) {
          const activeGrowth =
            ((totalUsersLastMonth - totalUsersPrevMonth) /
              totalUsersPrevMonth) *
            100;
          setActiveUserGrowth(Math.round(activeGrowth));
        } else if (totalUsersLastMonth > 0) {
          setActiveUserGrowth(100);
        }
      }

      // Fetch expenses for current month
      const now = new Date();
      const currentMonthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const nextMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      ).toISOString();

      const { data: currentExpenses } = await supabase
        .from("expenses")
        .select("amount, fare_amount")
        .gte("expense_date", currentMonthStart)
        .lt("expense_date", nextMonthStart);

      // Fetch expenses for last month
      const lastMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      ).toISOString();
      const lastMonthEnd = currentMonthStart;

      const { data: lastMonthExpenses } = await supabase
        .from("expenses")
        .select("amount, fare_amount")
        .gte("expense_date", lastMonthStart)
        .lt("expense_date", lastMonthEnd);

      // Calculate totals
      const currentTotal =
        currentExpenses?.reduce(
          (sum, exp) => sum + (exp.amount || 0) + (exp.fare_amount || 0),
          0
        ) || 0;

      const lastMonthTotal =
        lastMonthExpenses?.reduce(
          (sum, exp) => sum + (exp.amount || 0) + (exp.fare_amount || 0),
          0
        ) || 0;

      setTotalExpenses(currentTotal);

      // Calculate growth percentage
      if (lastMonthTotal > 0) {
        const growth = ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100;
        setExpensesGrowth(Math.round(growth));
      }

      // Fetch recent activities
      await fetchRecentActivities();
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const supabase = createClient();
      const activities: Activity[] = [];

      // Fetch recent user creations (last 5)
      const { data: newUsers } = await supabase
        .from("profiles")
        .select("id, user_id, created_at")
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(3);

      if (newUsers) {
        newUsers.forEach((user) => {
          activities.push({
            id: `user-${user.id}`,
            type: "user_created",
            userName: user.user_id,
            timestamp: user.created_at,
          });
        });
      }

      // Fetch recent expenses (last 5)
      const { data: recentExpenses } = await supabase
        .from("expenses")
        .select("id, user_id, amount, fare_amount, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentExpenses) {
        recentExpenses.forEach((expense) => {
          activities.push({
            id: `expense-${expense.id}`,
            type: "expense_submitted",
            userId: expense.user_id,
            amount: (expense.amount || 0) + (expense.fare_amount || 0),
            timestamp: expense.created_at,
          });
        });
      }

      // Sort all activities by timestamp and take top 4
      activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivities(activities.slice(0, 4));
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems} pageTitle="Dashboard">
      {/* KPI Cards - Google Analytics Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Total Users
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : totalUsers}
              </h3>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userGrowth >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-xs font-medium ${
                userGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {userGrowth >= 0 ? "+" : ""}
              {userGrowth}% from last month
            </span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Active Users
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : activeUsers}
              </h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeUserGrowth >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-xs font-medium ${
                activeUserGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {activeUserGrowth >= 0 ? "+" : ""}
              {activeUserGrowth}% total user growth
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Total Expenses
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? "..." : formatCurrency(totalExpenses)}
              </h3>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expensesGrowth >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-orange-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-xs font-medium ${
                expensesGrowth >= 0 ? "text-orange-600" : "text-red-600"
              }`}
            >
              {expensesGrowth >= 0 ? "+" : ""}
              {expensesGrowth}% last month
            </span>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Growth Rate
              </p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  "..."
                ) : (
                  <>
                    {Math.round((userGrowth + expensesGrowth) / 2) >= 0
                      ? "+"
                      : ""}
                    {Math.round((userGrowth + expensesGrowth) / 2)}%
                  </>
                )}
              </h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Math.round((userGrowth + expensesGrowth) / 2) >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-xs font-medium ${
                Math.round((userGrowth + expensesGrowth) / 2) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              this month
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <Link href="/dashboard/users">
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                View All →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/users/create">
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800/50 cursor-pointer group">
                <div className="p-2 bg-orange-600 text-white rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Create User
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Add new user
                </p>
              </div>
            </Link>

            <Link href="/dashboard/users/active">
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800/50 cursor-pointer group">
                <div className="p-2 bg-green-600 text-white rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Active Users
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  View & manage
                </p>
              </div>
            </Link>

            <Link href="/dashboard/categories">
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800/50 cursor-pointer group">
                <div className="p-2 bg-purple-600 text-white rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/pajamas-media.svg"
                    alt="Media"
                    width={20}
                    height={20}
                    className="brightness-0 invert"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Media
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Categories
                </p>
              </div>
            </Link>

            <Link href="/dashboard/expenses">
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800/50 cursor-pointer group">
                <div className="p-2 bg-orange-600 text-white rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Expenses
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Monitor
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {loading ? (
              // Loading skeleton
              [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-lg animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "user_created"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : activity.type === "user_activated"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-orange-100 dark:bg-orange-900/30"
                      }`}
                    >
                      {activity.type === "user_created" ? (
                        <UserPlus
                          className={`w-4 h-4 ${
                            activity.type === "user_created"
                              ? "text-orange-600 dark:text-orange-400"
                              : ""
                          }`}
                        />
                      ) : activity.type === "user_activated" ? (
                        <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.type === "user_created"
                        ? "New user created"
                        : activity.type === "user_activated"
                        ? "User activated"
                        : "Expense submitted"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.type === "expense_submitted"
                        ? formatCurrency(activity.amount || 0)
                        : activity.userName || activity.userId}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full mt-4 mb-6 border-gray-200 dark:border-gray-700"
      >
        View All
      </Button>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  System
                </span>
              </div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Database
              </span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Backup
              </span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Today, 3:00 AM
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Storage
              </span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                2.4 GB / 10 GB
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Monitor your pharma operations, manage users, and track expenses all
            in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/users/create">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-sm h-9">
                Create User
              </Button>
            </Link>
            <Link href="/dashboard/expenses">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-sm h-9"
              >
                View Expenses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
