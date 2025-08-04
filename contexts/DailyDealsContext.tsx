import React, { createContext, useCallback, useContext, useState } from 'react';
import { CreateDailyDealData, DailyDeal, dailyDealsApi, UpdateDailyDealData } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface DailyDealsContextType {
  deals: DailyDeal[];
  loading: boolean;
  error: string | null;
  createDeal: (data: CreateDailyDealData) => Promise<boolean>;
  updateDeal: (dealId: string, data: UpdateDailyDealData) => Promise<boolean>;
  deleteDeal: (dealId: string) => Promise<boolean>;
  voteDeal: (dealId: string, vote: 'up' | 'down') => Promise<boolean>;
  loadVenueDeals: (venueId: string) => Promise<void>;
  getVenueDealCount: (venueId: string) => Promise<number>;
  clearError: () => void;
}

const DailyDealsContext = createContext<DailyDealsContextType | undefined>(undefined);

export function DailyDealsProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<DailyDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createDeal = useCallback(async (data: CreateDailyDealData): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to create a deal');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const newDeal = await dailyDealsApi.createDeal(data, ''); // userId not needed, will be fetched from auth
      
      if (newDeal) {
        setDeals(prev => [newDeal, ...prev]);
        return true;
      } else {
        setError('Failed to create deal');
        return false;
      }
    } catch (err) {
      setError('Error creating deal');
      console.error('Error creating deal:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateDeal = useCallback(async (dealId: string, data: UpdateDailyDealData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const updatedDeal = await dailyDealsApi.updateDeal(dealId, data);
      
      if (updatedDeal) {
        setDeals(prev => prev.map(deal => 
          deal.id === dealId ? updatedDeal : deal
        ));
        return true;
      } else {
        setError('Failed to update deal');
        return false;
      }
    } catch (err) {
      setError('Error updating deal');
      console.error('Error updating deal:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDeal = useCallback(async (dealId: string): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to delete a deal');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await dailyDealsApi.deleteDeal(dealId, ''); // userId not needed, will be fetched from auth
      
      if (success) {
        setDeals(prev => prev.filter(deal => deal.id !== dealId));
        return true;
      } else {
        setError('Failed to delete deal');
        return false;
      }
    } catch (err) {
      setError('Error deleting deal');
      console.error('Error deleting deal:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const voteDeal = useCallback(async (dealId: string, vote: 'up' | 'down'): Promise<boolean> => {
    // Optimistically update the UI immediately
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        return {
          ...deal,
          upvotes: vote === 'up' ? deal.upvotes + 1 : deal.upvotes,
          downvotes: vote === 'down' ? deal.downvotes + 1 : deal.downvotes,
        };
      }
      return deal;
    }));

    try {
      const success = await dailyDealsApi.voteDeal(dealId, vote);
      
      if (!success) {
        // Revert the optimistic update if the API call failed
        setDeals(prev => prev.map(deal => {
          if (deal.id === dealId) {
            return {
              ...deal,
              upvotes: vote === 'up' ? deal.upvotes - 1 : deal.upvotes,
              downvotes: vote === 'down' ? deal.downvotes - 1 : deal.downvotes,
            };
          }
          return deal;
        }));
        setError('Failed to vote on deal');
        return false;
      }
      
      return true;
    } catch (err) {
      // Revert the optimistic update if there was an error
      setDeals(prev => prev.map(deal => {
        if (deal.id === dealId) {
          return {
            ...deal,
            upvotes: vote === 'up' ? deal.upvotes - 1 : deal.upvotes,
            downvotes: vote === 'down' ? deal.downvotes - 1 : deal.downvotes,
          };
        }
        return deal;
      }));
      setError('Error voting on deal');
      console.error('Error voting on deal:', err);
      return false;
    }
  }, []);

  const loadVenueDeals = useCallback(async (venueId: string) => {
    setLoading(true);
    setError(null);

    try {
      const venueDeals = await dailyDealsApi.getVenueDeals(venueId);
      setDeals(venueDeals);
    } catch (err) {
      setError('Error loading venue deals');
      console.error('Error loading venue deals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getVenueDealCount = useCallback(async (venueId: string): Promise<number> => {
    try {
      return await dailyDealsApi.getVenueDealCount(venueId);
    } catch (err) {
      console.error('Error getting venue deal count:', err);
      return 0;
    }
  }, []);

  const value: DailyDealsContextType = {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    deleteDeal,
    voteDeal,
    loadVenueDeals,
    getVenueDealCount,
    clearError,
  };

  return (
    <DailyDealsContext.Provider value={value}>
      {children}
    </DailyDealsContext.Provider>
  );
}

export function useDailyDeals() {
  const context = useContext(DailyDealsContext);
  if (context === undefined) {
    throw new Error('useDailyDeals must be used within a DailyDealsProvider');
  }
  return context;
} 