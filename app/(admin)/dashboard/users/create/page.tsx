"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import DashboardLayout from "@/components/DashboardLayout";
import { createUserAction } from "./actions";

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

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const userId = formData.get("user_id") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userId)) {
      setError("User ID can only contain letters, numbers, and underscores");
      setLoading(false);
      return;
    }

    try {
      const result = await createUserAction(userId, password);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(`User "${userId}" created successfully!`);
      setLoading(false);

      (e.target as HTMLFormElement).reset();

      setTimeout(() => {
        router.push("/dashboard/users");
      }, 2000);
    } catch (err) {
      console.error("Create user error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems} pageTitle="Create User">
      <Button
        onClick={() => router.push("/dashboard/users")}
        variant="ghost"
        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to User Management
      </Button>

      <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500 dark:bg-orange-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-xl">
              Create New User
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add a new user to the system with login credentials
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-800 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg text-green-800 dark:text-green-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="user_id"
              className="font-medium text-gray-900 dark:text-white text-sm"
            >
              User ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="user_id"
              name="user_id"
              type="text"
              placeholder="Enter user ID (e.g., john_doe)"
              required
              disabled={loading}
              className="w-full"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Only letters, numbers, and underscores allowed
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="font-medium text-gray-900 dark:text-white text-sm"
            >
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              required
              disabled={loading}
              className="w-full"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Minimum 6 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirm_password"
              className="font-medium text-gray-900 text-sm"
            >
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Re-enter password"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/dashboard/users")}
              disabled={loading}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
