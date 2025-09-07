-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER,
  url TEXT,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  stars INTEGER,
  rating DECIMAL(3, 1),
  reviews INTEGER,
  breakfast TEXT,
  check_in TEXT,
  check_out TEXT,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  address_full TEXT,
  postal_code VARCHAR(20),
  street TEXT,
  country VARCHAR(100),
  region VARCHAR(100),
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  booking_room_id BIGINT,
  url TEXT,
  room_type TEXT,
  persons INTEGER,
  size_sqft DECIMAL(10, 2),
  size_sqm DECIMAL(10, 2),
  guideline_price INTEGER,
  bed_types JSONB,
  facilities JSONB,
  images JSONB,
  is_partner_offer_room BOOLEAN DEFAULT FALSE,
  rooms_left INTEGER,
  available BOOLEAN DEFAULT TRUE,
  options JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_hotels_booking_id ON hotels(booking_id);
CREATE INDEX idx_hotels_name ON hotels(name);
CREATE INDEX idx_hotels_location ON hotels(lat, lng);
CREATE INDEX idx_hotels_rating ON hotels(rating);
CREATE INDEX idx_hotels_stars ON hotels(stars);

CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_rooms_booking_room_id ON rooms(booking_room_id);
CREATE INDEX idx_rooms_available ON rooms(available);
CREATE INDEX idx_rooms_persons ON rooms(persons);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your needs)
CREATE POLICY "Hotels are viewable by everyone" ON hotels
  FOR SELECT USING (true);

CREATE POLICY "Rooms are viewable by everyone" ON rooms
  FOR SELECT USING (true);