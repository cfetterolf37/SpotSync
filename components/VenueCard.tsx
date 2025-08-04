import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Venue, venueService } from '../lib/venues';
import { WeatherData } from '../lib/weather';

interface VenueCardProps {
  venue: Venue;
  weather?: WeatherData;
  onPress: () => void;
  isSelected?: boolean;
}

const { width } = Dimensions.get('window');

export const VenueCard: React.FC<VenueCardProps> = ({ 
  venue, 
  weather, 
  onPress, 
  isSelected = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const getWeatherIcon = (weatherData: WeatherData) => {
    const iconMap: { [key: string]: string } = {
      '01d': 'sunny',
      '01n': 'moon',
      '02d': 'partly-sunny',
      '02n': 'partly-sunny-outline',
      '03d': 'cloud',
      '03n': 'cloud',
      '04d': 'cloudy',
      '04n': 'cloudy',
      '09d': 'rainy',
      '09n': 'rainy',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'thunderstorm',
      '11n': 'thunderstorm',
      '13d': 'snow',
      '13n': 'snow',
      '50d': 'water',
      '50n': 'water',
    };
    return iconMap[weatherData.icon] || 'partly-sunny';
  };

  const getWeatherColor = (weatherData: WeatherData) => {
    const temp = weatherData.temperatureFahrenheit;
    if (temp < 40) return '#4A90E2'; // Cold - Blue
    if (temp < 60) return '#7ED321'; // Cool - Green
    if (temp < 80) return '#F5A623'; // Warm - Orange
    return '#D0021B'; // Hot - Red
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(opacityAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, isSelected && styles.selected, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons 
              name="location" 
              size={16} 
              color="#8E8E93" 
              style={styles.locationIcon}
            />
            <Text style={styles.distance}>{venue.distance}km away</Text>
          </View>
          {venue.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>{venue.rating}</Text>
            </View>
          )}
        </View>

        {/* Venue Name */}
        <Text style={styles.venueName} numberOfLines={2}>
          {venue.name}
        </Text>

        {/* Category and Price */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryTag}>
            <Ionicons 
              name={venueService.getCategoryIcon(venue.category) as any} 
              size={14} 
              color="#007AFF" 
            />
            <Text style={styles.categoryText}>{venue.category}</Text>
          </View>
          {venue.priceRange && (
            <View style={styles.priceTag}>
              <Ionicons 
                name="card-outline" 
                size={14} 
                color="#34C759" 
              />
              <Text style={styles.priceText}>{venue.priceRange}</Text>
            </View>
          )}
        </View>

        {/* Address */}
        <Text style={styles.address} numberOfLines={1}>
          {venue.address}
        </Text>

        {/* Weather Integration */}
        {weather && (
          <View style={styles.weatherContainer}>
            <View style={styles.weatherInfo}>
              <Ionicons 
                name={getWeatherIcon(weather) as any} 
                size={16} 
                color={getWeatherColor(weather)} 
              />
              <Text style={[styles.temperature, { color: getWeatherColor(weather) }]}>
                {weather.temperatureFahrenheit}°F
              </Text>
            </View>
            <Text style={styles.weatherDescription}>
              {weather.description}
            </Text>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleExpanded}>
            <Ionicons name="information-circle-outline" size={16} color="#007AFF" />
            <Text style={styles.actionText}>
              {isExpanded ? 'Show Less' : 'View Details'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progressive Disclosure - Additional Info */}
        <Animated.View style={[styles.expandedInfo, { opacity: opacityAnim }]}>
          {venue.hours && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{venue.hours}</Text>
            </View>
          )}
          {venue.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{venue.phone}</Text>
            </View>
          )}
          {venue.website && (
            <View style={styles.infoRow}>
              <Ionicons name="globe-outline" size={14} color="#8E8E93" />
              <Text style={styles.infoText}>{venue.website}</Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  selected: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  distance: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 18,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperature: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
  },
  weatherDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'capitalize',
  },
  actionContainer: {
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  expandedInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
}); 