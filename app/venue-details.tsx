import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useVenues } from '../contexts/VenueContext';

const { width } = Dimensions.get('window');

export default function VenueDetailsScreen() {
  const router = useRouter();
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { venues } = useVenues();

  const venue = useMemo(() => {
    return venues.find(v => v.id === venueId);
  }, [venues, venueId]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleCall = useCallback(() => {
    if (venue?.phone) {
      // In a real app, you'd use Linking to make the call
      console.log('Calling:', venue.phone);
    }
  }, [venue]);

  const handleNavigate = useCallback(() => {
    if (venue?.coordinates) {
      // In a real app, you'd use Linking to open maps
      console.log('Navigating to:', venue.coordinates);
    }
  }, [venue]);

  const handleWebsite = useCallback(() => {
    if (venue?.website) {
      // In a real app, you'd use Linking to open the website
      console.log('Opening website:', venue.website);
    }
  }, [venue]);

  if (!venue) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Venue Not Found</Text>
          <Text style={styles.errorText}>The venue you&apos;re looking for doesn&apos;t exist or has been removed.</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Venue Details</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.venueIconLarge}>
            <Ionicons name="restaurant" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.venueName}>{venue.name}</Text>
          <Text style={styles.venueCategory}>{venue.category}</Text>
          
          {/* Rating and Price */}
          <View style={styles.venueStats}>
            {venue.rating && venue.rating > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{venue.rating}</Text>
              </View>
            )}
            {venue.priceRange && venue.priceRange !== '' && (
              <View style={styles.priceBadge}>
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

        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#87CEEB" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>{venue.address}</Text>
            <View style={styles.distanceInfo}>
              <Ionicons name="navigate-outline" size={16} color="#87CEEB" />
              <Text style={styles.distanceText}>
                {(venue.distance * 0.621371).toFixed(1)} miles away
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        {(venue.phone || venue.website) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call-outline" size={20} color="#87CEEB" />
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>
            <View style={styles.contactCard}>
              {venue.phone && (
                <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                  <Ionicons name="call" size={20} color="#4CAF50" />
                  <Text style={styles.contactText}>{venue.phone}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#87CEEB" />
                </TouchableOpacity>
              )}
              {venue.website && (
                <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                  <Ionicons name="globe" size={20} color="#2196F3" />
                  <Text style={styles.contactText}>Visit Website</Text>
                  <Ionicons name="chevron-forward" size={16} color="#87CEEB" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Hours Section */}
        {venue.hours && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#87CEEB" />
              <Text style={styles.sectionTitle}>Hours</Text>
            </View>
            <View style={styles.hoursCard}>
              <Text style={styles.hoursText}>{venue.hours}</Text>
            </View>
          </View>
        )}

        {/* Description Section */}
        {venue.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color="#87CEEB" />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{venue.description}</Text>
            </View>
          </View>
        )}

        {/* Tags Section */}
        {venue.tags && venue.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag-outline" size={20} color="#87CEEB" />
              <Text style={styles.sectionTitle}>Tags</Text>
            </View>
            <View style={styles.tagsContainer}>
              {venue.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleNavigate}>
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Get Directions</Text>
          </TouchableOpacity>
          
          {venue.phone && (
            <TouchableOpacity style={styles.secondaryAction} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#4CAF50" />
              <Text style={styles.secondaryActionText}>Call Now</Text>
            </TouchableOpacity>
          )}
        </View>
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
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  venueIconLarge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  venueName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  venueCategory: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  venueStats: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.4)',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  priceBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  priceText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addressText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 12,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  hoursCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hoursText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  descriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(135, 206, 235, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(135, 206, 235, 0.4)',
  },
  tagText: {
    fontSize: 14,
    color: '#87CEEB',
    fontWeight: '500',
  },
  actionSection: {
    marginTop: 20,
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#87CEEB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  secondaryAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
}); 