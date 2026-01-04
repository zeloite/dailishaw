"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const navigationItems = [
  {
    icon: "/pajamas-media.svg",
    label: "Media Viewer",
    active: false,
    href: "/user-dashboard/media",
  },
  {
    icon: "/game-icons-expense.svg",
    label: "Expense Management",
    active: true,
    href: "/user-dashboard/expenses",
  },
];

interface Doctor {
  id: string;
  name: string;
  clinic: string;
  specialty: string | null;
}

interface Expense {
  id: string;
  expense_date: string;
  doctor_id: string | null;
  doctor_name: string | null;
  location: string;
  amount: number;
  fare_amount: number | null;
  remarks: string | null;
  doctors?: Doctor;
}

interface ExpenseFormData {
  expense_date: string;
  doctor_id: string;
  doctor_name: string;
  location: string;
  amount: string;
  fare_amount: string;
  remarks: string;
}

export default function UserExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [doctorInputMode, setDoctorInputMode] = useState<"select" | "manual">(
    "select"
  );
  const [formData, setFormData] = useState<ExpenseFormData>({
    expense_date: new Date().toISOString().split("T")[0],
    doctor_id: "",
    doctor_name: "",
    location: "",
    amount: "",
    fare_amount: "",
    remarks: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchExpenses();
    fetchDoctors();
  }, []);

  const fetchExpenses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
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
        .eq("user_id", user.id)
        .order("expense_date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name, clinic, specialty")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setDoctors(data || []);
    } catch (err: any) {
      console.error("Error fetching doctors:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const expenseData = {
        user_id: user.id,
        expense_date: formData.expense_date,
        doctor_id:
          doctorInputMode === "select" ? formData.doctor_id || null : null,
        doctor_name:
          doctorInputMode === "manual" ? formData.doctor_name || null : null,
        location: formData.location,
        amount: parseFloat(formData.amount),
        fare_amount: formData.fare_amount
          ? parseFloat(formData.fare_amount)
          : null,
        remarks: formData.remarks || null,
        created_by: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", editingId);

        if (error) throw error;
        setSuccess("Expense updated successfully!");
      } else {
        const { error } = await supabase.from("expenses").insert([expenseData]);

        if (error) throw error;
        setSuccess("Expense added successfully!");
      }

      resetForm();
      fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDoctorInputMode(expense.doctor_name ? "manual" : "select");
    setFormData({
      expense_date: expense.expense_date,
      doctor_id: expense.doctor_id || "",
      doctor_name: expense.doctor_name || "",
      location: expense.location,
      amount: expense.amount.toString(),
      fare_amount: expense.fare_amount?.toString() || "",
      remarks: expense.remarks || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;
      setSuccess("Expense deleted successfully!");
      setSelectedExpense(null);
      fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      expense_date: new Date().toISOString().split("T")[0],
      doctor_id: "",
      doctor_name: "",
      location: "",
      amount: "",
      fare_amount: "",
      remarks: "",
    });
    setEditingId(null);
    setShowForm(false);
    setDoctorInputMode("select");
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

  return (
    <DashboardLayout
      navigationItems={navigationItems}
      pageTitle="Expense Management"
    >
      <div className="space-y-6">
        {/* Expense Detail Modal */}
        {selectedExpense && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedExpense(null)}
          >
            <Card
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b border-gray-100 dark:border-gray-700 p-6">
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

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleEdit(selectedExpense);
                        setSelectedExpense(null);
                      }}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Expense
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(selectedExpense.id)}
                      disabled={deletingId === selectedExpense.id}
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      {deletingId === selectedExpense.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Expense
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Add Expense Button */}
        {!showForm && (
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        )}

        {/* Expense Form */}
        {showForm && (
          <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingId ? "Edit Expense" : "Add New Expense"}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expense_date">Date *</Label>
                    <Input
                      id="expense_date"
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expense_date: e.target.value,
                        })
                      }
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="doctor">Doctor</Label>
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="doctorInputMode"
                            checked={doctorInputMode === "select"}
                            onChange={() => setDoctorInputMode("select")}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Select from list
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="doctorInputMode"
                            checked={doctorInputMode === "manual"}
                            onChange={() => setDoctorInputMode("manual")}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Enter manually
                          </span>
                        </label>
                      </div>
                      {doctorInputMode === "select" ? (
                        <select
                          id="doctor_id"
                          value={formData.doctor_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              doctor_id: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            Select a doctor (optional)
                          </option>
                          {doctors.map((doctor) => (
                            <option
                              key={doctor.id}
                              value={doctor.id}
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              {doctor.name} - {doctor.clinic}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="doctor_name"
                          value={formData.doctor_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              doctor_name: e.target.value,
                            })
                          }
                          placeholder="Enter doctor name"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      required
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fare_amount">Fare Amount (₹)</Label>
                    <Input
                      id="fare_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.fare_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fare_amount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    rows={3}
                    placeholder="Add any additional notes..."
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId ? "Update Expense" : "Add Expense"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Expenses Table */}
        <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              My Expenses
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <SkeletonTable />
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">
                  No expenses found. Add your first expense to get started.
                </p>
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
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {expenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedExpense(expense)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(expense.expense_date)}
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
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {expense.remarks || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(expense);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(expense.id);
                              }}
                              disabled={deletingId === expense.id}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {deletingId === expense.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
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
