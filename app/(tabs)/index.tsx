import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FilterModal } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useVenues } from '../../contexts/VenueContext';
import { useWeather } from '../../contexts/WeatherContext';

const { width } = Dimensions.get('window');

const HomeScreen = React.memo(() => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { weather, loading: weatherLoading, error: weatherError } = useWeather();
  const { venues, loading: venueLoading, error: venueError, searchVenues } = useVenues();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    radius: 5,
  });

  const handleApplyFilters = useCallback(async (filters: { category: string; radius: number }) => {
    setActiveFilters(filters);
    console.log('Applying filters:', filters);

    await searchVenues({
      category: filters.category || undefined,
      radius: filters.radius,
    });
  }, [searchVenues]);

  const handleVenuePress = useCallback((venueId: string) => {
    console.log('Venue card tapped, navigating to:', `/venue-details?venueId=${venueId}`);
    router.push(`/venue-details?venueId=${venueId}`);
  }, [router]);

  const getFilterIndicatorText = useCallback(() => {
    const indicators = [];
    if (activeFilters.category) {
      indicators.push(activeFilters.category);
    }
    if (activeFilters.radius !== 5) {
      indicators.push(`${activeFilters.radius} mi`);
    }
    return indicators.join(', ');
  }, [activeFilters]);

  const hasActiveFilters = useMemo(() =>
    activeFilters.category || activeFilters.radius !== 5,
    [activeFilters]
  );

  const getWeatherIcon = useCallback((description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return 'sunny';
    if (desc.includes('cloud')) return 'cloudy';
    if (desc.includes('rain')) return 'rainy';
    if (desc.includes('snow')) return 'snow';
    if (desc.includes('thunder')) return 'thunderstorm';
    if (desc.includes('fog') || desc.includes('mist')) return 'water';
    return 'partly-sunny';
  }, []);

  const getWeatherColor = useCallback((description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return '#FFD700';
    if (desc.includes('cloud')) return '#87CEEB';
    if (desc.includes('rain')) return '#4682B4';
    if (desc.includes('snow')) return '#F0F8FF';
    if (desc.includes('thunder')) return '#483D8B';
    if (desc.includes('fog') || desc.includes('mist')) return '#B0C4DE';
    return '#87CEEB';
  }, []);

  const getWeatherGradient = useCallback((description: string): [string, string] => {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return ['#FFD700', '#FFA500'];
    if (desc.includes('cloud')) return ['#87CEEB', '#4682B4'];
    if (desc.includes('rain')) return ['#4682B4', '#2F4F4F'];
    if (desc.includes('snow')) return ['#F0F8FF', '#B0C4DE'];
    if (desc.includes('thunder')) return ['#483D8B', '#2F4F4F'];
    if (desc.includes('fog') || desc.includes('mist')) return ['#B0C4DE', '#696969'];
    return ['#87CEEB', '#4682B4'];
  }, []);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/SpotSyncLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SpotSync</Text>
          {weather && weather.city && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={12} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.locationText}>{weather.city}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          accessibilityLabel="Open filters"
          accessibilityHint="Opens the venue filter options"
        >
          <Ionicons name="funnel-outline" size={20} color="#FFFFFF" />
          {hasActiveFilters && (
            <View style={styles.filterIndicator}>
              <Text style={styles.filterIndicatorText}>•</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ), [weather, hasActiveFilters]);

  const renderLocationWeather = () => {
    if (authLoading) {
      return (
        <View style={styles.locationWeatherCard}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.locationWeatherCard}>
          <Ionicons name="person-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.locationText}>Please sign in to see your location</Text>
        </View>
      );
    }

    if (weatherLoading) {
      return (
        <View style={styles.locationWeatherCard}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingText}>Getting your location and weather...</Text>
        </View>
      );
    }

    if (weatherError) {
      return (
        <View style={styles.locationWeatherCard}>
          <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
          <Text style={styles.errorText}>{weatherError}</Text>
        </View>
      );
    }

    if (weather) {
      const gradientColors = getWeatherGradient(weather.description);

      return (
        <LinearGradient
          colors={gradientColors}
          style={styles.locationWeatherCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.weatherMainRow}>
            <View style={styles.weatherPrimary}>
              <View style={styles.temperatureSection}>
                <Text style={styles.temperatureF}>{weather.temperatureFahrenheit}°F</Text>
                <Text style={styles.temperatureC}>{weather.temperatureCelsius}°C</Text>
              </View>
              <View style={styles.weatherIconContainer}>
                <Ionicons
                  name={getWeatherIcon(weather.description)}
                  size={32}
                  color={getWeatherColor(weather.description)}
                />
              </View>
            </View>

            <View style={styles.weatherSecondary}>
              <Text style={styles.weatherDescription}>{weather.description}</Text>
              <View style={styles.weatherStats}>
                <View style={styles.weatherStat}>
                  <Ionicons name="water-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.weatherStatText}>{weather.humidity}%</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Ionicons name="speedometer-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.weatherStatText}>{weather.windSpeed} km/h</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.locationWeatherCard}>
        <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.locationText}>Weather unavailable</Text>
      </View>
    );
  };

  const renderVenuesSection = () => {
    if (authLoading || weatherLoading) {
      return (
        <View style={styles.venuesSection}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading venues...</Text>
          </View>
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.venuesSection}>
          <View style={styles.errorCard}>
            <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.errorText}>Please sign in to see venues</Text>
          </View>
        </View>
      );
    }

    if (venueLoading) {
      return (
        <View style={styles.venuesSection}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Finding venues near you...</Text>
          </View>
        </View>
      );
    }

    if (venueError) {
      return (
        <View style={styles.venuesSection}>
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{venueError}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.venuesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Nearby Venues ({venues.length})
          </Text>
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getFilterIndicatorText()}</Text>
            </View>
          )}
        </View>
        {venues.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={48} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.emptyText}>No venues found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or location</Text>
          </View>
        ) : (
          <View style={styles.venuesList}>
                                    {venues.slice(0, 10).map((venue, index) => {
                          console.log('Rendering venue card:', venue.id, venue.name);
                          console.log('Venue card data:', {
                            name: venue.name,
                            rating: venue.rating,
                            priceRange: venue.priceRange,
                            distance: venue.distance
                          });

              return (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.venueCard}
                  accessibilityLabel={`${venue.name}, ${venue.category}`}
                  accessibilityHint={`Tap to view details for ${venue.name}`}
                  accessibilityRole="button"
                  onPress={() => handleVenuePress(venue.id)}
                >
                  <View style={styles.venueCardHeader}>
                    <View style={styles.venueMainInfo}>
                      <View style={styles.venueIconContainer}>
                        <Ionicons
                          name="restaurant"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.venueTitleSection}>
                        <Text style={styles.venueName} numberOfLines={1}>
                          {venue.name}
                        </Text>
                        <Text style={styles.venueCategory} numberOfLines={1}>
                          {venue.category}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.venueStats}>
                      {venue.rating && venue.rating > 0 && (
                        <View style={styles.venueRating}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingText}>{venue.rating}</Text>
                        </View>
                      )}
                      {venue.priceRange && venue.priceRange !== '' && (
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceText}>
                            {venue.priceRange === '1' ? '$' :
                             venue.priceRange === '2' ? '$$' :
                             venue.priceRange === '3' ? '$$$' :
                             venue.priceRange === '4' ? '$$$$' : venue.priceRange}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={styles.venueAddress} numberOfLines={2}>
                    {venue.address}
                  </Text>

                  <View style={styles.venueCardFooter}>
                    <View style={styles.distanceContainer}>
                      <Ionicons name="location-outline" size={14} color="#87CEEB" />
                      <Text style={styles.distanceText}>
                        {(venue.distance * 0.621371).toFixed(1)} mi away
                      </Text>
                    </View>
                    <View style={styles.venueActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="call-outline" size={16} color="#87CEEB" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="navigate-outline" size={16} color="#87CEEB" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderHeader()}
        {renderLocationWeather()}
        {renderVenuesSection()}
      </ScrollView>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </View>
  );
});

HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 20, // Add padding at the bottom to prevent content from sticking to the bottom
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logoContainer: {
    width: 50,
    height: 50,
    flexShrink: 0,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  filterButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  filterIndicator: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  filterIndicatorText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  locationWeatherCard: {
    backgroundColor: 'rgba(135, 206, 235, 0.2)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(135, 206, 235, 0.4)',
    shadowColor: '#87CEEB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  weatherMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherSecondary: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  weatherIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 8,
  },
  temperatureSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  temperatureF: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  temperatureC: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  weatherDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    marginBottom: 6,
    fontWeight: '500',
  },
  weatherStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  weatherStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  weatherStatText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
  },
  venuesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  errorCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  venuesScrollContainer: {
    paddingRight: 20,
  },
  venuesList: {
    // No specific styles for the list container, as it's a View
  },
  venueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  venueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  venueMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  venueIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueTitleSection: {
    flex: 1,
  },
  venueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  venueCategory: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  venueStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.4)',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  priceText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  venueAddress: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  venueCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  venueActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
    fontWeight: '500',
  },
}); 