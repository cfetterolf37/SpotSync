// Auth Types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any } | undefined>;
  signInWithApple: () => Promise<{ error: any } | undefined>;
  signInWithGithub: () => Promise<{ error: any } | undefined>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

// Weather Types
export interface WeatherData {
  temperature: number;
  temperatureCelsius: number;
  temperatureFahrenheit: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface WeatherContextType {
  weather: WeatherData | null;
  location: string | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
}

// Navigation Types
export interface RootStackParamList {
  '(tabs)': undefined;
  '(auth)': undefined;
  'loading': undefined;
}

export interface AuthStackParamList {
  'sign-in': undefined;
  'sign-up': undefined;
  'forgot-password': undefined;
}

export interface TabsStackParamList {
  'index': undefined;
  'profile': undefined;
}

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  icon?: string;
  error?: string;
}

// Form Types
export interface SignInForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordForm {
  email: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: any | null;
}

export interface SupabaseResponse {
  data: any;
  error: any;
} 