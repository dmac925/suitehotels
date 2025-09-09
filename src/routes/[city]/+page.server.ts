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
          // Skip rooms that are not available
          if (room.available === false) {
            continue;
          }
          // Parse JSON fields - optimize by only parsing what we need
          const bedTypes = room.bed_types ? 
            (typeof room.bed_types === 'string' ? JSON.parse(room.bed_types) : room.bed_types) : [];
          // Only parse first 3 facilities for display
          const facilities = room.facilities ? 
            (typeof room.facilities === 'string' ? JSON.parse(room.facilities) : room.facilities).slice(0, 4) : [];
          // Use main_image if available, otherwise fall back to first image from images array
          let displayImage = room.main_image || null;
          
          if (!displayImage && room.images) {
            let roomImages = [];
            if (typeof room.images === 'string') {
              // Check if it's a JSON string or just a plain URL
              if (room.images.startsWith('[')) {
                roomImages = JSON.parse(room.images);
              } else if (room.images.startsWith('http')) {
                // Single URL string, convert to array
                roomImages = [room.images];
              }
            } else if (Array.isArray(room.images)) {
              roomImages = room.images;
            }
            displayImage = roomImages[0] || null;
          }
          
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
            
            // Images (use main_image or first room image if available, otherwise hotel image)
            image: displayImage || hotel.image,
            
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