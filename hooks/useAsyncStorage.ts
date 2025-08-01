import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../utils';

export const useAsyncStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredValue();
  }, [key]);

  const loadStoredValue = useCallback(async () => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading value for key "${key}":`, error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  const setValue = useCallback(async (value: T) => {
    try {
      setStoredValue(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error);
    }
  }, [key]);

  const removeValue = useCallback(async () => {
    try {
      setStoredValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing value for key "${key}":`, error);
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    loading,
  };
};

// Specific hooks for common use cases
export const useUserSession = () => {
  return useAsyncStorage(STORAGE_KEYS.USER_SESSION, null);
};

export const useWeatherCache = () => {
  return useAsyncStorage(STORAGE_KEYS.WEATHER_CACHE, null);
};

export const useAppSettings = () => {
  return useAsyncStorage(STORAGE_KEYS.APP_SETTINGS, {
    theme: 'light',
    notifications: true,
    locationEnabled: true,
  });
}; 