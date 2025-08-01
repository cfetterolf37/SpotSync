import { cacheService } from './cache';
import { performanceMonitor } from './performance';
import { rateLimiter } from './rateLimiter';

export interface WeatherData {
  temperature: number;
  temperatureCelsius: number;
  temperatureFahrenheit: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenWeatherMap API key not found. Please add EXPO_PUBLIC_OPENWEATHER_API_KEY to your .env file');
    }
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
    return performanceMonitor.monitorApiCall(
      'weather-api-call',
      async () => {
        try {
          if (!this.apiKey) {
            throw new Error('OpenWeatherMap API key not configured');
          }

          // Check rate limiting
          const rateLimitKey = `weather-${latitude}-${longitude}`;
          if (!rateLimiter.canMakeRequest(rateLimitKey, 5, 60 * 1000)) { // 5 requests per minute
            throw new Error('Rate limit exceeded. Please try again later.');
          }

          // Check cache first
          const cacheKey = `weather-${latitude}-${longitude}`;
          const cachedData = cacheService.get<WeatherData>(cacheKey);
          if (cachedData) {
            console.log('WeatherService: Returning cached data');
            return cachedData;
          }

          // Fetch temperature in Celsius (metric)
          const response = await fetch(
            `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
          );

          if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
          }

          const data = await response.json();
          const tempCelsius = Math.round(data.main.temp);
          const tempFahrenheit = Math.round((tempCelsius * 9/5) + 32);

          const weatherData: WeatherData = {
            temperature: tempFahrenheit, // Primary display in Fahrenheit
            temperatureCelsius: tempCelsius,
            temperatureFahrenheit: tempFahrenheit,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            city: data.name,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          };

          // Cache the result for 5 minutes
          cacheService.set(cacheKey, weatherData, 5 * 60 * 1000);

          return weatherData;
        } catch (error) {
          console.error('Error fetching weather data:', error);
          return null;
        }
      },
      { latitude, longitude }
    );
  }

  getWeatherIcon(iconCode: string): string {
    // Map OpenWeatherMap icon codes to Ionicons
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

    return iconMap[iconCode] || 'partly-sunny';
  }
}

export const weatherService = new WeatherService(); 