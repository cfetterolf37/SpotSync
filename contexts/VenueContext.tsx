import React, { createContext, useContext, useEffect, useState } from 'react';
import { locationService } from '../lib/location';
import { Venue, venueService } from '../lib/venues';
import { useAuth } from './AuthContext';

interface VenueContextType {
  venues: Venue[];
  loading: boolean;
  error: string | null;
  refreshVenues: () => Promise<void>;
  searchVenues: (params?: {
    category?: string;
    radius?: number;
    minRating?: number;
    sortBy?: 'distance' | 'rating' | 'name';
  }) => Promise<void>;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export const useVenues = () => {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error('useVenues must be used within a VenueProvider');
  }
  return context;
};

interface VenueProviderProps {
  children: React.ReactNode;
}

export const VenueProvider = ({ children }: VenueProviderProps) => {
  const { user, loading: authLoading } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [venueInitialized, setVenueInitialized] = useState(false);

  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      const hasPermission = await locationService.requestLocationPermission();
      setHasLocationPermission(hasPermission);
      return hasPermission;
    } catch (error) {
      console.error('VenueContext: Location permission check failed', error);
      setHasLocationPermission(false);
      return false;
    }
  };

  const fetchVenueData = async (searchParams?: {
    category?: string;
    radius?: number;
    minRating?: number;
    sortBy?: 'distance' | 'rating' | 'name';
  }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('VenueContext: Starting venue fetch...');
      
      // First, check location permission
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setError('Location permission is required to find venues near you.');
        setLoading(false);
        return;
      }

      console.log('VenueContext: Location permission granted, getting location...');
      
      // Get current location with timeout
      const locationPromise = locationService.getCurrentLocation();
      let locationTimeoutId: ReturnType<typeof setTimeout> | undefined;
      const locationTimeoutPromise = new Promise<null>((resolve) => {
        locationTimeoutId = setTimeout(() => {
          console.log('VenueContext: Location timeout');
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

      console.log('VenueContext: Location obtained, fetching venues...', {
        lat: locationData.latitude,
        lng: locationData.longitude
      });

      // Get venue data with timeout
      const venuePromise = venueService.searchVenues({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        radius: searchParams?.radius || 5,
        category: searchParams?.category || undefined,
        minRating: searchParams?.minRating,
        sortBy: searchParams?.sortBy || 'distance'
      });
      
      let venueTimeoutId: ReturnType<typeof setTimeout> | undefined;
      const venueTimeoutPromise = new Promise<Venue[]>((resolve) => {
        venueTimeoutId = setTimeout(() => {
          console.log('VenueContext: Venue API timeout');
          resolve([]);
        }, 12000); // 12 second timeout for venue API
      });

      const venueData = await Promise.race([venuePromise, venueTimeoutPromise]);
      if (venueTimeoutId) clearTimeout(venueTimeoutId);

      if (!venueData || venueData.length === 0) {
        setError('No venues found nearby. Try expanding your search radius.');
        setVenues([]);
        setLoading(false);
        return;
      }

      setVenues(venueData);
      console.log('VenueContext: Venue data loaded successfully', {
        count: venueData.length,
        firstVenue: venueData[0]?.name
      });
    } catch (err) {
      console.error('VenueContext: Venue fetch error:', err);
      setError('Failed to load venues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshVenues = async () => {
    console.log('VenueContext: Manual refresh requested');
    await fetchVenueData();
  };

  const searchVenues = async (params?: {
    category?: string;
    radius?: number;
    minRating?: number;
    sortBy?: 'distance' | 'rating' | 'name';
  }) => {
    console.log('VenueContext: Search requested with params:', params);
    await fetchVenueData(params);
  };

  // Only start venue fetch after auth is complete and user is signed in
  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) {
      console.log('VenueContext: Waiting for auth to complete...');
      return;
    }

    // Reset venue state when user signs out
    if (!user && venueInitialized) {
      console.log('VenueContext: User signed out, resetting venue state');
      setVenues([]);
      setError(null);
      setVenueInitialized(false);
      return;
    }

    // Only fetch venues if user is signed in
    if (!user) {
      console.log('VenueContext: No user signed in, skipping venue fetch');
      return;
    }

    // Only initialize venues once per user session
    if (venueInitialized) {
      console.log('VenueContext: Already initialized for this session, skipping');
      return;
    }

    console.log('VenueContext: Auth complete, user signed in, starting venue fetch...');
    setVenueInitialized(true);

    // Start venue fetch immediately after auth is complete
    console.log('VenueContext: Starting initial venue fetch...');
    fetchVenueData();
  }, [authLoading, user, venueInitialized]);

  const value = {
    venues,
    loading,
    error,
    refreshVenues,
    searchVenues,
  };

  return (
    <VenueContext.Provider value={value}>
      {children}
    </VenueContext.Provider>
  );
}; 