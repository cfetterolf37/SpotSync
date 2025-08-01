import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useVenues } from '../../contexts/VenueContext';
import { useWeather } from '../../contexts/WeatherContext';

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const { weather, loading: weatherLoading, error: weatherError } = useWeather();
  const { venues, loading: venueLoading, error: venueError } = useVenues();

  const renderWeatherSection = () => {
    if (authLoading) {
      return (
        <View style={styles.weatherInfo}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.weatherText}>Checking authentication...</Text>
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherText}>Please sign in to see weather</Text>
        </View>
      );
    }

    if (weatherLoading) {
      return (
        <View style={styles.weatherInfo}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.weatherText}>Getting weather...</Text>
        </View>
      );
    }

    if (weatherError) {
      return (
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherErrorText}>{weatherError}</Text>
        </View>
      );
    }

    if (weather) {
      return (
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherText}>
            {weather.temperatureFahrenheit}°F - {weather.description}
          </Text>
          <Text style={styles.locationText}>{weather.city}</Text>
        </View>
      );
    }

    return (
      <View style={styles.weatherInfo}>
        <Text style={styles.weatherText}>Weather unavailable</Text>
      </View>
    );
  };

  const renderVenuesSection = () => {
    if (authLoading) {
      return (
        <View style={styles.venuesInfo}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.venuesText}>Checking authentication...</Text>
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.venuesInfo}>
          <Text style={styles.venuesText}>Please sign in to see venues</Text>
        </View>
      );
    }

    if (venueLoading) {
      return (
        <View style={styles.venuesInfo}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.venuesText}>Finding venues near you...</Text>
        </View>
      );
    }

    if (venueError) {
      return (
        <View style={styles.venuesInfo}>
          <Text style={styles.venuesErrorText}>{venueError}</Text>
        </View>
      );
    }

    if (venues.length > 0) {
      return (
        <View style={styles.venuesInfo}>
          <Text style={styles.venuesText}>
            Found {venues.length} venues nearby
          </Text>
          <Text style={styles.venuesSubtext}>
            {venues.slice(0, 3).map(v => v.name).join(', ')}
            {venues.length > 3 ? '...' : ''}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.venuesInfo}>
        <Text style={styles.venuesText}>No venues found nearby</Text>
      </View>
    );
  };

  const renderStatusMessage = () => {
    if (authLoading) {
      return "Loading authentication...";
    }
    if (!user) {
      return "Please sign in";
    }
    if (weatherLoading || venueLoading) {
      return "Loading data...";
    }
    if (weather && venues.length > 0) {
      return "App is working! 🎉";
    }
    return "Ready to use!";
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />
      
      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>SpotSync</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.user_metadata?.full_name || 'User'}!</Text>
        
        {renderWeatherSection()}
        {renderVenuesSection()}
        
        <Text style={styles.status}>{renderStatusMessage()}</Text>
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
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  weatherInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  weatherText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5,
  },
  weatherErrorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 5,
  },
  venuesInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  venuesText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5,
  },
  venuesErrorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  venuesSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 5,
  },
  status: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
}); 