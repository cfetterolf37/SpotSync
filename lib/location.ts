import * as Location from 'expo-location';
import { securityService } from './security';
import { LocationData } from './weather';

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      
      if (!hasPermission) {
        console.warn('Location permission denied');
        return null;
      }

      // Add timeout to prevent hanging
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Location timeout')), 15000);
      });

      const location = await Promise.race([locationPromise, timeoutPromise]);

      // Validate coordinates
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      if (!securityService.validateCoordinates(coords.latitude, coords.longitude)) {
        console.error('Invalid coordinates received:', coords);
        return null;
      }

      return coords;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async getLocationName(latitude: number, longitude: number): Promise<string | null> {
    try {
      // Validate coordinates before making API call
      if (!securityService.validateCoordinates(latitude, longitude)) {
        console.error('Invalid coordinates for reverse geocoding:', { latitude, longitude });
        return null;
      }

      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (response.length > 0) {
        const location = response[0];
        const parts = [
          location.city,
          location.region,
          location.country,
        ].filter(Boolean);

        return parts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Error getting location name:', error);
      return null;
    }
  }
}

export const locationService = new LocationService(); 