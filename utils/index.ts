import { COLORS, ERROR_MESSAGES, VALIDATION } from '../constants';

// Import Platform for device utilities
import { Platform } from 'react-native';

// Export logger
export { logger } from './logger';

// Validation Utilities
export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= VALIDATION.NAME_MIN_LENGTH;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// Form Validation
export const validateSignInForm = (email: string, password: string): string[] => {
  const errors: string[] = [];

  if (!validateRequired(email)) {
    errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
  } else if (!validateEmail(email)) {
    errors.push(ERROR_MESSAGES.INVALID_EMAIL);
  }

  if (!validateRequired(password)) {
    errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
  }

  return errors;
};

export const validateSignUpForm = (
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string
): string[] => {
  const errors: string[] = [];

  if (!validateRequired(fullName)) {
    errors.push('Full name is required');
  } else if (!validateName(fullName)) {
    errors.push('Full name must be at least 2 characters');
  }

  if (!validateRequired(email)) {
    errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
  } else if (!validateEmail(email)) {
    errors.push(ERROR_MESSAGES.INVALID_EMAIL);
  }

  if (!validateRequired(password)) {
    errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
  } else if (!validatePassword(password)) {
    errors.push(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
  }

  if (!validateRequired(confirmPassword)) {
    errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
  } else if (password !== confirmPassword) {
    errors.push(ERROR_MESSAGES.PASSWORDS_DONT_MATCH);
  }

  return errors;
};

export const validateForgotPasswordForm = (email: string): string[] => {
  const errors: string[] = [];

  if (!validateRequired(email)) {
    errors.push(ERROR_MESSAGES.REQUIRED_FIELD);
  } else if (!validateEmail(email)) {
    errors.push(ERROR_MESSAGES.INVALID_EMAIL);
  }

  return errors;
};

// String Utilities
export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const formatTemperature = (temp: number, unit: 'C' | 'F' = 'F'): string => {
  return `${Math.round(temp)}°${unit}`;
};

export const formatWindSpeed = (speed: number): string => {
  return `${speed} km/h`;
};

export const formatHumidity = (humidity: number): string => {
  return `${humidity}%`;
};

// Color Utilities
export const getSocialButtonColor = (provider: 'google' | 'apple' | 'github'): string => {
  switch (provider) {
    case 'google':
      return COLORS.GOOGLE_RED;
    case 'apple':
      return COLORS.APPLE_BLACK;
    case 'github':
      return COLORS.GITHUB_DARK;
    default:
      return COLORS.PRIMARY;
  }
};

// Date Utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Error Handling
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.code) {
    return `Error ${error.code}: ${error.message || 'Unknown error'}`;
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const isNetworkError = (error: any): boolean => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('network') ||
         error?.message?.includes('fetch');
};

// Async Storage Keys
export const STORAGE_KEYS = {
  USER_SESSION: 'user_session',
  WEATHER_CACHE: 'weather_cache',
  LOCATION_CACHE: 'location_cache',
  APP_SETTINGS: 'app_settings',
} as const;

// Device Utilities
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
}; 