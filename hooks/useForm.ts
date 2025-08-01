import { useCallback, useState } from 'react';
import { validateForgotPasswordForm, validateSignInForm, validateSignUpForm } from '../utils';

interface UseFormOptions {
  initialValues: Record<string, string>;
  validationType: 'signIn' | 'signUp' | 'forgotPassword';
}

export const useForm = ({ initialValues, validationType }: UseFormOptions) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    let validationErrors: string[] = [];

    switch (validationType) {
      case 'signIn':
        validationErrors = validateSignInForm(values.email || '', values.password || '');
        break;
      case 'signUp':
        validationErrors = validateSignUpForm(
          values.fullName || '',
          values.email || '',
          values.password || '',
          values.confirmPassword || ''
        );
        break;
      case 'forgotPassword':
        validationErrors = validateForgotPasswordForm(values.email || '');
        break;
    }

    const errorMap: Record<string, string> = {};
    validationErrors.forEach(error => {
      if (error.includes('email')) {
        errorMap.email = error;
      } else if (error.includes('password')) {
        errorMap.password = error;
      } else if (error.includes('Full name')) {
        errorMap.fullName = error;
      } else if (error.includes('confirm')) {
        errorMap.confirmPassword = error;
      }
    });

    setErrors(errorMap);
    return validationErrors.length === 0;
  }, [values, validationType]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    validate,
    reset,
  };
}; 