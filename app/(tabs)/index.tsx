import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useWeather } from '../../contexts/WeatherContext';
import { weatherService } from '../../lib/weather';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const { weather, location, loading: weatherLoading, error: weatherError, refreshWeather } = useWeather();

  const handleRefreshWeather = () => {
    refreshWeather();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#667eea" />
            </View>
            <View style={styles.userText}>
              <Text style={styles.welcomeText}>
                Welcome back, {user?.user_metadata?.full_name || 'User'}!
              </Text>
            </View>
          </View>

          {/* Weather Section */}
          <View style={styles.weatherSection}>
            <View style={styles.weatherHeader}>
              <Ionicons name="location-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.locationText}>
                {location || 'Loading location...'}
              </Text>
              <TouchableOpacity onPress={handleRefreshWeather} style={styles.refreshButton}>
                <Ionicons name="refresh" size={16} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </View>

            {weatherLoading ? (
              <View style={styles.weatherLoading}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.weatherLoadingText}>Loading weather...</Text>
              </View>
            ) : weatherError ? (
              <View style={styles.weatherError}>
                <Ionicons name="warning-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.weatherErrorText}>Weather unavailable</Text>
              </View>
            ) : weather ? (
              <View style={styles.weatherInfo}>
                <View style={styles.weatherMain}>
                  <Ionicons 
                    name={weatherService.getWeatherIcon(weather.icon) as any} 
                    size={32} 
                    color="#fff" 
                  />
                  <View style={styles.temperatureContainer}>
                    <Text style={styles.temperature}>{weather.temperature}°F</Text>
                    <Text style={styles.temperatureCelsius}>{weather.temperatureCelsius}°C</Text>
                    <Text style={styles.weatherDescription}>{weather.description}</Text>
                  </View>
                </View>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetail}>
                    <Ionicons name="water-outline" size={14} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetail}>
                    <Ionicons name="speedometer-outline" size={14} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.weatherDetailText}>{weather.windSpeed} km/h</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.statGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="musical-notes" size={24} color="#fff" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Songs Synced</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#34C759', '#30D158']}
            style={styles.statGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="time" size={24} color="#fff" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Hours Listened</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['#FF3B30', '#FF6B6B']}
            style={styles.statGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="heart" size={24} color="#fff" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle-outline" size={32} color="#fff" />
              <Text style={styles.actionTitle}>Add Song</Text>
              <Text style={styles.actionDescription}>Sync a new song</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={['#34C759', '#30D158']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="list-outline" size={32} color="#fff" />
              <Text style={styles.actionTitle}>My Library</Text>
              <Text style={styles.actionDescription}>View your songs</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={['#FF9500', '#FFB340']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="settings-outline" size={32} color="#fff" />
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionDescription}>Configure app</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={['#AF52DE', '#C644FC']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="help-circle-outline" size={32} color="#fff" />
              <Text style={styles.actionTitle}>Help</Text>
              <Text style={styles.actionDescription}>Get support</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.activityCard}>
          <View style={styles.activityIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Account created successfully</Text>
            <Text style={styles.activityTime}>Just now</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerContent: {
    marginTop: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weatherSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  weatherLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  weatherLoadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  weatherError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  weatherErrorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureContainer: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  temperatureCelsius: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  weatherDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  weatherDetails: {
    alignItems: 'flex-end',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weatherDetailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 72) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
}); 