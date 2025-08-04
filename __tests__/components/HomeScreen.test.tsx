import { render, screen } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../../app/(tabs)/index';
import { AuthProvider } from '../../contexts/AuthContext';
import { VenueProvider } from '../../contexts/VenueContext';
import { WeatherProvider } from '../../contexts/WeatherContext';

// Mock the components and services
jest.mock('../../components/FilterModal', () => 'FilterModal');
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockWeather = {
  temperatureFahrenheit: 75,
  temperatureCelsius: 24,
  description: 'clear sky',
  city: 'San Francisco',
  humidity: 65,
  windSpeed: 12,
};

const mockVenues = [
  {
    id: '1',
    name: 'Test Restaurant',
    address: '123 Test St',
    category: 'catering',
    rating: 4.5,
    priceRange: '2',
    distance: 1.2,
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <WeatherProvider>
        <VenueProvider>
          {component}
        </VenueProvider>
      </WeatherProvider>
    </AuthProvider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<HomeScreen />);
    expect(screen.getByText('SpotSync')).toBeTruthy();
  });

  it('displays weather information when available', () => {
    // Mock the weather context to return weather data
    jest.spyOn(require('../../contexts/WeatherContext'), 'useWeather').mockReturnValue({
      weather: mockWeather,
      loading: false,
      error: null,
    });

    renderWithProviders(<HomeScreen />);
    expect(screen.getByText('75°F')).toBeTruthy();
    expect(screen.getByText('24°C')).toBeTruthy();
  });

  it('displays venues when available', () => {
    // Mock the venue context to return venue data
    jest.spyOn(require('../../contexts/VenueContext'), 'useVenues').mockReturnValue({
      venues: mockVenues,
      loading: false,
      error: null,
      searchVenues: jest.fn(),
    });

    renderWithProviders(<HomeScreen />);
    expect(screen.getByText('Test Restaurant')).toBeTruthy();
  });

  it('shows loading state when venues are loading', () => {
    jest.spyOn(require('../../contexts/VenueContext'), 'useVenues').mockReturnValue({
      venues: [],
      loading: true,
      error: null,
      searchVenues: jest.fn(),
    });

    renderWithProviders(<HomeScreen />);
    expect(screen.getByText('Finding venues near you...')).toBeTruthy();
  });

  it('shows error state when venues fail to load', () => {
    jest.spyOn(require('../../contexts/VenueContext'), 'useVenues').mockReturnValue({
      venues: [],
      loading: false,
      error: 'Failed to load venues',
      searchVenues: jest.fn(),
    });

    renderWithProviders(<HomeScreen />);
    expect(screen.getByText('Failed to load venues')).toBeTruthy();
  });

  it('has accessibility labels for interactive elements', () => {
    renderWithProviders(<HomeScreen />);
    
    const filterButton = screen.getByLabelText('Open filters');
    expect(filterButton).toBeTruthy();
  });
}); 