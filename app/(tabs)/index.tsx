import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useVenues } from '../../contexts/VenueContext';
import { useWeather } from '../../contexts/WeatherContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const { weather, loading: weatherLoading, error: weatherError } = useWeather();
  const { venues, loading: venueLoading, error: venueError } = useVenues();

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return 'sunny';
    if (desc.includes('cloud')) return 'cloudy';
    if (desc.includes('rain')) return 'rainy';
    if (desc.includes('snow')) return 'snow';
    if (desc.includes('thunder')) return 'thunderstorm';
    return 'partly-sunny';
  };

  const getWeatherColor = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return '#FFD700';
    if (desc.includes('cloud')) return '#87CEEB';
    if (desc.includes('rain')) return '#4682B4';
    if (desc.includes('snow')) return '#F0F8FF';
    return '#87CEEB';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>SpotSync</Text>
      <Text style={styles.subtitle}>Discover amazing places near you</Text>
    </View>
  );

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
      return (
        <View style={styles.locationWeatherCard}>
          <View style={styles.weatherHeader}>
            <View style={styles.locationSection}>
              <Ionicons name="location" size={14} color="#FFFFFF" />
              <Text style={styles.locationText}>{weather.city}</Text>
            </View>
            <Ionicons 
              name={getWeatherIcon(weather.description)} 
              size={20} 
              color={getWeatherColor(weather.description)} 
            />
          </View>
          
          <View style={styles.weatherMain}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperatureF}>{weather.temperatureFahrenheit}°F</Text>
              <Text style={styles.temperatureC}>{weather.temperatureCelsius}°C</Text>
            </View>
            <Text style={styles.weatherDescription}>{weather.description}</Text>
          </View>
        </View>
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
          <Text style={styles.sectionTitle}>Nearby Venues</Text>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Finding venues near you...</Text>
          </View>
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.venuesSection}>
          <Text style={styles.sectionTitle}>Nearby Venues</Text>
          <View style={styles.loadingCard}>
            <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.loadingText}>Please sign in to see venues</Text>
          </View>
        </View>
      );
    }

    if (venueError) {
      return (
        <View style={styles.venuesSection}>
          <Text style={styles.sectionTitle}>Nearby Venues</Text>
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{venueError}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.venuesSection}>
        <Text style={styles.sectionTitle}>
          Nearby Venues ({venues.length})
        </Text>
        
        {venues.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={24} color="#FFFFFF" />
            <Text style={styles.emptyText}>No venues found nearby</Text>
            <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
          </View>
        ) : (
          <View style={styles.venuesList}>
            {venues.slice(0, 10).map((venue, index) => {
              console.log('Venue card data:', {
                name: venue.name,
                rating: venue.rating,
                priceRange: venue.priceRange,
                distance: venue.distance
              });
              
              return (
                <TouchableOpacity key={venue.id} style={styles.venueCard}>
                  <View style={styles.venueHeader}>
                    <View style={styles.venueIconContainer}>
                      <Ionicons 
                        name="restaurant" 
                        size={20} 
                        color="#FFFFFF" 
                      />
                    </View>
                    <View style={styles.venueStats}>
                      {venue.rating && venue.rating > 0 && (
                        <View style={styles.venueRating}>
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{venue.rating}</Text>
                          </View>
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
                  
                  <Text style={styles.venueName}>{venue.name}</Text>
                  <Text style={styles.venueAddress}>{venue.address}</Text>
                  
                  <View style={styles.venueFooter}>
                    <View style={styles.distanceContainer}>
                      <Ionicons name="location-outline" size={12} color="#FFFFFF" />
                      <Text style={styles.distanceText}>
                        {(venue.distance * 0.621371).toFixed(1)} mi away
                      </Text>
                    </View>
                    <View style={styles.categoryContainer}>
                      <Text style={styles.categoryText}>{venue.category}</Text>
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
    </View>
  );
}

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
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  locationWeatherCard: {
    backgroundColor: 'rgba(135, 206, 235, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(135, 206, 235, 0.3)',
    shadowColor: '#87CEEB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  weatherMain: {
    // No specific styles for the main weather section, as it's a View
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align temperature and unit on the baseline
  },
  temperatureF: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  temperatureC: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  weatherDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    marginTop: 4,
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  errorCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 16,
    padding: 24,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  venueIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  venueStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueRating: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  priceContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  priceText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  venueAddress: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    lineHeight: 20,
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  distanceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  categoryContainer: {
    backgroundColor: 'rgba(100, 149, 237, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(100, 149, 237, 0.3)',
  },
  categoryText: {
    fontSize: 12,
    color: '#6495ED',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
}); 