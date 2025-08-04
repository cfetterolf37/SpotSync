/**
 * Production configuration for SpotSync
 * Contains environment-specific settings and feature flags
 */

export interface ProductionConfig {
  // API Configuration
  api: {
    timeout: number;
    retryAttempts: number;
    rateLimitPerMinute: number;
  };
  
  // Caching Configuration
  cache: {
    weatherCacheDuration: number; // in milliseconds
    venueCacheDuration: number; // in milliseconds
    maxCacheSize: number; // in MB
  };
  
  // Performance Configuration
  performance: {
    enableMonitoring: boolean;
    enableProfiling: boolean;
    maxRenderTime: number; // in milliseconds
  };
  
  // Error Reporting Configuration
  errorReporting: {
    enabled: boolean;
    captureUnhandledErrors: boolean;
    captureNetworkErrors: boolean;
    capturePerformanceErrors: boolean;
  };
  
  // Feature Flags
  features: {
    enableSocialLogin: boolean;
    enableLocationServices: boolean;
    enablePushNotifications: boolean;
    enableAnalytics: boolean;
    enableCrashReporting: boolean;
  };
  
  // Security Configuration
  security: {
    enableCertificatePinning: boolean;
    enableBiometricAuth: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number; // in milliseconds
  };
}

/**
 * Production configuration
 * These settings are optimized for production deployment
 */
export const productionConfig: ProductionConfig = {
  api: {
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    rateLimitPerMinute: 60,
  },
  
  cache: {
    weatherCacheDuration: 5 * 60 * 1000, // 5 minutes
    venueCacheDuration: 30 * 60 * 1000, // 30 minutes
    maxCacheSize: 50, // 50 MB
  },
  
  performance: {
    enableMonitoring: true,
    enableProfiling: false, // Disabled in production for performance
    maxRenderTime: 16, // 16ms (60fps)
  },
  
  errorReporting: {
    enabled: true,
    captureUnhandledErrors: true,
    captureNetworkErrors: true,
    capturePerformanceErrors: true,
  },
  
  features: {
    enableSocialLogin: true,
    enableLocationServices: true,
    enablePushNotifications: false, // Disabled until implemented
    enableAnalytics: true,
    enableCrashReporting: true,
  },
  
  security: {
    enableCertificatePinning: false, // Disabled until implemented
    enableBiometricAuth: false, // Disabled until implemented
    maxLoginAttempts: 5,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
};

/**
 * Development configuration
 * These settings are optimized for development
 */
export const developmentConfig: ProductionConfig = {
  api: {
    timeout: 30000, // 30 seconds for debugging
    retryAttempts: 1,
    rateLimitPerMinute: 1000, // Higher limit for development
  },
  
  cache: {
    weatherCacheDuration: 1 * 60 * 1000, // 1 minute
    venueCacheDuration: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 100, // 100 MB
  },
  
  performance: {
    enableMonitoring: true,
    enableProfiling: true, // Enabled in development
    maxRenderTime: 50, // 50ms for development
  },
  
  errorReporting: {
    enabled: false, // Disabled in development
    captureUnhandledErrors: false,
    captureNetworkErrors: false,
    capturePerformanceErrors: false,
  },
  
  features: {
    enableSocialLogin: true,
    enableLocationServices: true,
    enablePushNotifications: false,
    enableAnalytics: false, // Disabled in development
    enableCrashReporting: false,
  },
  
  security: {
    enableCertificatePinning: false,
    enableBiometricAuth: false,
    maxLoginAttempts: 10, // Higher limit for development
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

/**
 * Get the appropriate configuration based on environment
 */
export const getConfig = (): ProductionConfig => {
  return __DEV__ ? developmentConfig : productionConfig;
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof ProductionConfig['features']): boolean => {
  const config = getConfig();
  return config.features[feature];
};

/**
 * Get API configuration
 */
export const getApiConfig = () => {
  const config = getConfig();
  return config.api;
};

/**
 * Get cache configuration
 */
export const getCacheConfig = () => {
  const config = getConfig();
  return config.cache;
};

/**
 * Get performance configuration
 */
export const getPerformanceConfig = () => {
  const config = getConfig();
  return config.performance;
};

/**
 * Get error reporting configuration
 */
export const getErrorReportingConfig = () => {
  const config = getConfig();
  return config.errorReporting;
};

/**
 * Get security configuration
 */
export const getSecurityConfig = () => {
  const config = getConfig();
  return config.security;
}; 