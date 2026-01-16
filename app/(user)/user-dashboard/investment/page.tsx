"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import DashboardLayout from "@/components/DashboardLayout";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const navigationItems = [
  {
    icon: "/pajamas-media.svg",
    label: "Media",
    active: false,
    href: "/user-dashboard/media",
  },
  {
    icon: "/game-icons-expense.svg",
    label: "Expense Management",
    active: false,
    href: "/user-dashboard/expenses",
  },
  {
    icon: "/mdi-input.svg",
    label: "Input",
    active: false,
    href: "/user-dashboard/input",
  },
  {
    icon: "/mdi-investment.svg",
    label: "Investment",
    active: true,
    href: "/user-dashboard/investment",
  },
];

interface InvestmentEntry {
  id: string;
  sl_no: string;
  doctor_name: string;
  investment: string;
  roi: string;
  created_at: string;
}

interface FormData {
  sl_no: string;
  doctor_name: string;
  investment: string;
  roi: string;
}

export default function InvestmentPage() {
  const [investments, setInvestments] = useState<InvestmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    sl_no: "",
    doctor_name: "",
    investment: "",
    roi: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate
    if (!formData.sl_no || !formData.doctor_name || !formData.investment || !formData.roi) {
      setError("All fields are required");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const investmentData = {
        user_id: user.id,
        sl_no: formData.sl_no,
        doctor_name: formData.doctor_name,
        investment: formData.investment,
        roi: formData.roi,
      };

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("investments")
          .update(investmentData)
          .eq("id", editingId);

        if (error) throw error;
        setSuccess("Investment updated successfully!");
      } else {
        // Insert new
        const { error } = await supabase.from("investments").insert([investmentData]);

        if (error) throw error;
        setSuccess("Investment added successfully!");
      }

      resetForm();
      fetchInvestments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (investment: InvestmentEntry) => {
    setEditingId(investment.id);
    setFormData({
      sl_no: investment.sl_no,
      doctor_name: investment.doctor_name,
      investment: investment.investment,
      roi: investment.roi,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investment?")) return;

    try {
      const { error } = await supabase.from("investments").delete().eq("id", id);

      if (error) throw error;
      setSuccess("Investment deleted successfully!");
      fetchInvestments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      sl_no: "",
      doctor_name: "",
      investment: "",
      roi: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <DashboardLayout navigationItems={navigationItems} pageTitle="Investment Management">
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Investment
          </Button>
        )}

        {/* Investment Form */}
        {showForm && (
          <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                {editingId ? "Edit Investment" : "Add New Investment"}
              </h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>SL No *</Label>
                    <Input
                      type="text"
                      value={formData.sl_no}
                      onChange={(e) =>
                        setFormData({ ...formData, sl_no: e.target.value })
                      }
                      required
                      placeholder="Serial Number"
                    />
                  </div>

                  <div>
                    <Label>Doctor Name *</Label>
                    <Input
                      type="text"
                      value={formData.doctor_name}
                      onChange={(e) =>
                        setFormData({ ...formData, doctor_name: e.target.value })
                      }
                      required
                      placeholder="Enter doctor name"
                    />
                  </div>

                  <div>
                    <Label>Investment *</Label>
                    <Input
                      type="text"
                      value={formData.investment}
                      onChange={(e) =>
                        setFormData({ ...formData, investment: e.target.value })
                      }
                      required
                      placeholder="Enter investment details"
                    />
                  </div>

                  <div>
                    <Label>ROI *</Label>
                    <Input
                      type="text"
                      value={formData.roi}
                      onChange={(e) =>
                        setFormData({ ...formData, roi: e.target.value })
                      }
                      required
                      placeholder="Return on Investment"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    {editingId ? "Update" : "Save"} Investment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Investments List */}
        <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
              My Investments
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <SkeletonTable />
              </div>
            ) : investments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No investments found. Add your first investment!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {investments.map((investment) => (
                      <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(investment)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(investment.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
