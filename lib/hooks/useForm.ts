import { z } from "zod";
import { useState, useCallback } from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormOptions<T> {
  schema?: z.ZodSchema;
  onSubmit?: (data: any) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  options: UseFormOptions<T> = {}
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const fieldValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Clear error when user starts typing
      if (errors[name as keyof T]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const validate = useCallback(async () => {
    if (!options.schema) return true;

    try {
      await options.schema.parseAsync(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors<T> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof T;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [values, options.schema]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const isValid = await validate();
        if (isValid && options.onSubmit) {
          await options.onSubmit(values);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, values, options]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleChange,
    handleSubmit,
    validate,
    isSubmitting,
    reset,
  };
}
