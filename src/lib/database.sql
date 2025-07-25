-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    buyer_type TEXT,
    timeframe TEXT,
    purchase_method TEXT,
    selling_property BOOLEAN,
    price_range TEXT,
    property_type TEXT,
    bedrooms TEXT,
    location TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    price_display TEXT NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    sqft INTEGER,
    property_type TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'London',
    postcode TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    is_off_market BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    agent_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties are readable by authenticated users
CREATE POLICY "Authenticated users can view published properties" ON properties
    FOR SELECT USING (is_published = true AND auth.role() = 'authenticated');

-- Only admins can modify properties (we'll handle this later)
CREATE POLICY "Only admins can modify properties" ON properties
    FOR ALL USING (false);

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Insert some sample properties
INSERT INTO properties (
    title, description, price, price_display, bedrooms, bathrooms, sqft,
    property_type, neighborhood, postcode, is_off_market, is_featured,
    images, features
) VALUES 
(
    'Luxury Penthouse in Mayfair',
    'Spectacular penthouse apartment with panoramic views over Hyde Park. This exceptional property features floor-to-ceiling windows, premium finishes, and a private terrace.',
    4500000,
    '£4,500,000',
    3,
    3,
    2400,
    'apartment',
    'Mayfair',
    'W1K 1BE',
    true,
    true,
    ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'],
    ARRAY['Private Terrace', 'Concierge Service', 'Gym', 'Underground Parking']
),
(
    'Georgian Townhouse in Chelsea',
    'Beautifully restored Georgian townhouse in the heart of Chelsea. Period features combined with modern luxury throughout.',
    6200000,
    '£6,200,000',
    4,
    4,
    3200,
    'house',
    'Chelsea',
    'SW3 4HH',
    true,
    true,
    ARRAY['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop'],
    ARRAY['Period Features', 'Garden', 'Wine Cellar', 'Parking']
),
(
    'Modern Apartment in Kensington',
    'Contemporary apartment in a prestigious Kensington development. High-end finishes and excellent transport links.',
    2800000,
    '£2,800,000',
    2,
    2,
    1800,
    'apartment',
    'Kensington',
    'SW7 2AZ',
    true,
    false,
    ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'],
    ARRAY['Balcony', 'Porter', 'Lift', 'Storage']
),
(
    'Victorian Mansion in Hampstead',
    'Magnificent Victorian mansion set in private grounds. Exceptionally spacious with original features and modern amenities.',
    8500000,
    '£8,500,000',
    6,
    5,
    4500,
    'house',
    'Hampstead',
    'NW3 7HA',
    true,
    true,
    ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'],
    ARRAY['Private Garden', 'Period Features', 'Driveway', 'Wine Cellar', 'Library']
); 