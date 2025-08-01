interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  openWeatherApiKey: string;
  geoapifyApiKey: string;
  googleClientId?: string;
  appleClientId?: string;
  githubClientId?: string;
}

class SecurityService {
  private config: EnvironmentConfig | null = null;

  validateEnvironment(): EnvironmentConfig {
    const required = {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      openWeatherApiKey: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY,
      geoapifyApiKey: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY,
    };

    const missing = Object.entries(required)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate API key formats
    this.validateApiKey('OpenWeatherMap', required.openWeatherApiKey!);
    this.validateApiKey('Geoapify', required.geoapifyApiKey!);
    this.validateSupabaseConfig(required.supabaseUrl!, required.supabaseAnonKey!);

    this.config = {
      ...required,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      appleClientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID,
      githubClientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
    };

    return this.config;
  }

  private validateApiKey(service: string, apiKey: string): void {
    if (!apiKey || apiKey.length < 10) {
      throw new Error(`Invalid ${service} API key format`);
    }
  }

  private validateSupabaseConfig(url: string, key: string): void {
    if (!url.includes('supabase.co')) {
      throw new Error('Invalid Supabase URL format');
    }
    if (!key.startsWith('eyJ')) {
      throw new Error('Invalid Supabase anon key format');
    }
  }

  getConfig(): EnvironmentConfig {
    if (!this.config) {
      throw new Error('Environment not validated. Call validateEnvironment() first.');
    }
    return this.config;
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }

  // Validate coordinates
  validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // Validate radius
  validateRadius(radius: number): boolean {
    return radius > 0 && radius <= 50; // Max 50km radius
  }
}

export const securityService = new SecurityService(); 