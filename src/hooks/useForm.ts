import { useState, useCallback } from 'react';
import type { FormState, FormStatus } from '@/types';

interface UseFormOptions<T extends FormState> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Record<string, string>;
}

interface UseFormReturn<T extends FormState> {
  values: T;
  errors: Record<string, string>;
  status: FormStatus;
  handleChange: (name: keyof T, value: string | number | boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  setFieldError: (name: keyof T, error: string) => void;
  clearErrors: () => void;
}

/**
 * Custom hook for form state management
 */
export function useForm<T extends FormState>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleChange = useCallback((name: keyof T, value: string | number | boolean) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrors({});

    // Validate if validator provided
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setStatus('error');
        return;
      }
    }

    try {
      await onSubmit(values);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setStatus('idle');
  }, [initialValues]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name as string]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    values,
    errors,
    status,
    handleChange,
    handleSubmit,
    reset,
    setFieldError,
    clearErrors,
  };
}