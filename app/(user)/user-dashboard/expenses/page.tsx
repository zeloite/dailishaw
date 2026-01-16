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
import { Plus, Edit2, Trash2, X, Clock, MapPin } from "lucide-react";

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
  {
    icon: "/mdi-input.svg",
    label: "Input",
    active: false,
    href: "/user-dashboard/input",
  },
  {
    icon: "/mdi-investment.svg",
    label: "Investment",
    active: false,
    href: "/user-dashboard/investment",
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
  specialty: string | null;
  contact_detail: string | null;
  amount: number;
  fare_amount: number | null;
  remarks: string | null;
  visit_order: number;
  doctors?: Doctor;
}

interface VisitEntry {
  doctor_id: string;
  doctor_name: string;
  location: string;
  specialty: string;
  contact_detail: string;
  remarks: string;
  doctorInputMode: "select" | "manual";
}

interface ExpenseFormData {
  expense_date: string;
  amount: string;
  fare_amount: string;
  visits: VisitEntry[];
}

export default function UserExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    expense_date: new Date().toISOString().split("T")[0],
    amount: "",
    fare_amount: "",
    visits: [
      {
        doctor_id: "",
        doctor_name: "",
        location: "",
        specialty: "",
        contact_detail: "",
        remarks: "",
        doctorInputMode: "manual",
      },
    ],
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
          id,
          expense_date,
          doctor_id,
          doctor_name,
          location,
          specialty,
          contact_detail,
          amount,
          fare_amount,
          remarks,
          visit_order,
          doctors (
            id,
            name,
            clinic,
            specialty
          )
        `
        )
        .eq("user_id", user.id)
        .order("expense_date", { ascending: false })
        .order("visit_order", { ascending: true });

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

  const addVisitRow = () => {
    setFormData({
      ...formData,
      visits: [
        ...formData.visits,
        {
          doctor_id: "",
          doctor_name: "",
          location: "",
          specialty: "",
          contact_detail: "",
          remarks: "",
          doctorInputMode: "manual",
        },
      ],
    });
  };

  const removeVisitRow = (index: number) => {
    if (formData.visits.length === 1) return; // Keep at least one
    setFormData({
      ...formData,
      visits: formData.visits.filter((_, i) => i !== index),
    });
  };

  const updateVisitRow = (
    index: number,
    field: keyof VisitEntry,
    value: any
  ) => {
    const updated = [...formData.visits];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-fill doctor name and location if selecting from dropdown
    if (field === "doctor_id" && value) {
      const doctor = doctors.find((d) => d.id === value);
      if (doctor) {
        updated[index].doctor_name = doctor.name;
        updated[index].location = doctor.clinic;
      }
    }

    setFormData({ ...formData, visits: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate total amount and fare
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Total amount must be greater than 0");
      return;
    }

    // Validate all visits
    for (let i = 0; i < formData.visits.length; i++) {
      const visit = formData.visits[i];
      if (!visit.location) {
        setError(`Visit ${i + 1}: Location is required`);
        return;
      }
      if (
        visit.doctorInputMode === "select" &&
        !visit.doctor_id &&
        !visit.doctor_name
      ) {
        setError(
          `Visit ${i + 1}: Please select a doctor or switch to manual entry`
        );
        return;
      }
      if (visit.doctorInputMode === "manual" && !visit.doctor_name) {
        setError(`Visit ${i + 1}: Doctor name is required`);
        return;
      }
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingDate) {
        // Delete existing expenses for this date
        const { error: deleteError } = await supabase
          .from("expenses")
          .delete()
          .eq("user_id", user.id)
          .eq("expense_date", formData.expense_date);

        if (deleteError) throw deleteError;
      }

      // Insert all visits - store total amount in first visit, 0 for others
      const totalAmount = parseFloat(formData.amount);
      const totalFare = formData.fare_amount
        ? parseFloat(formData.fare_amount)
        : null;

      const expensesToInsert = formData.visits.map((visit, index) => ({
        user_id: user.id,
        expense_date: formData.expense_date,
        doctor_id:
          visit.doctorInputMode === "select" && visit.doctor_id
            ? visit.doctor_id
            : null,
        doctor_name:
          visit.doctorInputMode === "manual" || !visit.doctor_id
            ? visit.doctor_name
            : null,
        location: visit.location,
        specialty: visit.specialty || null,
        contact_detail: visit.contact_detail || null,
        amount: totalAmount,
        fare_amount: totalFare,
        remarks: visit.remarks || null,
        visit_order: index,
        created_by: user.id,
      }));

      const { error } = await supabase
        .from("expenses")
        .insert(expensesToInsert);

      if (error) throw error;
      setSuccess(
        editingDate
          ? "Expenses updated successfully!"
          : "Expenses added successfully!"
      );

      resetForm();
      fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditDate = (date: string) => {
    // Get all expenses for this date
    const dateExpenses = expenses.filter((e) => e.expense_date === date);

    // Get amount and fare from first visit (all visits have the same total)
    const totalAmount = dateExpenses[0]?.amount || 0;
    const totalFare = dateExpenses[0]?.fare_amount || 0;

    setEditingDate(date);
    setFormData({
      expense_date: date,
      amount: totalAmount.toString(),
      fare_amount: totalFare > 0 ? totalFare.toString() : "",
      visits: dateExpenses.map((exp) => ({
        doctor_id: exp.doctor_id || "",
        doctor_name: exp.doctor_name || exp.doctors?.name || "",
        location: exp.location,
        specialty: exp.specialty || "",
        contact_detail: exp.contact_detail || "",
        remarks: exp.remarks || "",
        doctorInputMode: exp.doctor_name ? "manual" : "select",
      })),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    // Get the expense to find its date
    const expense = expenses.find((e) => e.id === id);
    if (!expense) {
      setError("Expense not found");
      return;
    }

    // Delete all expenses for this date
    if (
      !confirm(
        `This will delete all visits for ${formatDate(
          expense.expense_date
        )}. Are you sure?`
      )
    )
      return;

    setDeletingId(id);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        return;
      }

      console.log(
        "Deleting expenses for date:",
        expense.expense_date,
        "user:",
        user.id
      );

      const { data, error } = await supabase
        .from("expenses")
        .delete()
        .eq("user_id", user.id)
        .eq("expense_date", expense.expense_date)
        .select();

      console.log("Delete result:", { data, error });

      if (error) {
        console.error("Delete error:", error);
        throw error;
      }

      setSuccess("All expenses for the date deleted successfully!");
      setSelectedExpense(null);
      fetchExpenses();
    } catch (err: any) {
      console.error("Error in handleDelete:", err);
      setError(err.message || "Failed to delete expenses");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteDate = async (date: string) => {
    if (
      !confirm(
        `Are you sure you want to delete all expenses for ${formatDate(date)}?`
      )
    )
      return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("user_id", user.id)
        .eq("expense_date", date);

      if (error) throw error;
      setSuccess("All expenses for the date deleted successfully!");
      fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      expense_date: new Date().toISOString().split("T")[0],
      amount: "",
      fare_amount: "",
      visits: [
        {
          doctor_id: "",
          doctor_name: "",
          location: "",
          specialty: "",
          contact_detail: "",
          remarks: "",
          doctorInputMode: "manual",
        },
      ],
    });
    setEditingDate(null);
    setShowForm(false);
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

  const handleEdit = (expense: Expense) => {
    // Find all expenses for the same date to edit together
    const dateExpenses = expenses.filter(
      (e) => e.expense_date === expense.expense_date
    );

    // Get amount and fare from first visit (all visits have the same total)
    const totalAmount = dateExpenses[0]?.amount || 0;
    const totalFare = dateExpenses[0]?.fare_amount || 0;

    setEditingDate(expense.expense_date);
    setFormData({
      expense_date: expense.expense_date,
      amount: totalAmount.toString(),
      fare_amount: totalFare > 0 ? totalFare.toString() : "",
      visits: dateExpenses.map((exp) => ({
        doctor_id: exp.doctor_id || "",
        doctor_name: exp.doctor_name || exp.doctors?.name || "",
        location: exp.location,
        specialty: exp.specialty || "",
        contact_detail: exp.contact_detail || "",
        remarks: exp.remarks || "",
        doctorInputMode: exp.doctor_name ? "manual" : "select",
      })),
    });
    
    setShowForm(true);
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
                  {editingDate ? "Edit Expenses" : "Add New Expenses"}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
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
                    className="max-w-xs"
                  />
                </div>

                {/* Total Amount and Fare */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div>
                    <Label htmlFor="total_amount">Total Amount (₹) *</Label>
                    <Input
                      id="total_amount"
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
                    <Label htmlFor="total_fare">Total Travel Fare (₹)</Label>
                    <Input
                      id="total_fare"
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

                {/* Visits Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base">
                      Doctor Visits ({formData.visits.length})
                    </Label>
                    <Button
                      type="button"
                      onClick={addVisitRow}
                      variant="outline"
                      size="sm"
                      className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Visit
                    </Button>
                  </div>

                  {formData.visits.map((visit, index) => (
                    <Card key={index} className="border-gray-200 rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">
                            Visit {index + 1}
                          </h4>
                          {formData.visits.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVisitRow(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Doctor Selection Mode */}
                          <div className="md:col-span-2">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={visit.doctorInputMode === "select"}
                                  onChange={() =>
                                    updateVisitRow(
                                      index,
                                      "doctorInputMode",
                                      "select"
                                    )
                                  }
                                  className="w-4 h-4 text-orange-600"
                                />
                                <span className="text-sm text-gray-700">
                                  Select from list
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={visit.doctorInputMode === "manual"}
                                  onChange={() =>
                                    updateVisitRow(
                                      index,
                                      "doctorInputMode",
                                      "manual"
                                    )
                                  }
                                  className="w-4 h-4 text-orange-600"
                                />
                                <span className="text-sm text-gray-700">
                                  Enter manually
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Doctor Dropdown or Manual Input */}
                          <div>
                            <Label>Doctor</Label>
                            {visit.doctorInputMode === "select" ? (
                              <select
                                value={visit.doctor_id}
                                onChange={(e) =>
                                  updateVisitRow(
                                    index,
                                    "doctor_id",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              >
                                <option value="">
                                  -- Select or enter manually --
                                </option>
                                {doctors.map((doctor) => (
                                  <option key={doctor.id} value={doctor.id}>
                                    {doctor.name} - {doctor.clinic}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                type="text"
                                value={visit.doctor_name}
                                onChange={(e) =>
                                  updateVisitRow(
                                    index,
                                    "doctor_name",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter doctor name"
                                required
                              />
                            )}
                          </div>

                          {/* Location */}
                          <div>
                            <Label>Location *</Label>
                            <Input
                              type="text"
                              value={visit.location}
                              onChange={(e) =>
                                updateVisitRow(
                                  index,
                                  "location",
                                  e.target.value
                                )
                              }
                              required
                              placeholder="Clinic/Hospital"
                            />
                          </div>

                          {/* Specialty */}
                          <div>
                            <Label>Specialty</Label>
                            <Input
                              type="text"
                              value={visit.specialty}
                              onChange={(e) =>
                                updateVisitRow(
                                  index,
                                  "specialty",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Cardiology, Neurology"
                            />
                          </div>

                          {/* Contact Detail */}
                          <div>
                            <Label>Contact Detail</Label>
                            <Input
                              type="text"
                              value={visit.contact_detail}
                              onChange={(e) =>
                                updateVisitRow(
                                  index,
                                  "contact_detail",
                                  e.target.value
                                )
                              }
                              placeholder="Phone number or email"
                            />
                          </div>

                          {/* Remarks */}
                          <div className="md:col-span-2">
                            <Label>Remarks</Label>
                            <Textarea
                              value={visit.remarks}
                              onChange={(e) =>
                                updateVisitRow(index, "remarks", e.target.value)
                              }
                              placeholder="Notes about this visit"
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {editingDate ? "Update Expenses" : "Add Expenses"}
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
                      // Group expenses by date
                      const groupedExpenses = expenses.reduce(
                        (acc, expense) => {
                          if (!acc[expense.expense_date]) {
                            acc[expense.expense_date] = [];
                          }
                          acc[expense.expense_date].push(expense);
                          return acc;
                        },
                        {} as Record<string, Expense[]>
                      );

                      return Object.entries(groupedExpenses).map(
                        ([date, dateExpenses]) => {
                          const totalAmount = dateExpenses[0]?.amount || 0;
                          const totalFare = dateExpenses[0]?.fare_amount || 0;

                          return (
                            <tr
                              key={date}
                              onClick={() => setExpandedDate(date)}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(date).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                {dateExpenses.length} visit
                                {dateExpenses.length > 1 ? "s" : ""}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                ₹{totalAmount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {totalFare > 0
                                  ? `₹${totalFare.toFixed(2)}`
                                  : "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600 dark:text-orange-400">
                                ₹{(totalAmount + (totalFare || 0)).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex gap-2">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditDate(date);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDate(date);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-600 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
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
        {expandedDate &&
          (() => {
            const dateExpenses = expenses.filter(
              (exp) => exp.expense_date === expandedDate
            );

            if (dateExpenses.length === 0) return null;

            const totalAmount = dateExpenses[0]?.amount || 0;
            const totalFare = dateExpenses[0]?.fare_amount || 0;

            return (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setExpandedDate(null)}
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
                          {new Date(expandedDate).toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedDate(null)}
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
                                Remarks
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {dateExpenses
                              .sort((a, b) => a.visit_order - b.visit_order)
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
                          ₹{totalAmount.toFixed(2)}
                        </span>
                      </div>
                      {totalFare > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Fare:
                          </span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            ₹{totalFare.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total:
                        </span>
                        <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          ₹{(totalAmount + (totalFare || 0)).toFixed(2)}
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
