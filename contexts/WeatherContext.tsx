import React, { createContext, useContext, useEffect, useState } from 'react';
import { locationService } from '../lib/location';
import { WeatherData, weatherService } from '../lib/weather';
import { useAuth } from './AuthContext';

interface WeatherContextType {
  weather: WeatherData | null;
  location: string | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

interface WeatherProviderProps {
  children: React.ReactNode;
}

export const WeatherProvider: React.FC<WeatherProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [weatherInitialized, setWeatherInitialized] = useState(false);

  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      const hasPermission = await locationService.requestLocationPermission();
      setHasLocationPermission(hasPermission);
      return hasPermission;
    } catch (error) {
      console.error('WeatherContext: Location permission check failed', error);
      setHasLocationPermission(false);
      return false;
    }
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('WeatherContext: Starting weather fetch...');
      
      // First, check location permission
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setError('Location permission is required to get weather data.');
        setLoading(false);
        return;
      }

      console.log('WeatherContext: Location permission granted, getting location...');
      
      // Get current location with timeout
      const locationPromise = locationService.getCurrentLocation();
      let locationTimeoutId: ReturnType<typeof setTimeout> | undefined;
      const locationTimeoutPromise = new Promise<null>((resolve) => {
        locationTimeoutId = setTimeout(() => {
          console.log('WeatherContext: Location timeout');
          resolve(null);
        }, 10000); // 10 second timeout for location
      });

      const locationData = await Promise.race([locationPromise, locationTimeoutPromise]);
      if (locationTimeoutId) clearTimeout(locationTimeoutId);
      
      if (!locationData) {
        setError('Unable to get your location. Please check your location settings.');
        setLoading(false);
        return;
      }

      console.log('WeatherContext: Location obtained, fetching weather...', {
        lat: locationData.latitude,
        lng: locationData.longitude
      });

      // Get weather data with timeout
      const weatherPromise = weatherService.getCurrentWeather(
        locationData.latitude,
        locationData.longitude
      );
      let weatherTimeoutId: ReturnType<typeof setTimeout> | undefined;
      const weatherTimeoutPromise = new Promise<WeatherData | null>((resolve) => {
        weatherTimeoutId = setTimeout(() => {
          console.log('WeatherContext: Weather API timeout');
          resolve(null);
        }, 8000); // 8 second timeout for weather API
      });

      const weatherData = await Promise.race([weatherPromise, weatherTimeoutPromise]);
      if (weatherTimeoutId) clearTimeout(weatherTimeoutId);

      if (!weatherData) {
        setError('Unable to fetch weather data. Please check your internet connection.');
        setLoading(false);
        return;
      }

      console.log('WeatherContext: Weather data received, getting location name...');

      // Get location name (this can fail without affecting weather display)
      try {
        const locationName = await locationService.getLocationName(
          locationData.latitude,
          locationData.longitude
        );
        setLocation(locationName || weatherData.city);
      } catch (locationNameError) {
        console.log('WeatherContext: Could not get location name, using weather city');
        setLocation(weatherData.city);
      }

      setWeather(weatherData);
      console.log('WeatherContext: Weather data loaded successfully', {
        temperature: weatherData.temperatureFahrenheit,
        description: weatherData.description,
        city: weatherData.city
      });
    } catch (err) {
      console.error('WeatherContext: Weather fetch error:', err);
      setError('Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshWeather = async () => {
    console.log('WeatherContext: Manual refresh requested');
    await fetchWeatherData();
  };

  // Only start weather fetch after auth is complete and user is signed in
  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) {
      console.log('WeatherContext: Waiting for auth to complete...');
      return;
    }

    // Reset weather state when user signs out
    if (!user && weatherInitialized) {
      console.log('WeatherContext: User signed out, resetting weather state');
      setWeather(null);
      setLocation(null);
      setError(null);
      setWeatherInitialized(false);
      return;
    }

    // Only fetch weather if user is signed in
    if (!user) {
      console.log('WeatherContext: No user signed in, skipping weather fetch');
      return;
    }

    // Only initialize weather once per user session
    if (weatherInitialized) {
      console.log('WeatherContext: Already initialized for this session, skipping');
      return;
    }

    console.log('WeatherContext: Auth complete, user signed in, starting weather fetch...');
    setWeatherInitialized(true);

    // Start weather fetch immediately after auth is complete
    console.log('WeatherContext: Starting initial weather fetch...');
    fetchWeatherData();
  }, [authLoading, user, weatherInitialized]);

  const value = {
    weather,
    location,
    loading,
    error,
    refreshWeather,
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}; 