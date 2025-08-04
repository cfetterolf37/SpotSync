import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { category: string; radius: number }) => void;
  currentFilters: { category: string; radius: number };
}

const CATEGORIES = [
  { id: 'accomodation,activity,airport,commercial,catering,emergency,education,childcare,entertainment,healthcare,heritage,highway,leisure,man_made,natural,national_park,office,parking,pet,power,production,railway,rental,service,tourism,religion,camping,amenity,beach,adult,building,ski,sport,public_transport,administrative,postal_code,political,low_emission_zone,populated_place', name: 'All Categories' },
  { id: 'accomodation', name: 'Accomodations' },
  { id: 'activity', name: 'Activity' },
  { id: 'airport', name: 'Airport' },
  { id: 'commercial', name: 'Commercial' },
  { id: 'catering', name: 'Catering' },
  { id: 'emergency', name: 'Emergency' },
  { id: 'education', name: 'Education' },
  { id: 'childcare', name: 'Childcare' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'heritage', name: 'Heritage' },
  { id: 'highway', name: 'Highway' },
  { id: 'leisure', name: 'Leisure' },
  { id: 'man_made', name: 'Man Made' },
  { id: 'natural', name: 'Natural' },
  { id: 'national_park', name: 'National Park' },
  { id: 'office', name: 'Office' },
  { id: 'parking', name: 'Parking' },
  { id: 'pet', name: 'Pet' },
  { id: 'power', name: 'Power' },
  { id: 'production', name: 'Production' },
  { id: 'railway', name: 'Railway' },
  { id: 'rental', name: 'Rental' },
  { id: 'service', name: 'Service' },
  { id: 'tourism', name: 'Tourism' },
  { id: 'religion', name: 'Religion' },
  { id: 'camping', name: 'Camping' },
  { id: 'amenity', name: 'Amenity' },
  { id: 'beach', name: 'Beach' },
  { id: 'adult', name: 'Adult' },
  { id: 'building', name: 'Building' },
  { id: 'ski', name: 'Ski' },
  { id: 'sport', name: 'Sport' },
  { id: 'public_transport', name: 'Public Transport' },
  { id: 'administrative', name: 'Administrative' },
  { id: 'postal_code', name: 'Postal Code' },
  { id: 'political', name: 'Political' },
  { id: 'low_emission_zone', name: 'Low Emission Zone' },
  { id: 'populated_place', name: 'Populated Place' },
];

export default function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.category);
  const [selectedRadius, setSelectedRadius] = useState(currentFilters.radius);

  const handleApply = () => {
    onApply({
      category: selectedCategory,
      radius: selectedRadius,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedRadius(5);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="grid-outline" size={20} color="#87CEEB" />
              <Text style={styles.sectionTitle}>Category</Text>
            </View>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText,
                    ]}
                    numberOfLines={2}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Radius Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color="#87CEEB" />
              <Text style={styles.sectionTitle}>Search Radius</Text>
            </View>
            <View style={styles.radiusContainer}>
              <View style={styles.radiusDisplay}>
                <Text style={styles.radiusValue}>{selectedRadius} miles</Text>
                <Text style={styles.radiusSubtext}>from your location</Text>
              </View>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={5}
                  maximumValue={50}
                  value={selectedRadius}
                  onValueChange={(value) => setSelectedRadius(Math.round(value / 5) * 5)}
                  minimumTrackTintColor="#87CEEB"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="#87CEEB"
                  step={5}
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>5 mi</Text>
                  <Text style={styles.sliderLabel}>50 mi</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Ionicons name="checkmark" size={16} color="#1a1a2e" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%', // Adjust as needed for 2 columns
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: 'rgba(135, 206, 235, 0.3)',
    borderColor: 'rgba(135, 206, 235, 0.5)',
  },
  categoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#87CEEB',
    fontWeight: '600',
  },
  radiusContainer: {
    marginTop: 10,
  },
  radiusDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  radiusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  radiusSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sliderContainer: {
    position: 'relative',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sliderThumb: {
    width: 24,
    height: 24,
    backgroundColor: '#87CEEB',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#1a1a2e',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 10,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#87CEEB',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#1a1a2e',
    fontWeight: '600',
    marginLeft: 10,
  },
}); 