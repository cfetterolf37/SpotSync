import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AddDealModal, DailyDealCard } from '../components';
import { useDailyDeals } from '../contexts/DailyDealsContext';
import { useVenues } from '../contexts/VenueContext';
import { venueService } from '../lib/venues';

const { width } = Dimensions.get('window');

export default function VenueDetailsScreen() {
  const router = useRouter();
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const { venues } = useVenues();
  const { deals, loading: dealsLoading, loadVenueDeals } = useDailyDeals();
  const [showAddDeal, setShowAddDeal] = useState(false);

  const venue = useMemo(() => {
    console.log('Looking for venue with ID:', venueId);
    console.log('Available venues:', venues.map(v => ({ id: v.id, name: v.name })));
    const foundVenue = venues.find(v => v.id === venueId);
    console.log('Found venue:', foundVenue);
    return foundVenue;
  }, [venues, venueId]);

  // Load deals when venue changes
  useEffect(() => {
    if (venueId) {
      console.log('Loading deals for venue ID:', venueId);
      loadVenueDeals(venueId);
    }
  }, [venueId, loadVenueDeals]);

  // Debug: Log deals when they change
  useEffect(() => {
    console.log('Deals updated:', deals);
  }, [deals]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);







  const handleOpenMaps = useCallback(() => {
    if (venue?.coordinates) {
      const { latitude, longitude } = venue.coordinates;
      const url = `https://maps.apple.com/?q=${encodeURIComponent(venue.name)}&ll=${latitude},${longitude}`;
      
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps
          const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(venue.name)}&ll=${latitude},${longitude}`;
          Linking.openURL(googleMapsUrl);
        }
      }).catch((error) => {
        console.error('Error opening maps:', error);
      });
    }
  }, [venue]);

  const handleOpenLink = useCallback((url: string, type: string) => {
    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.error(`Cannot open ${type} link:`, url);
        }
      }).catch((error) => {
        console.error(`Error opening ${type} link:`, error);
      });
    }
  }, []);

  const handleCall = useCallback(() => {
    if (venue?.phone) {
      const phoneUrl = `tel:${venue.phone.replace(/\s/g, '')}`;
      Linking.openURL(phoneUrl);
    }
  }, [venue]);

  // Format hours for professional display
  const formatHours = useCallback((hoursString: string) => {
    if (!hoursString) return [];
    
    const dayMap: { [key: string]: string } = {
      'Mo': 'Monday',
      'Tu': 'Tuesday', 
      'We': 'Wednesday',
      'Th': 'Thursday',
      'Fr': 'Friday',
      'Sa': 'Saturday',
      'Su': 'Sunday',
    };

    const formatTime = (hour: string, minute: string) => {
      const hourNum = parseInt(hour);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
      return `${displayHour}:${minute} ${ampm}`;
    };

    const formatDayRange = (startDay: string, endDay: string) => {
      const start = dayMap[startDay] || startDay;
      const end = dayMap[endDay] || endDay;
      return start === end ? start : `${start}-${end}`;
    };

    // Split by semicolon to handle multiple schedules
    const schedules = hoursString.split(';').map(s => s.trim()).filter(s => s);
    
    return schedules.map(schedule => {
      // Pattern: "Mo-Tu 07:00-23:00" or "We 07:00-24:00"
      const match = schedule.match(/^([A-Za-z]{2})(?:-([A-Za-z]{2}))?\s+(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
      
      if (match) {
        const startDay = match[1];
        const endDay = match[2] || startDay; // If no end day, use start day
        const startHour = match[3];
        const startMinute = match[4];
        const endHour = match[5];
        const endMinute = match[6];
        
        const days = formatDayRange(startDay, endDay);
        const startTime = formatTime(startHour, startMinute);
        const endTime = formatTime(endHour, endMinute);
        
        return { days, hours: `${startTime} - ${endTime}` };
      }
      
      // Fallback for unparseable formats
      return { days: 'Hours', hours: schedule };
    });
  }, []);

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
      
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Modern Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient 
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']} 
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.venueIconContainer}>
              <Ionicons name={venueService.getCategoryIcon(venue.category) as any} size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.venueName}>{venue.name}</Text>
            <Text style={styles.venueCategory}>{venue.category}</Text>
            
            {/* Modern Stats Row */}
            <View style={styles.modernStats}>
              {venue.rating && venue.rating > 0 && (
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statText}>{venue.rating.toFixed(1)}</Text>
                </View>
              )}
              {venue.priceRange && venue.priceRange !== '' && (
                <View style={styles.statItem}>
                  <Ionicons name="cash-outline" size={16} color="#4CAF50" />
                  <Text style={styles.statText}>
                    {venue.priceRange === '1' ? '$' : 
                     venue.priceRange === '2' ? '$$' : 
                     venue.priceRange === '3' ? '$$$' : 
                     venue.priceRange === '4' ? '$$$$' : venue.priceRange}
                  </Text>
                </View>
              )}
              <View style={styles.statItem}>
                <Ionicons name="location-outline" size={16} color="#87CEEB" />
                <Text style={styles.statText}>{(venue.distance * 0.621371).toFixed(1)} mi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleOpenMaps}>
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Directions</Text>
          </TouchableOpacity>
          
          {venue.phone && (
            <TouchableOpacity style={styles.secondaryAction} onPress={handleCall}>
              <Ionicons name="call" size={20} color="#4CAF50" />
              <Text style={styles.secondaryActionText}>Call</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Social Media Links */}
        {(venue.facebook || venue.twitter || venue.instagram) && (
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Follow Us</Text>
            <View style={styles.socialLinks}>
              {venue.facebook && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(venue.facebook!, 'Facebook')}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
              )}
              {venue.twitter && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(venue.twitter!, 'Twitter')}
                >
                  <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                </TouchableOpacity>
              )}
              {venue.instagram && (
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleOpenLink(venue.instagram!, 'Instagram')}
                >
                  <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#87CEEB" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>{venue.address}</Text>
            <TouchableOpacity 
              style={styles.distanceInfo}
              onPress={handleOpenMaps}
              accessibilityLabel="Open directions to venue"
              accessibilityHint="Tap to open maps with directions to this venue"
              accessibilityRole="button"
            >
              <Ionicons name="location-outline" size={16} color="#87CEEB" />
              <Text style={styles.distanceText}>
                {(venue.distance * 0.621371).toFixed(1)} miles away
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Links Section */}
        {(venue.phone || venue.website) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="link-outline" size={20} color="#87CEEB" />
              <Text style={styles.sectionTitle}>Contact & Links</Text>
            </View>
            <View style={styles.contactLinksCard}>
              {venue.phone && (
                <TouchableOpacity 
                  style={styles.contactLink}
                  onPress={() => handleCall()}
                  accessibilityLabel="Call venue"
                  accessibilityHint="Tap to call this venue"
                  accessibilityRole="button"
                >
                  <View style={styles.contactLinkIcon}>
                    <Ionicons name="call" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.contactLinkContent}>
                    <Text style={styles.contactLinkLabel}>Phone</Text>
                    <Text style={styles.contactLinkValue}>{venue.phone}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              )}

              {venue.website && (
                <TouchableOpacity 
                  style={styles.contactLink}
                  onPress={() => handleOpenLink(venue.website!, 'website')}
                  accessibilityLabel="Visit website"
                  accessibilityHint="Tap to open the venue's website"
                  accessibilityRole="button"
                >
                  <View style={styles.contactLinkIcon}>
                    <Ionicons name="globe" size={20} color="#2196F3" />
                  </View>
                  <View style={styles.contactLinkContent}>
                    <Text style={styles.contactLinkLabel}>Website</Text>
                    <Text style={styles.contactLinkValue} numberOfLines={1}>
                      {venue.website.replace(/^https?:\/\//, '')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              )}

              {venue.facebook && (
                <TouchableOpacity 
                  style={styles.contactLink}
                  onPress={() => handleOpenLink(venue.facebook!, 'Facebook')}
                  accessibilityLabel="Visit Facebook page"
                  accessibilityHint="Tap to open the venue's Facebook page"
                  accessibilityRole="button"
                >
                  <View style={styles.contactLinkIcon}>
                    <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                  </View>
                  <View style={styles.contactLinkContent}>
                    <Text style={styles.contactLinkLabel}>Facebook</Text>
                    <Text style={styles.contactLinkValue} numberOfLines={1}>
                      {venue.facebook.replace(/^https?:\/\//, '')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              )}

              {venue.twitter && (
                <TouchableOpacity 
                  style={styles.contactLink}
                  onPress={() => handleOpenLink(venue.twitter!, 'Twitter')}
                  accessibilityLabel="Visit Twitter page"
                  accessibilityHint="Tap to open the venue's Twitter page"
                  accessibilityRole="button"
                >
                  <View style={styles.contactLinkIcon}>
                    <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                  </View>
                  <View style={styles.contactLinkContent}>
                    <Text style={styles.contactLinkLabel}>Twitter</Text>
                    <Text style={styles.contactLinkValue} numberOfLines={1}>
                      {venue.twitter.replace(/^https?:\/\//, '')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
                </TouchableOpacity>
              )}

              {venue.instagram && (
                <TouchableOpacity 
                  style={styles.contactLink}
                  onPress={() => handleOpenLink(venue.instagram!, 'Instagram')}
                  accessibilityLabel="Visit Instagram page"
                  accessibilityHint="Tap to open the venue's Instagram page"
                  accessibilityRole="button"
                >
                  <View style={styles.contactLinkIcon}>
                    <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                  </View>
                  <View style={styles.contactLinkContent}>
                    <Text style={styles.contactLinkLabel}>Instagram</Text>
                    <Text style={styles.contactLinkValue} numberOfLines={1}>
                      {venue.instagram.replace(/^https?:\/\//, '')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
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
              {formatHours(venue.hours).map((schedule, index, array) => (
                <View 
                  key={index} 
                  style={[
                    styles.hoursRow,
                    index === array.length - 1 && styles.hoursRowLast
                  ]}
                >
                  <View style={styles.hoursDayContainer}>
                    <Ionicons name="calendar-outline" size={16} color="#87CEEB" />
                    <Text style={styles.hoursDayText}>{schedule.days}</Text>
                  </View>
                  <View style={styles.hoursTimeContainer}>
                    <Ionicons name="time-outline" size={16} color="#4CAF50" />
                    <Text style={styles.hoursTimeText}>{schedule.hours}</Text>
                  </View>
                </View>
              ))}
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

        {/* Daily Deals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color="#87CEEB" />
            <Text style={styles.sectionTitle}>Daily Deals</Text>
            <TouchableOpacity 
              style={styles.addDealButton}
              onPress={() => setShowAddDeal(true)}
            >
              <Ionicons name="add" size={20} color="#87CEEB" />
            </TouchableOpacity>
          </View>
          
          {dealsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading deals...</Text>
            </View>
          ) : deals.length > 0 ? (
            <View style={styles.dealsContainer}>
              {deals.map((deal) => (
                <View key={deal.id}>
                  <DailyDealCard deal={deal} />
                  {!deal.is_verified && (
                    <View style={styles.unverifiedBadge}>
                      <Text style={styles.unverifiedText}>Unverified</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyDealsContainer}>
              <Ionicons name="pricetag-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyDealsText}>No deals yet</Text>
              <Text style={styles.emptyDealsSubtext}>Be the first to share a deal!</Text>
            </View>
          )}
        </View>


      </ScrollView>

      <AddDealModal
        visible={showAddDeal}
        onClose={() => setShowAddDeal(false)}
        venueId={venueId}
        venueName={venue?.name || ''}
        venueCategory={venue?.category}
      />
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
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  venueIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(135, 206, 235, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(135, 206, 235, 0.4)',
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
  modernStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#87CEEB',
    borderRadius: 16,
    paddingVertical: 16,
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
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
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
  socialSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'rgba(135, 206, 235, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 206, 235, 0.2)',
    alignSelf: 'flex-start',
    minHeight: 44,
  },
  distanceText: {
    fontSize: 14,
    color: '#87CEEB',
    fontWeight: '600',
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contactLinksCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 60,
  },
  contactLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  contactLinkContent: {
    flex: 1,
    justifyContent: 'center',
  },
  contactLinkLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactLinkValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  hoursDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    marginRight: 20,
  },
  hoursDayText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hoursTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
    justifyContent: 'flex-end',
  },
  hoursTimeText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
  },
  hoursRowLast: {
    borderBottomWidth: 0,
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

  addDealButton: {
    padding: 8,
    backgroundColor: 'rgba(135, 206, 235, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(135, 206, 235, 0.3)',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dealsContainer: {
    gap: 12,
  },
  emptyDealsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyDealsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDealsSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  unverifiedBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  unverifiedText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
}); 