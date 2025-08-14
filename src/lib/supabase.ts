import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

// Database Types
export type UserBuyerType = 'first_time_buyer' | 'investor' | 'relocating' | 'upgrading' | 'downsizing' | 'other';
export type PropertyType = 'house' | 'flat' | 'penthouse' | 'mews' | 'townhouse' | 'mansion' | 'other';
export type TimeframeType = 'asap' | '1-3months' | '3-6months' | '6-12months' | 'exploring';
export type PurchaseMethod = 'cash' | 'mortgage' | 'part_cash_part_mortgage' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  
  // Buyer preferences
  buyer_type?: UserBuyerType;
  timeframe?: TimeframeType;
  purchase_method?: PurchaseMethod;
  price_range?: string;
  min_price?: number;
  max_price?: number;
  property_types?: PropertyType[];
  min_bedrooms?: number;
  max_bedrooms?: number;
  preferred_locations?: string[];
  
  // Seller information
  is_seller?: boolean;
  selling_property?: boolean;
  
  // Profile status
  is_verified?: boolean;
  verification_documents?: string[];
  profile_completed?: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  price_display: string;
  price_guide?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  property_type: PropertyType;
  address: string;
  neighborhood?: string;
  city: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  floorplan_url?: string;
  virtual_tour_url?: string;
  features: string[];
  is_off_market: boolean;
  is_featured: boolean;
  is_available: boolean;
  agent_contact?: string;
  owner_id?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyInterest {
  id: string;
  user_id: string;
  property_id: string;
  interest_type: 'view' | 'favorite' | 'viewing_request' | 'inquiry';
  message?: string;
  viewing_requested_date?: string;
  created_at: string;
}

export interface PropertyListing {
  id: string;
  user_id: string;
  property_type: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  postcode: string;
  price_expectation?: string;
  timeframe?: TimeframeType;
  owner_name: string;
  email: string;
  phone: string;
  additional_info?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'archived';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
} 