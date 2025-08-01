// API Configuration
export const API_CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
} as const;

// Social Login Configuration
export const SOCIAL_LOGIN_CONFIG = {
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  APPLE_CLIENT_ID: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || '',
  GITHUB_CLIENT_ID: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '',
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'SpotSync',
  APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME || 'spotsync',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'SpotSync',
  VERSION: '1.0.0',
  DESCRIPTION: 'Location-based venue discovery with community-driven insights',
} as const;

// Colors
export const COLORS = {
  // Primary Colors
  PRIMARY: '#667eea',
  PRIMARY_DARK: '#5a6fd8',
  SECONDARY: '#764ba2',
  SECONDARY_DARK: '#6a4190',
  
  // Brand Colors (Spotify-inspired)
  SPOTIFY_GREEN: '#1DB954',
  SPOTIFY_DARK: '#191414',
  
  // UI Colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY: '#666666',
  LIGHT_GRAY: '#f8f9fa',
  BORDER_GRAY: '#e1e5e9',
  PLACEHOLDER_GRAY: '#999999',
  
  // Status Colors
  SUCCESS: '#34C759',
  WARNING: '#FF9500',
  ERROR: '#FF3B30',
  INFO: '#007AFF',
  
  // Social Colors
  GOOGLE_RED: '#DB4437',
  APPLE_BLACK: '#000000',
  GITHUB_DARK: '#333333',
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 28,
    TITLE: 32,
  },
  FONT_WEIGHTS: {
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
  LINE_HEIGHTS: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
  },
} as const;

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 40,
  XXXL: 60,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  XXL: 24,
  FULL: 9999,
} as const;

// Shadows
export const SHADOWS = {
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// Weather Icons Mapping
export const WEATHER_ICONS = {
  '01d': 'sunny',
  '01n': 'moon',
  '02d': 'partly-sunny',
  '02n': 'partly-sunny-outline',
  '03d': 'cloud',
  '03n': 'cloud',
  '04d': 'cloudy',
  '04n': 'cloudy',
  '09d': 'rainy',
  '09n': 'rainy',
  '10d': 'rainy',
  '10n': 'rainy',
  '11d': 'thunderstorm',
  '11n': 'thunderstorm',
  '13d': 'snow',
  '13n': 'snow',
  '50d': 'water',
  '50n': 'water',
} as const;

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const; 