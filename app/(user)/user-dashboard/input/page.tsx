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
    active: true,
    href: "/user-dashboard/input",
  },
  {
    icon: "/mdi-investment.svg",
    label: "Investment",
    active: false,
    href: "/user-dashboard/investment",
  },
];

interface InputEntry {
  id: string;
  sl_no: string;
  doctor_name: string;
  input: string;
  quantity: number;
  created_at: string;
}

interface FormData {
  sl_no: string;
  doctor_name: string;
  input: string;
  quantity: string;
}

export default function InputPage() {
  const [inputs, setInputs] = useState<InputEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    sl_no: "",
    doctor_name: "",
    input: "",
    quantity: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchInputs();
  }, []);

  const fetchInputs = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("inputs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInputs(data || []);
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
    if (!formData.sl_no || !formData.doctor_name || !formData.input || !formData.quantity) {
      setError("All fields are required");
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const inputData = {
        user_id: user.id,
        sl_no: formData.sl_no,
        doctor_name: formData.doctor_name,
        input: formData.input,
        quantity: parseInt(formData.quantity),
      };

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("inputs")
          .update(inputData)
          .eq("id", editingId);

        if (error) throw error;
        setSuccess("Input updated successfully!");
      } else {
        // Insert new
        const { error } = await supabase.from("inputs").insert([inputData]);

        if (error) throw error;
        setSuccess("Input added successfully!");
      }

      resetForm();
      fetchInputs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (input: InputEntry) => {
    setEditingId(input.id);
    setFormData({
      sl_no: input.sl_no,
      doctor_name: input.doctor_name,
      input: input.input,
      quantity: input.quantity.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this input?")) return;

    try {
      const { error } = await supabase.from("inputs").delete().eq("id", id);

      if (error) throw error;
      setSuccess("Input deleted successfully!");
      fetchInputs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      sl_no: "",
      doctor_name: "",
      input: "",
      quantity: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <DashboardLayout navigationItems={navigationItems} pageTitle="Input Management">
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
            Add New Input
          </Button>
        )}

        {/* Input Form */}
        {showForm && (
          <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                {editingId ? "Edit Input" : "Add New Input"}
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
                    <Label>Input *</Label>
                    <Input
                      type="text"
                      value={formData.input}
                      onChange={(e) =>
                        setFormData({ ...formData, input: e.target.value })
                      }
                      required
                      placeholder="Enter input"
                    />
                  </div>

                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                      min="1"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    {editingId ? "Update" : "Save"} Input
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Inputs List */}
        <Card className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
              My Inputs
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <SkeletonTable />
              </div>
            ) : inputs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No inputs found. Add your first input!</p>
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
                        Input
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Quantity
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
                    {inputs.map((input) => (
                      <tr key={input.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {input.sl_no}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {input.doctor_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {input.input}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {input.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(input.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(input)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(input.id)}
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
