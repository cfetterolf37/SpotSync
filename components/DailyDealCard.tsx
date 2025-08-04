import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDailyDeals } from '../contexts/DailyDealsContext';
import { DailyDeal } from '../lib/supabase';

interface DailyDealCardProps {
  deal: DailyDeal;
  onPress?: () => void;
}

export default function DailyDealCard({ deal, onPress }: DailyDealCardProps) {
  const { voteDeal } = useDailyDeals();
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = useCallback(async (vote: 'up' | 'down') => {
    if (isVoting) return; // Prevent multiple rapid votes
    
    setIsVoting(true);
    try {
      await voteDeal(deal.id, vote);
    } finally {
      setIsVoting(false);
    }
  }, [deal.id, voteDeal, isVoting]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = deal.valid_until ? new Date(deal.valid_until) < new Date() : false;

  return (
    <TouchableOpacity 
      style={[styles.container, isExpired && styles.expiredContainer]} 
      onPress={onPress}
      disabled={isExpired}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{deal.title}</Text>
          {deal.price && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{deal.price}</Text>
            </View>
          )}
        </View>
        <View style={styles.voteSection}>
          <TouchableOpacity 
            style={[styles.voteButton, isVoting && styles.voteButtonDisabled]} 
            onPress={() => handleVote('up')}
            disabled={isVoting}
          >
            <Ionicons name="thumbs-up" size={16} color="#4CAF50" />
            <Text style={styles.voteText}>{deal.upvotes}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.voteButton, isVoting && styles.voteButtonDisabled]} 
            onPress={() => handleVote('down')}
            disabled={isVoting}
          >
            <Ionicons name="thumbs-down" size={16} color="#F44336" />
            <Text style={styles.voteText}>{deal.downvotes}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.description}>{deal.description}</Text>

      {deal.media_urls && deal.media_urls.length > 0 && (
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: deal.media_urls[0] }} 
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.metaInfo}>
          <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.6)" />
          <Text style={styles.metaText}>
            {formatDate(deal.created_at)}
          </Text>
        </View>
        
        {deal.valid_until && (
          <View style={styles.metaInfo}>
            <Ionicons 
              name={isExpired ? "close-circle" : "checkmark-circle"} 
              size={14} 
              color={isExpired ? "#F44336" : "#4CAF50"} 
            />
            <Text style={[styles.metaText, isExpired && styles.expiredText]}>
              {isExpired ? 'Expired' : 'Valid until ' + formatDate(deal.valid_until)}
            </Text>
          </View>
        )}
      </View>

      {isExpired && (
        <View style={styles.expiredOverlay}>
          <Text style={styles.expiredLabel}>EXPIRED</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  expiredContainer: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  voteSection: {
    flexDirection: 'row',
    gap: 8,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 12,
  },
  mediaImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  expiredText: {
    color: '#F44336',
  },
  expiredOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F44336',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  expiredLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 