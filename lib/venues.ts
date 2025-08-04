import { cacheService } from './cache';
import { rateLimiter } from './rateLimiter';

export interface Venue {
  id: string;
  name: string;
  address: string;
  category: string;
  distance: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  hours?: string;
  phone?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
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
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
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
        
        // Convert miles to kilometers for the API call
        const radiusInKm = radius * 1.60934;
        
        // Build the API URL with required categories parameter
        let url = `${this.baseUrl}?filter=circle:${longitude},${latitude},${radiusInKm * 1000}&limit=${limit}&apiKey=${this.apiKey}`;
        
        // Add category filter if specified, otherwise use all categories
        if (category && category.trim() !== '') {
          url += `&categories=${category}`;
        } else {
          // Use all categories if no specific category is provided
          url += `&categories=accommodation,activity,airport,commercial,catering,emergency,education,childcare,entertainment,healthcare,heritage,highway,leisure,man_made,natural,national_park,office,parking,pet,power,production,railway,rental,service,tourism,religion,camping,amenity,beach,adult,building,ski,sport,public_transport,administrative,postal_code,political,low_emission_zone,populated_place`;
        }

        console.log('VenueService: Making API call to:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('VenueService: API response error:', response.status, errorText);
          
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
          } else if (response.status === 400) {
            throw new Error('Invalid search parameters. Please check your location and try again.');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again in a moment.');
          } else {
            throw new Error(`Venue API error: ${response.status} - ${errorText}`);
          }
        }

        const data = await response.json();
        
        if (!data.features || !Array.isArray(data.features)) {
          console.log('VenueService: No features found in response');
          return [];
        }

        // Parse basic venue data
        let venues = data.features.map((feature: any) => this.parseVenue(feature, latitude, longitude));
        venues = this.filterAndSortVenues(venues, params);

        // Fetch detailed information for each venue in parallel
        console.log('VenueService: Fetching details for', venues.length, 'venues');
        const venuesWithDetails = await this.fetchVenueDetails(venues);

        console.log('VenueService: Successfully processed', venuesWithDetails.length, 'venues with details');
        cacheService.set(cacheKey, venuesWithDetails, 10 * 60 * 1000); // Cache for 10 minutes
        return venuesWithDetails;
      } catch (error) {
        attempt++;
        console.error(`VenueService: Error fetching venues (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt === maxRetries) {
          console.error('VenueService: Max retries reached, returning empty array');
          return [];
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return [];
  }

  private filterAndSortVenues(venues: Venue[], params: VenueSearchParams): Venue[] {
    let filteredVenues = venues;

    // Sort venues
    if (params.sortBy) {
      filteredVenues.sort((a, b) => {
        switch (params.sortBy) {
          case 'distance':
            return a.distance - b.distance;
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
    let categoryArray: string[] = properties.categories;

    return {
      id: properties.place_id || `venue-${Date.now()}`,
      name: properties.name || 'Unknown Venue',
      address: '',
      category: categoryArray[0] || 'venue',
      distance,
      coordinates: {
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      },
      tags: categoryArray,
    };
  }

  private async fetchVenueDetails(venues: Venue[]): Promise<Venue[]> {
    try {
      // Create promises for fetching details for each venue
      const detailPromises = venues.map(async (venue) => {
        try {
          // Check cache for venue details
          const detailCacheKey = `venue-details-${venue.id}`;
          const cachedDetails = cacheService.get<any>(detailCacheKey);
          
          if (cachedDetails) {
            console.log('VenueService: Returning cached details for', venue.name);
            return this.mergeVenueDetails(venue, cachedDetails);
          }

          // Fetch details from Geoapify Places Details API
          const detailsUrl = `https://api.geoapify.com/v2/place-details?id=${venue.id}&features=details,details.population,details.names&apiKey=${this.apiKey}`;
          
          const response = await fetch(detailsUrl);
          if (!response.ok) {
            console.warn('VenueService: Failed to fetch details for', venue.name);
            return venue; // Return venue without details if details fetch fails
          }

          const detailsData = await response.json();
          
          if (detailsData.features && detailsData.features.length > 0) {
            const details = detailsData.features[0].properties;
            
            // Cache the details for 30 minutes
            cacheService.set(detailCacheKey, details, 30 * 60 * 1000);
            
            return this.mergeVenueDetails(venue, details);
          }
          
          return venue;
        } catch (error) {
          console.warn('VenueService: Error fetching details for', venue.name, error);
          return venue; // Return venue without details if there's an error
        }
      });

      // Wait for all detail requests to complete
      const venuesWithDetails = await Promise.all(detailPromises);
      return venuesWithDetails;
    } catch (error) {
      console.error('VenueService: Error fetching venue details:', error);
      return venues; // Return venues without details if there's a general error
    }
  }

  private mergeVenueDetails(venue: Venue, details: any): Venue {
    console.log(details.datasource.raw['contact:facebook'])
    return {
      ...venue,
      address: details.address_line2,
      hours: details.opening_hours,
      phone: details.contact.phone,
      website: details.datasource.raw['website'],
      facebook: details.datasource.raw['contact:facebook'],
      twitter: details.datasource.raw['contact:twitter'],
      instagram: details.datasource.raw['contact:instagram'],
      tags: venue.tags,
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
      // Accommodation & Travel
      'accommodation': 'bed',
      'hotel': 'bed',
      'motel': 'bed',
      'resort': 'umbrella',
      
      // Activity & Entertainment
      'activity': 'game-controller',
      'entertainment': 'game-controller',
      'leisure': 'game-controller',
      'tourism': 'camera',
      
      // Transportation
      'airport': 'airplane',
      'public_transport': 'bus',
      'railway': 'train',
      'highway': 'car',
      'parking': 'car',
      
      // Food & Dining
      'catering': 'restaurant',
      'restaurant': 'restaurant',
      'bar': 'wine',
      'cafe': 'cafe',
      
      // Shopping & Commercial
      'commercial': 'bag',
      'shopping': 'bag',
      'retail': 'bag',
      
      // Sports & Recreation
      'sport': 'football',
      'sports': 'football',
      'ski': 'snow',
      'beach': 'umbrella',
      'camping': 'tent',
      
      // Health & Wellness
      'healthcare': 'medical',
      'health': 'medical',
      'fitness': 'fitness',
      
      // Education & Childcare
      'education': 'school',
      'childcare': 'people',
      
      // Services
      'service': 'construct',
      'amenity': 'construct',
      'rental': 'key',
      
      // Business & Office
      'office': 'business',
      'administrative': 'business',
      'government': 'business',
      
      // Emergency & Safety
      'emergency': 'warning',
      
      // Cultural & Heritage
      'heritage': 'library',
      'religion': 'church',
      'national_park': 'leaf',
      
      // Infrastructure
      'man_made': 'construct',
      'natural': 'leaf',
      'power': 'flash',
      'production': 'construct',
      
      // Pets & Animals
      'pet': 'paw',
      
      // Postal & Political
      'postal_code': 'mail',
      'political': 'flag',
      
      // Environmental
      'low_emission_zone': 'leaf',
      
      // Population
      'populated_place': 'people',
      
      // Building & Construction
      'building': 'business',
      
      // Adult Entertainment
      'adult': 'heart',
      
      // Default
      'default': 'location',
    };

    const normalizedCategory = category.toLowerCase();
    
    // First try exact matches
    if (iconMap[normalizedCategory]) {
      return iconMap[normalizedCategory];
    }
    
    // Then try partial matches
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