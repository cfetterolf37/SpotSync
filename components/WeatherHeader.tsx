import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WeatherData } from '../lib/weather';

interface WeatherHeaderProps {
  weather?: WeatherData | null;
  onPress?: () => void;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({ weather, onPress }) => {
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

  if (!weather) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Ionicons name="location-outline" size={20} color="#8E8E93" />
            <Text style={styles.locationText}>Getting weather...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.weatherInfo}>
            <Ionicons 
              name={getWeatherIcon(weather) as any} 
              size={24} 
              color={getWeatherColor(weather)} 
            />
            <View style={styles.temperatureContainer}>
              <Text style={[styles.temperature, { color: getWeatherColor(weather) }]}>
                {weather.temperatureFahrenheit}°F
              </Text>
              <Text style={styles.description}>
                {weather.description}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{weather.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="speedometer-outline" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{weather.city}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temperatureContainer: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  detailsContainer: {
    alignItems: 'flex-end',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 8,
  },
}); 