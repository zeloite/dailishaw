"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";

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

interface User {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function ActiveUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, role, is_active, created_at")
        .eq("role", "user")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userIdName: string) => {
    setUserToDelete({ id: userId, name: userIdName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      if (!response.ok) throw new Error("Failed to delete user");

      await fetchUsers();
      setSuccessMessage(`User "${userToDelete.name}" deleted successfully`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrorMessage("Failed to delete user. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <DashboardLayout navigationItems={navigationItems} pageTitle="Active Users">
      <Button
        onClick={() => router.push("/dashboard/users")}
        variant="ghost"
        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to User Management
      </Button>

      <div className="flex-1 p-4 lg:p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Inter',Helvetica] font-medium text-black dark:text-white text-2xl">
                All Active Users ({users.length})
              </h2>
              <Button
                onClick={fetchUsers}
                className="bg-[#f9831b] hover:bg-[#e67610]"
              >
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="py-6">
                <SkeletonTable />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg">No users created yet</p>
                <Link href="/dashboard/users/create">
                  <Button className="mt-4 bg-[#f9831b] hover:bg-[#e67610]">
                    Create First User
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#f9831b] rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.user_id?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-['Inter',Helvetica] font-semibold text-black dark:text-white text-lg">
                            {user.user_id || "Unknown"}
                          </p>
                          <p className="font-['Inter',Helvetica] text-gray-500 dark:text-gray-400 text-sm">
                            Created:{" "}
                            {new Date(user.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          user.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                      <Button
                        onClick={() => handleDeleteUser(user.id, user.user_id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete User
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete user{" "}
              <span className="font-semibold text-black dark:text-white">
                &quot;{userToDelete?.name}&quot;
              </span>
              ? This will permanently remove their account and all associated
              data.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setUserToDelete(null);
                }}
                variant="outline"
                disabled={deleting}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  "Delete User"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
