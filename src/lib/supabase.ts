import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kxwtpidrteukdmvlhtwy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4d3RwaWRydGV1a2RtdmxodHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDI0MjEsImV4cCI6MjA2Nzk3ODQyMX0.P-d2sFuNj-DQpi81OLq-SfD1N6LgEhD0tDbl1stvCPA'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  buyer_type?: string
  timeframe?: string
  purchase_method?: string
  selling_property?: boolean
  price_range?: string
  property_type?: string
  bedrooms?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  title: string
  description?: string
  price: number
  price_display: string
  bedrooms: number
  bathrooms: number
  sqft?: number
  property_type: string
  neighborhood: string
  city: string
  postcode?: string
  latitude?: number
  longitude?: number
  images: string[]
  features?: string[]
  is_off_market: boolean
  is_featured: boolean
  agent_contact?: string
  created_at: string
  updated_at: string
} 