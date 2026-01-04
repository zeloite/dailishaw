import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 transition-all duration-200",
            "border-neutral-200 dark:border-neutral-700",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50 dark:disabled:bg-neutral-900",
            error && "border-danger focus:ring-danger-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs font-medium text-danger">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
