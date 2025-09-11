import type { PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

// Simple in-memory cache for city data (5 minute TTL)
const cityCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const load: PageServerLoad = async ({ params }) => {
  try {
    const city = params.city;
    
    // Check cache first
    const cached = cityCache.get(city);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Cache hit for city: ${city}`);
      return cached.data;
    }
    
    // Convert city slug to proper name (e.g., 'new-york' -> 'New York', 'london' -> 'London')
    const cityName = city
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Query hotels and rooms data from Supabase - optimized query
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select(`
        id, name, stars, rating, reviews, neighbourhood, region, country,
        lat, lng, image, last_refurbished,
        wellness_amenities, dining_amenities, services_amenities, unique_points,
        rooms!inner (
          booking_room_id, room_type, persons, size_sqft, size_sqm,
          available, rooms_left, guideline_price, main_image, images,
          bed_types, facilities
        )
      `)
      .eq('rooms.available', true)
      .or(`region.ilike.%${cityName}%,address_full.ilike.%${cityName}%`)
      .order('rating', { ascending: false })
      .limit(1500); // Increased to include more hotels like Four Seasons (rank #63)

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
          // Parse JSON fields with error handling and caching
          let bedTypes = [];
          let facilities = [];
          let allImages = [];
          let displayImage = room.main_image || null;
          
          try {
            bedTypes = room.bed_types ? 
              (typeof room.bed_types === 'string' ? JSON.parse(room.bed_types) : room.bed_types) : [];
          } catch (e) {
            bedTypes = [];
          }
          
          try {
            facilities = room.facilities ? 
              (typeof room.facilities === 'string' ? JSON.parse(room.facilities) : room.facilities).slice(0, 3) : [];
          } catch (e) {
            facilities = [];
          }
          
          // Parse all images for carousel
          try {
            if (room.images) {
              if (typeof room.images === 'string') {
                if (room.images.startsWith('[')) {
                  allImages = JSON.parse(room.images).filter(Boolean);
                } else if (room.images.startsWith('http')) {
                  allImages = [room.images];
                }
              } else if (Array.isArray(room.images)) {
                allImages = room.images.filter(Boolean);
              }
            }
            
            // Add main image to the beginning if it exists and isn't already included
            if (displayImage && !allImages.includes(displayImage)) {
              allImages.unshift(displayImage);
            }
            
            // Limit to 5 images for performance
            allImages = allImages.slice(0, 5);
            
            // Set displayImage to first image if not set
            if (!displayImage && allImages.length > 0) {
              displayImage = allImages[0];
            }
          } catch (e) {
            allImages = displayImage ? [displayImage] : [];
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
            
            // Location - simplified
            address: {
              city: hotel.region,
              country: hotel.country,
              neighbourhood: hotel.neighbourhood
            },
            coordinates: hotel.lat && hotel.lng ? [hotel.lat, hotel.lng] : null,
            
            // Images (use main_image or first room image if available, otherwise hotel image)
            image: displayImage || hotel.image,
            images: allImages.length > 0 ? allImages : [(displayImage || hotel.image)],
            
            // Pricing (use guideline price as primary)
            price: room.guideline_price || 0,
            freeCancellation: false, // Default to false for performance
            
            // Amenities - only what's needed for display
            bedTypes: bedTypes,
            facilities: facilities,
            
            // Hotel amenities - optimized parsing with caching per hotel
            ...(() => {
              const hotelId = hotel.id;
              let wellnessAmenities = [], diningAmenities = [], servicesAmenities = [], uniquePoints = [];
              
              try {
                wellnessAmenities = hotel.wellness_amenities && 
                  hotel.wellness_amenities !== 'null' && hotel.wellness_amenities !== '[]' ? 
                  (typeof hotel.wellness_amenities === 'string' ? 
                    JSON.parse(hotel.wellness_amenities) : hotel.wellness_amenities) : [];
              } catch (e) { wellnessAmenities = []; }
              
              try {
                diningAmenities = hotel.dining_amenities && 
                  hotel.dining_amenities !== 'null' && hotel.dining_amenities !== '[]' ? 
                  (typeof hotel.dining_amenities === 'string' ? 
                    JSON.parse(hotel.dining_amenities) : hotel.dining_amenities) : [];
              } catch (e) { diningAmenities = []; }
              
              try {
                servicesAmenities = hotel.services_amenities && 
                  hotel.services_amenities !== 'null' && hotel.services_amenities !== '[]' ? 
                  (typeof hotel.services_amenities === 'string' ? 
                    JSON.parse(hotel.services_amenities) : hotel.services_amenities) : [];
              } catch (e) { servicesAmenities = []; }
              
              try {
                uniquePoints = hotel.unique_points && 
                  hotel.unique_points !== 'null' && hotel.unique_points !== '[]' ? 
                  (typeof hotel.unique_points === 'string' ? 
                    JSON.parse(hotel.unique_points) : hotel.unique_points) : [];
              } catch (e) { uniquePoints = []; }
              
              return { wellnessAmenities, diningAmenities, servicesAmenities, uniquePoints };
            })()
          });
        }
      }
    }
    
    // Sort suites by price (lowest first) by default
    allSuites.sort((a, b) => (a.price || 0) - (b.price || 0));
    
    const result = {
      suites: allSuites,
      city: cityName,
      error: null
    };
    
    // Cache the result
    cityCache.set(city, {
      data: result,
      timestamp: Date.now()
    });
    
    console.log(`Data loaded and cached for city: ${city} (${allSuites.length} suites)`);
    
    return result;
  } catch (err) {
    console.error('Server error loading suites:', err);
    return {
      suites: [],
      city: params.city.charAt(0).toUpperCase() + params.city.slice(1).replace(/-/g, ' '),
      error: 'Server error loading suites'
    };
  }
};