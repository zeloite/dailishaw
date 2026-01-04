"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  return (
    <div
      className={`
        animate-slide-up border rounded-lg p-4 mb-3 flex items-start gap-3
        shadow-md backdrop-blur-sm transition-all duration-300
        ${colors[toast.type]}
      `}
      role="alert"
    >
      <span className={iconColors[toast.type]}>{icons[toast.type]}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-2 hover:opacity-70 transition"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full px-4 md:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
