import React, { createContext, useContext, useEffect, useState } from 'react';
import { locationService } from '../lib/location';
import { WeatherData, weatherService } from '../lib/weather';

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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current location
      const locationData = await locationService.getCurrentLocation();
      
      if (!locationData) {
        setError('Unable to get location. Please enable location permissions.');
        setLoading(false);
        return;
      }

      // Get weather data
      const weatherData = await weatherService.getCurrentWeather(
        locationData.latitude,
        locationData.longitude
      );

      if (!weatherData) {
        setError('Unable to fetch weather data. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Get location name
      const locationName = await locationService.getLocationName(
        locationData.latitude,
        locationData.longitude
      );

      setWeather(weatherData);
      setLocation(locationName || weatherData.city);
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshWeather = async () => {
    await fetchWeatherData();
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

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