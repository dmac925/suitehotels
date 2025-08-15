-- Off Market Prime Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_buyer_type AS ENUM ('first_time_buyer', 'investor', 'relocating', 'upgrading', 'downsizing', 'other');
CREATE TYPE property_type AS ENUM ('house', 'flat', 'penthouse', 'mews', 'townhouse', 'mansion', 'other');
CREATE TYPE timeframe_type AS ENUM ('asap', '1-3months', '3-6months', '6-12months', 'exploring');
CREATE TYPE purchase_method AS ENUM ('cash', 'mortgage', 'part_cash_part_mortgage', 'other');

-- User Profiles Table (extends auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    
    -- Buyer preferences
    buyer_type user_buyer_type,
    timeframe timeframe_type,
    purchase_method purchase_method,
    price_range TEXT,
    min_price BIGINT,
    max_price BIGINT,
    property_types property_type[],
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    preferred_locations TEXT[],
    
    -- Seller information
    is_seller BOOLEAN DEFAULT false,
    selling_property BOOLEAN DEFAULT false,
    
    -- Profile status
    is_verified BOOLEAN DEFAULT false,
    verification_documents TEXT[],
    profile_completed BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Properties Table
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Price information
    price BIGINT NOT NULL,
    price_display TEXT NOT NULL,
    price_guide TEXT,
    
    -- Property details
    bedrooms INTEGER,
    bathrooms INTEGER,
    sqft INTEGER,
    property_type property_type NOT NULL,
    
    -- Location
    address TEXT NOT NULL,
    neighborhood TEXT,
    city TEXT DEFAULT 'London',
    postcode TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Media and features
    images TEXT[] DEFAULT '{}',
    floorplan_url TEXT,
    virtual_tour_url TEXT,
    features TEXT[] DEFAULT '{}',
    
    -- Property status
    is_off_market BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    
    -- Contact and agent info
    agent_contact TEXT,
    owner_id UUID REFERENCES auth.users(id),
    
    -- SEO and metadata
    slug TEXT UNIQUE,
    meta_title TEXT,
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Property Views/Interests Table
CREATE TABLE public.property_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    
    -- Interest type
    interest_type TEXT DEFAULT 'view' CHECK (interest_type IN ('view', 'favorite', 'viewing_request', 'inquiry')),
    
    -- Additional data
    message TEXT,
    viewing_requested_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Unique constraint to prevent duplicate interests of same type
    UNIQUE(user_id, property_id, interest_type)
);

-- Property Seller Listings Table
CREATE TABLE public.property_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Property details from listing form
    property_type property_type NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    postcode TEXT NOT NULL,
    price_expectation TEXT,
    timeframe timeframe_type,
    
    -- Contact details
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    additional_info TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'archived')),
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Sessions/Activity Log
CREATE TABLE public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    
    -- Activity details
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Search Saved Searches
CREATE TABLE public.saved_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Search criteria
    name TEXT NOT NULL,
    search_criteria JSONB NOT NULL,
    
    -- Notifications
    email_alerts BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_buyer_type ON public.user_profiles(buyer_type);
CREATE INDEX idx_properties_neighborhood ON public.properties(neighborhood);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_is_available ON public.properties(is_available);
CREATE INDEX idx_properties_is_off_market ON public.properties(is_off_market);
CREATE INDEX idx_property_interests_user_id ON public.property_interests(user_id);
CREATE INDEX idx_property_interests_property_id ON public.property_interests(property_id);
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at);

-- Row Level Security (RLS) Policies

-- User Profiles RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Anyone can view available properties
CREATE POLICY "Anyone can view available properties" ON public.properties
    FOR SELECT USING (is_available = true);

-- Only authenticated users can insert properties (for listings)
CREATE POLICY "Authenticated users can insert properties" ON public.properties
    FOR INSERT TO authenticated WITH CHECK (true);

-- Property owners can update their properties
CREATE POLICY "Property owners can update own properties" ON public.properties
    FOR UPDATE USING (auth.uid() = owner_id);

-- Property Interests RLS
ALTER TABLE public.property_interests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own interests
CREATE POLICY "Users can view own interests" ON public.property_interests
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own interests
CREATE POLICY "Users can insert own interests" ON public.property_interests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own interests
CREATE POLICY "Users can update own interests" ON public.property_interests
    FOR UPDATE USING (auth.uid() = user_id);

-- Property Listings RLS
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

-- Users can view their own listings
CREATE POLICY "Users can view own listings" ON public.property_listings
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own listings
CREATE POLICY "Users can insert own listings" ON public.property_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON public.property_listings
    FOR UPDATE USING (auth.uid() = user_id);

-- User Activity RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activity" ON public.user_activity
    FOR SELECT USING (auth.uid() = user_id);

-- Anyone can insert activity (for tracking)
CREATE POLICY "Anyone can insert activity" ON public.user_activity
    FOR INSERT WITH CHECK (true);

-- Saved Searches RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can manage their own saved searches
CREATE POLICY "Users can manage own saved searches" ON public.saved_searches
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_listings_updated_at BEFORE UPDATE ON public.property_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON public.saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, first_name, last_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', '')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample data (optional - remove if not needed)
-- Insert some sample properties
INSERT INTO public.properties (
    title, description, price, price_display, bedrooms, bathrooms, sqft,
    property_type, address, neighborhood, postcode, images, features,
    is_off_market, is_featured
) VALUES 
(
    'Luxury Mayfair Apartment',
    'Stunning 3-bedroom apartment in the heart of Mayfair with period features and modern amenities.',
    5500000,
    '£5,500,000',
    3, 2, 1800,
    'flat',
    'Berkeley Square, Mayfair',
    'mayfair',
    'W1J 6BD',
    ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    ARRAY['Period features', 'Modern kitchen', 'Concierge service', 'Air conditioning'],
    true,
    true
),
(
    'Chelsea Townhouse',
    'Beautiful Victorian townhouse with private garden in prime Chelsea location.',
    8750000,
    '£8,750,000',
    4, 3, 2400,
    'house',
    'Cadogan Square, Chelsea',
    'chelsea',
    'SW1X 0HT',
    ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    ARRAY['Private garden', 'Period features', 'Modern renovation', 'Parking'],
    true,
    true
);

COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';
COMMENT ON TABLE public.properties IS 'Property listings for the platform';
COMMENT ON TABLE public.property_interests IS 'User interactions with properties (views, favorites, inquiries)';
COMMENT ON TABLE public.property_listings IS 'Property submissions from sellers';
COMMENT ON TABLE public.user_activity IS 'User activity tracking for analytics';
COMMENT ON TABLE public.saved_searches IS 'User saved search criteria for alerts';
