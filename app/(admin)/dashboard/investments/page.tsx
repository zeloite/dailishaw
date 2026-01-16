"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { Download, Users } from "lucide-react";
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
    active: false,
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
    active: true,
    href: "/dashboard/investments",
  },
];

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
}

interface InvestmentEntry {
  id: string;
  user_id: string;
  sl_no: string;
  doctor_name: string;
  investment: string;
  roi: string;
  created_at: string;
  profiles?: UserProfile;
}

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<InvestmentEntry[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<InvestmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchInvestments();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser === "all") {
      setFilteredInvestments(investments);
    } else {
      setFilteredInvestments(investments.filter((inv) => inv.user_id === selectedUser));
    }
  }, [selectedUser, investments]);

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

  const fetchInvestments = async () => {
    try {
      const { data: investmentsData, error: investmentsError } = await supabase
        .from("investments")
        .select("*")
        .order("created_at", { ascending: false });

      if (investmentsError) throw investmentsError;

      // Fetch user profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, display_name");

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map(
        profilesData?.map((profile) => [profile.id, profile]) || []
      );

      // Combine data
      const combinedData = investmentsData?.map((investment) => ({
        ...investment,
        profiles: profilesMap.get(investment.user_id) || null,
      })) || [];

      setInvestments(combinedData);
    } catch (err: any) {
      console.error("Error fetching investments:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const csvData: string[] = [];

    // CSV Headers
    csvData.push(
      ["User", "SL No", "Doctor Name", "Investment", "ROI", "Date"].join(",")
    );

    // Add data rows
    filteredInvestments.forEach((investment) => {
      const row = [
        investment.profiles?.display_name || "-",
        `"${investment.sl_no.replace(/"/g, '""')}"`,
        `"${investment.doctor_name.replace(/"/g, '""')}"`,
        `"${investment.investment.replace(/"/g, '""')}"`,
        `"${investment.roi.replace(/"/g, '""')}"`,
        investment.created_at.split("T")[0],
      ];
      csvData.push(row.join(","));
    });

    // Create blob and download
    const blob = new Blob([csvData.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const userName =
      selectedUser === "all"
        ? "All_Users"
        : users.find((u) => u.id === selectedUser)?.display_name || "User";
    const date = new Date().toISOString().split("T")[0];
    link.download = `Investments_${userName}_${date}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout navigationItems={navigationItems} pageTitle="Investment Monitoring">
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                    Total Investments
                  </Label>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredInvestments.length}
                </p>
              </div>
              <div>
                <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-2 block">
                  Total Entries
                </Label>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {filteredInvestments.length}
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
                    disabled={filteredInvestments.length === 0}
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

        {/* Investments Table */}
        <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
              {selectedUser === "all" ? "All Investments" : "User Investments"}
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <SkeletonTable />
              </div>
            ) : filteredInvestments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No investments found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        SL No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Doctor Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Investment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        ROI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredInvestments.map((investment) => (
                      <tr
                        key={investment.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {investment.profiles?.display_name || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {investment.sl_no}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {investment.doctor_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {investment.investment}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {investment.roi}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(investment.created_at).toLocaleDateString()}
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
