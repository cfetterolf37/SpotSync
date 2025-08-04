import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AddDealModal, FilterModal } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useDailyDeals } from '../../contexts/DailyDealsContext';
import { useVenues } from '../../contexts/VenueContext';
import { useWeather } from '../../contexts/WeatherContext';
import { venueService } from '../../lib/venues';

const { width } = Dimensions.get('window');

const HomeScreen = React.memo(() => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { weather, loading: weatherLoading, error: weatherError } = useWeather();
  const { venues, loading: venueLoading, error: venueError, searchVenues } = useVenues();
  const { createDeal, getVenueDealCount } = useDailyDeals();
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<{ id: string; name: string; category: string } | null>(null);
  const [dealCounts, setDealCounts] = useState<{ [venueId: string]: number }>({});
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

  const handleAddDeal = useCallback((venue: { id: string; name: string; category: string }) => {
    setSelectedVenue(venue);
    setShowAddDeal(true);
  }, []);

  const handleOpenMaps = useCallback((venue: { name: string; coordinates: { latitude: number; longitude: number } }) => {
    const { latitude, longitude } = venue.coordinates;
    const url = `https://maps.apple.com/?q=${encodeURIComponent(venue.name)}&ll=${latitude},${longitude}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps
        const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(venue.name)}&ll=${latitude},${longitude}`;
        Linking.openURL(googleMapsUrl);
      }
    }).catch((error) => {
      console.error('Error opening maps:', error);
    });
  }, []);

  // Load deal counts for venues
  const loadDealCounts = useCallback(async () => {
    if (venues.length === 0) return;
    
    console.log('Loading deal counts for venues:', venues.length);
    const counts: { [venueId: string]: number } = {};
    for (const venue of venues.slice(0, 10)) {
      try {
        const count = await getVenueDealCount(venue.id);
        counts[venue.id] = count;
        console.log(`Deal count for ${venue.name}: ${count}`);
      } catch (error) {
        console.error('Error loading deal count for venue:', venue.id, error);
        counts[venue.id] = 0;
      }
    }
    console.log('Final deal counts:', counts);
    setDealCounts(counts);
  }, [venues, getVenueDealCount]);

  // Load deal counts when venues change
  useEffect(() => {
    loadDealCounts();
  }, [loadDealCounts]);

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
                            distance: venue.distance
                          });

              return (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.venueCard}
                  accessibilityLabel={`${venue.name}, ${venue.category}`}
                  accessibilityHint={`Double tap to view details for ${venue.name}`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: false }}
                  accessibilityActions={[
                    { name: 'activate', label: 'View venue details' },
                    { name: 'longpress', label: 'Add deal to venue' }
                  ]}
                  onPress={() => handleVenuePress(venue.id)}
                  onLongPress={() => handleAddDeal({ id: venue.id, name: venue.name, category: venue.category })}
                  activeOpacity={0.9}
                >
                  {/* Subtle gradient overlay */}
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.02)', 'transparent', 'rgba(0, 0, 0, 0.02)']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.venueCardHeader}>
                    <View style={styles.venueMainInfo}>
                      <View style={styles.venueIconContainer}>
                        <Ionicons
                          name={venueService.getCategoryIcon(venue.category) as any}
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.venueTitleSection}>
                        <View style={styles.venueTitleRow}>
                          <Text style={styles.venueName} numberOfLines={1}>
                            {venue.name}
                          </Text>
                          {/* Debug: Always show deal count for testing */}
                          <View style={[styles.dealCountPill, { backgroundColor: dealCounts[venue.id] > 0 ? 'rgba(135, 206, 235, 0.15)' : 'rgba(255, 255, 255, 0.1)' }]}>
                            <Ionicons name="pricetag" size={12} color={dealCounts[venue.id] > 0 ? "#87CEEB" : "rgba(255, 255, 255, 0.5)"} />
                            <Text style={[styles.dealCountPillText, { color: dealCounts[venue.id] > 0 ? "#87CEEB" : "rgba(255, 255, 255, 0.5)" }]}>
                              {dealCounts[venue.id] || 0} deals
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.venueCategory} numberOfLines={1}>
                          {venue.category}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.venueAddress} numberOfLines={2}>
                    {venue.address}
                  </Text>

                  <View style={styles.venueCardFooter}>
                    <TouchableOpacity 
                      style={styles.distanceContainer}
                      onPress={() => handleOpenMaps({ name: venue.name, coordinates: venue.coordinates })}
                      accessibilityLabel="Open directions to venue"
                      accessibilityHint="Tap to open maps with directions to this venue"
                      accessibilityRole="button"
                    >
                      <Ionicons name="location-outline" size={14} color="#87CEEB" />
                      <Text style={styles.distanceText}>
                        {(venue.distance * 0.621371).toFixed(1)} mi away
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.venueActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleAddDeal({ id: venue.id, name: venue.name, category: venue.category })}
                        accessibilityLabel="Add deal to venue"
                        accessibilityHint="Tap to add a daily deal for this venue"
                        accessibilityRole="button"
                      >
                        <Ionicons name="pricetag-outline" size={16} color="#87CEEB" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        accessibilityLabel="Call venue"
                        accessibilityHint="Tap to call this venue"
                        accessibilityRole="button"
                      >
                        <Ionicons name="call-outline" size={16} color="#87CEEB" />
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

                  {selectedVenue && (
                    <AddDealModal
                      visible={showAddDeal}
                      onClose={() => {
                        setShowAddDeal(false);
                        setSelectedVenue(null);
                      }}
                      venueId={selectedVenue.id}
                      venueName={selectedVenue.name}
                      venueCategory={selectedVenue.category}
                    />
                  )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  venueTitleSection: {
    flex: 1,
  },
  venueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  venueName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flex: 1,
  },
  venueCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'capitalize',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontWeight: '500',
  },
  venueStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingText: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  venueAddress: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 20,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontWeight: '400',
  },
  venueCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(135, 206, 235, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 206, 235, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // Add subtle hover effect
    minHeight: 44, // Ensure touch target is large enough
  },
  distanceText: {
    fontSize: 13,
    color: '#87CEEB',
    fontWeight: '600',
  },
  venueActions: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealCountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  dealCountText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 12,
  },
  dealCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(135, 206, 235, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(135, 206, 235, 0.25)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealCountPillText: {
    fontSize: 12,
    color: '#87CEEB',
    fontWeight: '600',
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