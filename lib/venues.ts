import { cacheService } from './cache';
import { rateLimiter } from './rateLimiter';

export interface Venue {
  id: string;
  name: string;
  address: string;
  category: string;
  rating?: number;
  priceRange?: string;
  distance: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  hours?: string;
  phone?: string;
  website?: string;
  description?: string;
  tags: string[];
}

export interface VenueFilters {
  category?: string;
  radius: number;
  priceRange?: string;
  minRating?: number;
  hasDeals?: boolean;
  sortBy?: 'distance' | 'rating' | 'name';
}

export interface VenueSearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  category?: string;
  limit?: number;
  minRating?: number;
  sortBy?: 'distance' | 'rating' | 'name';
}

class VenueService {
  private apiKey: string;
  private baseUrl = 'https://api.geoapify.com/v2/places';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Geoapify API key not found. Please add EXPO_PUBLIC_GEOAPIFY_API_KEY to your .env file');
    }
  }

  async searchVenues(params: VenueSearchParams): Promise<Venue[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Geoapify API key not configured');
      }

      // Check rate limiting
      const rateLimitKey = `venues-${params.latitude}-${params.longitude}`;
      if (!rateLimiter.canMakeRequest(rateLimitKey, 3, 60 * 1000)) { // 3 requests per minute
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Check cache first
      const cacheKey = `venues-${params.latitude}-${params.longitude}-${params.radius}-${params.category || 'all'}`;
      const cachedData = cacheService.get<Venue[]>(cacheKey);
      if (cachedData) {
        console.log('VenueService: Returning cached data');
        return cachedData;
      }

      const { latitude, longitude, radius, category, limit = 20 } = params;
      
      // Build the API URL with required categories parameter
      let url = `${this.baseUrl}?filter=circle:${longitude},${latitude},${radius * 1000}&limit=${limit}&apiKey=${this.apiKey}`;
      
      // Add category filter if specified, otherwise use general categories
      if (category) {
        url += `&categories=${category}`;
      } else {
        // Use general venue categories if no specific category is provided
        url += `&categories=catering`;
      }

      console.log('VenueService: Making API call to:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('VenueService: API response error:', response.status, errorText);
        throw new Error(`Venue API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.features || !Array.isArray(data.features)) {
        console.log('VenueService: No features found in response');
        return [];
      }
      
      let venues = data.features.map((feature: any) => this.parseVenue(feature, latitude, longitude));
      
      // Filter and sort venues
      venues = this.filterAndSortVenues(venues, params);
      
      console.log('VenueService: Successfully processed', venues.length, 'venues');

      // Cache the result for 10 minutes (venues change less frequently)
      cacheService.set(cacheKey, venues, 10 * 60 * 1000);
      
      return venues;
    } catch (error) {
      console.error('VenueService: Error fetching venues:', error);
      return [];
    }
  }

  private filterAndSortVenues(venues: Venue[], params: VenueSearchParams): Venue[] {
    let filteredVenues = venues;

    // Filter by rating if specified
    if (params.minRating) {
      filteredVenues = filteredVenues.filter(venue => 
        venue.rating && venue.rating >= params.minRating!
      );
    }

    // Sort venues
    if (params.sortBy) {
      filteredVenues.sort((a, b) => {
        switch (params.sortBy) {
          case 'distance':
            return a.distance - b.distance;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    } else {
      // Default sort by distance
      filteredVenues.sort((a, b) => a.distance - b.distance);
    }

    return filteredVenues;
  }

  private parseVenue(feature: any, userLat: number, userLng: number): Venue {
    const properties = feature.properties || {};
    const geometry = feature.geometry;
    
    // Calculate distance from user
    const distance = this.calculateDistance(
      userLat, userLng,
      geometry.coordinates[1], geometry.coordinates[0]
    );

    // Safely handle categories with multiple fallbacks
    let categoryArray: string[] = [];
    let primaryCategory = 'venue';
    
    if (properties.categories && typeof properties.categories === 'string') {
      categoryArray = properties.categories.split(',').map((cat: string) => cat.trim());
      primaryCategory = categoryArray.length > 0 ? categoryArray[0] : 'venue';
    }

    return {
      id: properties.place_id || `venue-${Date.now()}`,
      name: properties.name || 'Unknown Venue',
      address: properties.formatted || properties.address_line1 || '',
      category: primaryCategory,
      rating: properties.rating,
      priceRange: properties.price,
      distance,
      coordinates: {
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      },
      hours: properties.opening_hours,
      phone: properties.phone,
      website: properties.website,
      description: properties.description,
      tags: categoryArray,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'restaurant': 'restaurant',
      'bar': 'wine',
      'cafe': 'cafe',
      'entertainment': 'game-controller',
      'shopping': 'bag',
      'sports': 'football',
      'health': 'fitness',
      'beauty': 'cut',
      'education': 'school',
      'transport': 'car',
      'finance': 'card',
      'government': 'business',
      'default': 'location',
    };

    const normalizedCategory = category.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (normalizedCategory.includes(key)) {
        return icon;
      }
    }
    return iconMap.default;
  }

  getPriceRangeIcon(priceRange?: string): string {
    if (!priceRange) return 'help-circle-outline';
    
    const priceMap: { [key: string]: string } = {
      'budget': 'cash-outline',
      'moderate': 'card-outline',
      'expensive': 'diamond-outline',
      'luxury': 'trophy-outline',
    };

    return priceMap[priceRange.toLowerCase()] || 'help-circle-outline';
  }
}

export const venueService = new VenueService(); 