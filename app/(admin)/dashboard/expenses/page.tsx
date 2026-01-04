"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { Eye, X, Users } from "lucide-react";
import { Label } from "@/components/ui/Label";

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
    active: true,
    href: "/dashboard/expenses",
  },
];

interface Doctor {
  id: string;
  name: string;
  clinic: string;
  specialty: string | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
}

interface Expense {
  id: string;
  user_id: string;
  expense_date: string;
  doctor_id: string | null;
  doctor_name: string | null;
  location: string;
  amount: number;
  fare_amount: number | null;
  remarks: string | null;
  doctors?: Doctor;
  profiles?: UserProfile;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser === "all") {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(
        expenses.filter((exp) => exp.user_id === selectedUser)
      );
    }
  }, [selectedUser, expenses]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name")
        .eq("role", "user")
        .eq("is_active", true)
        .order("display_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      // Fetch expenses with doctor information
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select(
          `
          *,
          doctors (
            id,
            name,
            clinic,
            specialty
          )
        `
        )
        .order("expense_date", { ascending: false })
        .limit(50);

      if (expensesError) throw expensesError;

      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, display_name");

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map(
        profilesData?.map((profile) => [profile.id, profile]) || []
      );

      // Merge expenses with profiles
      const expensesWithProfiles =
        expensesData?.map((expense) => ({
          ...expense,
          profiles: profilesMap.get(expense.user_id),
        })) || [];

      setExpenses(expensesWithProfiles);
      setFilteredExpenses(expensesWithProfiles);
    } catch (err: any) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalExpenses = () => {
    return filteredExpenses.reduce(
      (sum, exp) => sum + exp.amount + (exp.fare_amount || 0),
      0
    );
  };

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      pageTitle="Expense Monitoring"
    >
      <div className="flex flex-col gap-6">
        {/* Expense Detail Modal */}
        {selectedExpense && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedExpense(null)}
          >
            <Card
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Expense Details
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExpense(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* User */}
                  <div>
                    <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                      User
                    </Label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {selectedExpense.profiles?.display_name ||
                        selectedExpense.profiles?.user_id ||
                        "Unknown User"}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                      Date
                    </Label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {formatDate(selectedExpense.expense_date)}
                    </p>
                  </div>

                  {/* Doctor */}
                  <div>
                    <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                      Doctor
                    </Label>
                    {selectedExpense.doctors ? (
                      <div className="mt-1">
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {selectedExpense.doctors.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedExpense.doctors.clinic}
                        </p>
                        {selectedExpense.doctors.specialty && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {selectedExpense.doctors.specialty}
                          </p>
                        )}
                      </div>
                    ) : selectedExpense.doctor_name ? (
                      <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                        {selectedExpense.doctor_name}
                      </p>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 mt-1">
                        No doctor specified
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                      Location
                    </Label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                      {selectedExpense.location}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                        Amount
                      </Label>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(selectedExpense.amount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                        Fare Amount
                      </Label>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {selectedExpense.fare_amount
                          ? formatCurrency(selectedExpense.fare_amount)
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Total */}
                  {selectedExpense.fare_amount && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                        Total Expense
                      </Label>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                        {formatCurrency(
                          selectedExpense.amount + selectedExpense.fare_amount
                        )}
                      </p>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedExpense.remarks && (
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                        Remarks
                      </Label>
                      <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                        {selectedExpense.remarks}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Card */}
        <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                    Total Expenses
                  </Label>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredExpenses.length}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-2 block">
                  Total Amount
                </Label>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(getTotalExpenses())}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-2 block">
                  Filter by User
                </Label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                >
                  <option value="all">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.user_id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
              {selectedUser === "all" ? "All Expenses" : "User Expenses"}
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <SkeletonTable />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No expenses found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fare
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {filteredExpenses.map((expense) => (
                      <tr
                        key={expense.id}
                        onClick={() => setSelectedExpense(expense)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(expense.expense_date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {expense.profiles?.display_name ||
                            expense.profiles?.user_id ||
                            "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {expense.doctors ? (
                            <div>
                              <div className="font-medium">
                                {expense.doctors.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {expense.doctors.clinic}
                              </div>
                            </div>
                          ) : expense.doctor_name ? (
                            <div className="font-medium">
                              {expense.doctor_name}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {expense.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {expense.fare_amount
                            ? formatCurrency(expense.fare_amount)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(
                            expense.amount + (expense.fare_amount || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
