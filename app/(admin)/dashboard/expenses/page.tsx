"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { Eye, X, Users, Download } from "lucide-react";
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
  {
    icon: "/mdi-input.svg",
    label: "Input Monitoring",
    active: false,
    href: "/dashboard/inputs",
  },
  {
    icon: "/mdi-investment.svg",
    label: "Investment Monitoring",
    active: false,
    href: "/dashboard/investments",
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
  specialty: string | null;
  contact_detail: string | null;
  amount: number;
  fare_amount: number | null;
  remarks: string | null;
  visit_order: number;
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
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
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

  const downloadCSV = () => {
    // Prepare CSV data
    const csvData: string[] = [];
    
    // CSV Headers
    csvData.push(
      [
        "Date",
        "User",
        "Visit Order",
        "Doctor Name",
        "Doctor Clinic",
        "Location",
        "Specialty",
        "Contact Detail",
        "Amount",
        "Fare Amount",
        "Total",
        "Remarks"
      ].join(",")
    );

    // Add expense data rows
    filteredExpenses.forEach((expense) => {
      const row = [
        expense.expense_date,
        expense.profiles?.display_name || "-",
        (expense.visit_order + 1).toString(),
        expense.doctors?.name || expense.doctor_name || "-",
        expense.doctors?.clinic || "-",
        `"${expense.location.replace(/"/g, '""')}"`,
        expense.specialty ? `"${expense.specialty.replace(/"/g, '""')}"` : "-",
        expense.contact_detail ? `"${expense.contact_detail.replace(/"/g, '""')}"` : "-",
        expense.amount.toString(),
        expense.fare_amount?.toString() || "-",
        (expense.amount + (expense.fare_amount || 0)).toString(),
        expense.remarks ? `"${expense.remarks.replace(/"/g, '""')}"` : "-"
      ];
      csvData.push(row.join(","));
    });

    // Create blob and download
    const blob = new Blob([csvData.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Generate filename with date and user info
    const userName = selectedUser === "all" 
      ? "All_Users" 
      : users.find(u => u.id === selectedUser)?.display_name || "User";
    const date = new Date().toISOString().split("T")[0];
    link.download = `Expenses_${userName}_${date}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
        .order("visit_order", { ascending: true });

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
    // Get unique user-date combinations to avoid counting duplicates
    const uniqueEntries = new Map<string, Expense>();
    filteredExpenses.forEach((exp) => {
      const key = `${exp.user_id}_${exp.expense_date}`;
      if (!uniqueEntries.has(key)) {
        uniqueEntries.set(key, exp);
      }
    });

    return Array.from(uniqueEntries.values()).reduce(
      (sum, exp) => sum + exp.amount + (exp.fare_amount || 0),
      0
    );
  };

  const getUniqueExpenseCount = () => {
    // Get unique user-date combinations
    const uniqueKeys = new Set<string>();
    filteredExpenses.forEach((exp) => {
      uniqueKeys.add(`${exp.user_id}_${exp.expense_date}`);
    });
    return uniqueKeys.size;
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

                  {/* Specialty */}
                  {selectedExpense.specialty && (
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                        Specialty
                      </Label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                        {selectedExpense.specialty}
                      </p>
                    </div>
                  )}

                  {/* Contact Detail */}
                  {selectedExpense.contact_detail && (
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                        Contact Detail
                      </Label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                        {selectedExpense.contact_detail}
                      </p>
                    </div>
                  )}

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
                  {getUniqueExpenseCount()}
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
                <div className="flex gap-2">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Users</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name || user.user_id}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={downloadCSV}
                    disabled={filteredExpenses.length === 0}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                </div>
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
                        Visits
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {(() => {
                      // Group expenses by user_id and date
                      const grouped = filteredExpenses.reduce(
                        (acc, expense) => {
                          const key = `${expense.user_id}_${expense.expense_date}`;
                          if (!acc[key]) {
                            acc[key] = [];
                          }
                          acc[key].push(expense);
                          return acc;
                        },
                        {} as Record<string, Expense[]>
                      );

                      return Object.entries(grouped).map(
                        ([key, dateExpenses]) => {
                          const totalAmount = dateExpenses[0]?.amount || 0;
                          const totalFare = dateExpenses[0]?.fare_amount || 0;
                          const userProfile = dateExpenses[0]?.profiles;

                          return (
                            <tr
                              key={key}
                              onClick={() => setExpandedKeys(new Set([key]))}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatDate(dateExpenses[0].expense_date)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {userProfile?.display_name ||
                                  userProfile?.user_id ||
                                  "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {dateExpenses.length} visit
                                {dateExpenses.length > 1 ? "s" : ""}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(totalAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {totalFare > 0
                                  ? formatCurrency(totalFare)
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency(totalAmount + (totalFare || 0))}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedKeys(new Set([key]));
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        }
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        {expandedKeys.size > 0 &&
          (() => {
            const key = Array.from(expandedKeys)[0];
            const dateExpenses = filteredExpenses.filter(
              (exp) => `${exp.user_id}_${exp.expense_date}` === key
            );

            if (dateExpenses.length === 0) return null;

            const totalAmount = dateExpenses[0]?.amount || 0;
            const totalFare = dateExpenses[0]?.fare_amount || 0;
            const userProfile = dateExpenses[0]?.profiles;

            return (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setExpandedKeys(new Set())}
              >
                <div
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="border-b border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Expense Details
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(dateExpenses[0].expense_date)} •{" "}
                          {userProfile?.display_name || userProfile?.user_id}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedKeys(new Set())}
                        className="rounded-full w-8 h-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto flex-1">
                    {/* Visits Table */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Visits ({dateExpenses.length})
                      </h4>
                      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                #
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Doctor
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Location
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Specialty
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Contact
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Remarks
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {dateExpenses
                              .sort(
                                (a, b) =>
                                  (a.visit_order || 0) - (b.visit_order || 0)
                              )
                              .map((expense, index) => (
                                <tr key={expense.id}>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="bg-orange-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                      {index + 1}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    {expense.doctors ? (
                                      <div>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                          {expense.doctors.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {expense.doctors.clinic}
                                        </div>
                                      </div>
                                    ) : expense.doctor_name ? (
                                      <div className="font-medium text-gray-900 dark:text-white">
                                        {expense.doctor_name}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                    {expense.location}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {expense.specialty || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {expense.contact_detail || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {expense.remarks || "-"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Amount:
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                      {totalFare > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Fare:
                          </span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(totalFare)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total:
                        </span>
                        <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(totalAmount + (totalFare || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </DashboardLayout>
  );
}
