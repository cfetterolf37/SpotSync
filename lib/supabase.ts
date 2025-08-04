import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];

// Database types for Daily Deals
export interface DailyDeal {
  id: string;
  venue_id: string;
  user_id: string;
  title: string;
  description: string;
  price?: string;
  valid_until?: string;
  media_urls: string[];
  is_verified: boolean;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDailyDealData {
  venue_id: string;
  title: string;
  description: string;
  price?: string;
  valid_until?: string;
  media_urls: string[];
}

export interface UpdateDailyDealData {
  title?: string;
  description?: string;
  price?: string;
  valid_until?: string;
  media_urls?: string[];
}

// Daily Deals API functions
export const dailyDealsApi = {
  // Create a new daily deal
  async createDeal(data: CreateDailyDealData, userId: string): Promise<DailyDeal | null> {
    try {
      // Get the current user from Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting current user:', userError);
        return null;
      }

      const { data: deal, error } = await supabase
        .from('daily_deals')
        .insert({
          ...data,
          user_id: user.id, // Use the authenticated user's ID
          is_verified: false,
          upvotes: 0,
          downvotes: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating daily deal:', error);
        return null;
      }

      return deal;
    } catch (error) {
      console.error('Error creating daily deal:', error);
      return null;
    }
  },

  // Get deals for a specific venue
  async getVenueDeals(venueId: string): Promise<DailyDeal[]> {
    try {
      console.log('Fetching deals for venue:', venueId);
      
      // First, let's see all deals for this venue (including unverified)
      const { data: allDeals, error: allError } = await supabase
        .from('daily_deals')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('Error fetching all venue deals:', allError);
        return [];
      }

      console.log('All deals for venue:', allDeals);

      // Get verified deals
      const { data: verifiedDeals, error } = await supabase
        .from('daily_deals')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verified venue deals:', error);
        return [];
      }

      console.log('Verified deals for venue:', verifiedDeals);

      // For now, return all deals (including unverified) so you can see them
      // In production, you might want to only show verified deals
      return allDeals || [];
    } catch (error) {
      console.error('Error fetching venue deals:', error);
      return [];
    }
  },

  // Update a deal
  async updateDeal(dealId: string, data: UpdateDailyDealData): Promise<DailyDeal | null> {
    try {
      const { data: deal, error } = await supabase
        .from('daily_deals')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dealId)
        .select()
        .single();

      if (error) {
        console.error('Error updating daily deal:', error);
        return null;
      }

      return deal;
    } catch (error) {
      console.error('Error updating daily deal:', error);
      return null;
    }
  },

  // Delete a deal
  async deleteDeal(dealId: string, userId: string): Promise<boolean> {
    try {
      // Get the current user from Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting current user:', userError);
        return false;
      }

      const { error } = await supabase
        .from('daily_deals')
        .delete()
        .eq('id', dealId)
        .eq('user_id', user.id); // Use the authenticated user's ID

      if (error) {
        console.error('Error deleting daily deal:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting daily deal:', error);
      return false;
    }
  },

  // Vote on a deal
  async voteDeal(dealId: string, vote: 'up' | 'down'): Promise<boolean> {
    try {
      // First get current vote counts
      const { data: currentDeal, error: fetchError } = await supabase
        .from('daily_deals')
        .select('upvotes, downvotes')
        .eq('id', dealId)
        .single();

      if (fetchError) {
        console.error('Error fetching current deal votes:', fetchError);
        return false;
      }

      // Update vote counts
      const { error } = await supabase
        .from('daily_deals')
        .update({
          upvotes: vote === 'up' ? (currentDeal?.upvotes || 0) + 1 : (currentDeal?.upvotes || 0),
          downvotes: vote === 'down' ? (currentDeal?.downvotes || 0) + 1 : (currentDeal?.downvotes || 0),
        })
        .eq('id', dealId);

      if (error) {
        console.error('Error voting on deal:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error voting on deal:', error);
      return false;
    }
  },

  // Get deal count for a specific venue
  async getVenueDealCount(venueId: string): Promise<number> {
    try {
      console.log('Getting deal count for venue:', venueId);
      
      // First, let's check all deals (including unverified) for debugging
      const { data: allDeals, error: allError } = await supabase
        .from('daily_deals')
        .select('*')
        .eq('venue_id', venueId);

      if (allError) {
        console.error('Error fetching all deals for venue:', allError);
      } else {
        console.log('All deals for venue:', allDeals?.length || 0);
      }

      // For debugging, let's count all deals (including unverified)
      const { count, error } = await supabase
        .from('daily_deals')
        .select('*', { count: 'exact', head: true })
        .eq('venue_id', venueId);
        // .eq('is_verified', true); // Temporarily disabled for debugging

      if (error) {
        console.error('Error fetching venue deal count:', error);
        return 0;
      }

      console.log('Verified deal count for venue:', count);
      return count || 0;
    } catch (error) {
      console.error('Error fetching venue deal count:', error);
      return 0;
    }
  },

  // Admin function to verify a deal (for testing)
  async verifyDeal(dealId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('daily_deals')
        .update({ is_verified: true })
        .eq('id', dealId);

      if (error) {
        console.error('Error verifying deal:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying deal:', error);
      return false;
    }
  },

  // Admin function to verify all deals for a venue (for testing)
  async verifyAllVenueDeals(venueId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('daily_deals')
        .update({ is_verified: true })
        .eq('venue_id', venueId);

      if (error) {
        console.error('Error verifying venue deals:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying venue deals:', error);
      return false;
    }
  },
}; 