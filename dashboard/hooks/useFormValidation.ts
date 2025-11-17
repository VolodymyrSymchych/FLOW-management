import { useState, useMemo, useCallback } from 'react';
import { z } from 'zod';
import { debounce } from '@/lib/utils';

interface ValidationErrors {
  [key: string]: string;
}

/**
 * Hook for inline form validation with debouncing
 *
 * Features:
 * - Real-time validation with debounce
 * - Zod schema support
 * - Per-field error tracking
 * - onBlur validation
 * - Form-wide validation
 *
 * @example
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 *
 * const { errors, validateField, validateForm, clearError } = useFormValidation(schema);
 *
 * <Input
 *   name="email"
 *   onBlur={(e) => validateField('email', e.target.value)}
 *   error={errors.email}
 * />
 */
export function useFormValidation<T extends z.ZodObject<any>>(
  schema: T,
  options: {
    debounceMs?: number;
    validateOnChange?: boolean;
  } = {}
) {
  const { debounceMs = 300, validateOnChange = false } = options;
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  /**
   * Validate a single field
   */
  const validateField = useCallback((name: string, value: any): boolean => {
    try {
      // Get the field schema
      const fieldSchema = schema.shape[name];

      if (!fieldSchema) {
        console.warn(`Field "${name}" not found in schema`);
        return true;
      }

      // Validate the field
      fieldSchema.parse(value);

      // Clear error if validation passed
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set error message
        setErrors((prev) => ({
          ...prev,
          [name]: error.issues[0]?.message || 'Validation error',
        }));
        return false;
      }
      return false;
    }
  }, [schema]);

  /**
   * Debounced validation for onChange events
   */
  const debouncedValidateField = useMemo(
    () => debounce(validateField, debounceMs),
    [validateField, debounceMs]
  );

  /**
   * Handle field blur (validate immediately)
   */
  const handleBlur = useCallback((name: string, value: any) => {
    setTouchedFields((prev) => new Set(prev).add(name));
    validateField(name, value);
  }, [validateField]);

  /**
   * Handle field change (validate with debounce if enabled)
   */
  const handleChange = useCallback((name: string, value: any) => {
    if (validateOnChange || touchedFields.has(name)) {
      debouncedValidateField(name, value);
    }
  }, [validateOnChange, touchedFields, debouncedValidateField]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((data: any): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
  }, [schema]);

  /**
   * Clear a specific field error
   */
  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouchedFields(new Set());
  }, []);

  /**
   * Check if form has errors
   */
  const hasErrors = Object.keys(errors).length > 0;

  /**
   * Get error for a specific field
   */
  const getError = useCallback((name: string) => errors[name], [errors]);

  return {
    errors,
    hasErrors,
    validateField,
    validateForm,
    handleBlur,
    handleChange,
    clearError,
    clearErrors,
    getError,
    touchedFields,
  };
}

/**
 * Example usage:
 *
 * const signupSchema = z.object({
 *   email: z.string().email('Invalid email address'),
 *   password: z.string().min(8, 'Password must be at least 8 characters'),
 *   confirmPassword: z.string()
 * }).refine((data) => data.password === data.confirmPassword, {
 *   message: "Passwords don't match",
 *   path: ["confirmPassword"]
 * });
 *
 * function SignupForm() {
 *   const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
 *   const { errors, handleBlur, handleChange, validateForm } = useFormValidation(signupSchema);
 *
 *   const handleSubmit = (e) => {
 *     e.preventDefault();
 *     if (validateForm(formData)) {
 *       // Submit form
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <Input
 *         name="email"
 *         value={formData.email}
 *         onChange={(e) => {
 *           setFormData({ ...formData, email: e.target.value });
 *           handleChange('email', e.target.value);
 *         }}
 *         onBlur={(e) => handleBlur('email', e.target.value)}
 *         error={errors.email}
 *       />
 *     </form>
 *   );
 * }
 */
