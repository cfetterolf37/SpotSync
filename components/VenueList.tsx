import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { locationService } from '../lib/location';
import { Venue, venueService } from '../lib/venues';
import { WeatherData } from '../lib/weather';
import { VenueCard } from './VenueCard';

interface VenueListProps {
  weather?: WeatherData | null;
  onVenuePress: (venue: Venue) => void;
}

const CATEGORIES = [
  { id: 'restaurant', name: 'Restaurants', icon: 'restaurant' },
  { id: 'bar', name: 'Bars', icon: 'wine' },
  { id: 'cafe', name: 'Cafes', icon: 'cafe' },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller' },
  { id: 'shopping', name: 'Shopping', icon: 'bag' },
  { id: 'sports', name: 'Sports', icon: 'football' },
  { id: 'arcade', name: 'Arcades', icon: 'game-controller' },
  { id: 'theater', name: 'Theaters', icon: 'film' },
];

const RADIUS_OPTIONS = [
  { value: 0.5, label: '0.5 km' },
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
];

const PRICE_RANGES = [
  { value: 'budget', label: 'Budget', icon: 'cash-outline' },
  { value: 'moderate', label: 'Moderate', icon: 'card-outline' },
  { value: 'expensive', label: 'Expensive', icon: 'diamond-outline' },
  { value: 'luxury', label: 'Luxury', icon: 'trophy-outline' },
];

const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance', icon: 'location' },
  { value: 'rating', label: 'Rating', icon: 'star' },
  { value: 'name', label: 'Name', icon: 'text' },
];

export const VenueList: React.FC<VenueListProps> = ({ weather, onVenuePress }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRadius, setSelectedRadius] = useState(2);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedSortBy, setSelectedSortBy] = useState<'distance' | 'rating' | 'name'>('distance');
  const [minRating, setMinRating] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchVenues();
    }
  }, [userLocation, selectedCategory, selectedRadius, selectedPriceRange, selectedSortBy, minRating]);

  const getCurrentLocation = async () => {
    try {
      setLocationError(null);
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
      } else {
        setLocationError('Unable to get your location. Please check your location permissions.');
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationError('Failed to get your location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchVenues = async () => {
    if (!userLocation) return;

    try {
      // Add timeout for venue search
      const searchPromise = venueService.searchVenues({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        radius: selectedRadius,
        category: selectedCategory || undefined,
        minRating: minRating > 0 ? minRating : undefined,
        sortBy: selectedSortBy,
        limit: 50,
      });

      const timeoutPromise = new Promise<Venue[]>((resolve) => {
        setTimeout(() => {
          console.warn('Venue search timeout, showing empty results');
          resolve([]);
        }, 10000);
      });

      const venueResults = await Promise.race([searchPromise, timeoutPromise]);
      setVenues(venueResults);
    } catch (error) {
      console.error('Error searching venues:', error);
      setVenues([]); // Show empty state instead of hanging
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await searchVenues();
    setRefreshing(false);
  };

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Categories</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(selectedCategory === item.id ? '' : item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={16}
              color={selectedCategory === item.id ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item.id && styles.categoryButtonTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  const renderRadiusFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Radius</Text>
      <View style={styles.radiusContainer}>
        {RADIUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.radiusButton,
              selectedRadius === option.value && styles.radiusButtonActive,
            ]}
            onPress={() => setSelectedRadius(option.value)}
          >
            <Text
              style={[
                styles.radiusButtonText,
                selectedRadius === option.value && styles.radiusButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPriceFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Price Range</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={PRICE_RANGES}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedPriceRange === item.value && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedPriceRange(selectedPriceRange === item.value ? '' : item.value)}
          >
            <Ionicons
              name={item.icon as any}
              size={16}
              color={selectedPriceRange === item.value ? '#FFFFFF' : '#8E8E93'}
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedPriceRange === item.value && styles.categoryButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  const renderSortFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Sort By</Text>
      <View style={styles.radiusContainer}>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.radiusButton,
              selectedSortBy === option.value && styles.radiusButtonActive,
            ]}
            onPress={() => setSelectedSortBy(option.value as any)}
          >
            <Ionicons
              name={option.icon as any}
              size={14}
              color={selectedSortBy === option.value ? '#FFFFFF' : '#8E8E93'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.radiusButtonText,
                selectedSortBy === option.value && styles.radiusButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderVenue = ({ item }: { item: Venue }) => (
    <VenueCard
      venue={item}
      weather={weather}
      onPress={() => onVenuePress(item)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Finding venues near you...</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-outline" size={48} color="#8E8E93" />
        <Text style={styles.errorTitle}>Location Required</Text>
        <Text style={styles.errorText}>
          {locationError || 'Please enable location services to discover venues near you.'}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            getCurrentLocation();
          }}
        >
          <Ionicons name="refresh" size={16} color="#007AFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderCategoryFilter()}
      {renderRadiusFilter()}
      {renderPriceFilter()}
      {renderSortFilter()}
      
      <FlatList
        data={venues}
        renderItem={renderVenue}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No venues found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or expanding your search radius.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  categoryList: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  radiusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  radiusButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  radiusButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  radiusButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
}); 