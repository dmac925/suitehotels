import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const load: PageServerLoad = async ({ params }) => {
  try {
    const city = params.city;
    
    // Convert city slug to proper name (e.g., 'new-york' -> 'New York', 'london' -> 'London')
    const cityName = city
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Query hotels and rooms data from Supabase, including amenity columns
    // Note: Adjust the query based on your actual city/region data
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select(`
        *,
        wellness_amenities,
        dining_amenities,
        services_amenities,
        unique_points,
        rooms (
          *
        )
      `)
      .or(`region.ilike.%${cityName}%,address_full.ilike.%${cityName}%`)
      .order('rating', { ascending: false });

    if (hotelsError) {
      console.error('Error fetching hotels from Supabase:', hotelsError);
      return {
        suites: [],
        city: cityName,
        error: 'Failed to load hotel data'
      };
    }

    // Transform the data into suite format
    const allSuites: any[] = [];
    
    for (const hotel of hotels || []) {
      if (hotel.rooms && hotel.rooms.length > 0) {
        for (const room of hotel.rooms) {
          // Parse JSON fields - optimize by only parsing what we need
          const bedTypes = room.bed_types ? JSON.parse(room.bed_types) : [];
          // Only parse first 3 facilities for display
          const facilities = room.facilities ? JSON.parse(room.facilities).slice(0, 4) : [];
          // Only get first image for performance
          const roomImages = room.images ? JSON.parse(room.images) : [];
          const firstImage = roomImages[0] || null;
          
          allSuites.push({
            // Room info
            id: room.booking_room_id,
            roomType: room.room_type,
            roomSlug: createSlug(room.room_type),
            persons: room.persons,
            sqft: room.size_sqft,
            sqm: room.size_sqm,
            available: room.available,
            roomsLeft: room.rooms_left,
            
            // Hotel info
            hotelName: hotel.name,
            hotelSlug: createSlug(hotel.name),
            hotelStars: hotel.stars,
            hotelRating: hotel.rating,
            hotelReviews: hotel.reviews,
            neighbourhood: hotel.neighbourhood,
            region: hotel.region,
            last_refurbished: hotel.last_refurbished,
            
            // Location - simplified, removed full and postalCode
            address: {
              street: hotel.street,
              city: hotel.region,
              country: hotel.country,
              neighbourhood: hotel.neighbourhood
            },
            coordinates: hotel.lat && hotel.lng ? [hotel.lat, hotel.lng] : null,
            
            // Images (use first room image if available, otherwise hotel image)
            image: firstImage || hotel.image,
            
            // Pricing (use guideline price as primary)
            price: room.guideline_price || 0,
            freeCancellation: false, // Default to false for performance
            
            // Amenities - only what's needed for display
            bedTypes: bedTypes,
            facilities: facilities,
            
            // Hotel amenities from database columns - parse JSON strings
            wellnessAmenities: hotel.wellness_amenities ? 
              (typeof hotel.wellness_amenities === 'string' ? 
                (hotel.wellness_amenities !== 'null' && hotel.wellness_amenities !== '[]' ? 
                  JSON.parse(hotel.wellness_amenities) : []) 
                : hotel.wellness_amenities) 
              : [],
            diningAmenities: hotel.dining_amenities ? 
              (typeof hotel.dining_amenities === 'string' ? 
                (hotel.dining_amenities !== 'null' && hotel.dining_amenities !== '[]' ? 
                  JSON.parse(hotel.dining_amenities) : []) 
                : hotel.dining_amenities) 
              : [],
            servicesAmenities: hotel.services_amenities ? 
              (typeof hotel.services_amenities === 'string' ? 
                (hotel.services_amenities !== 'null' && hotel.services_amenities !== '[]' ? 
                  JSON.parse(hotel.services_amenities) : []) 
                : hotel.services_amenities) 
              : [],
            uniquePoints: hotel.unique_points ? 
              (typeof hotel.unique_points === 'string' ? 
                (hotel.unique_points !== 'null' && hotel.unique_points !== '[]' ? 
                  JSON.parse(hotel.unique_points) : []) 
                : hotel.unique_points) 
              : []
          });
        }
      }
    }
    
    // Sort suites by price (lowest first) by default
    allSuites.sort((a, b) => (a.price || 0) - (b.price || 0));
    
    return {
      suites: allSuites,
      city: cityName,
      error: null
    };
  } catch (err) {
    console.error('Server error loading suites:', err);
    return {
      suites: [],
      city: params.city.charAt(0).toUpperCase() + params.city.slice(1).replace(/-/g, ' '),
      error: 'Server error loading suites'
    };
  }
};