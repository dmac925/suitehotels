import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabaseClient';

// Simple cache for progressive loading
const progressiveCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const GET: RequestHandler = async ({ params, url }) => {
  try {
    const city = params.city;
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '500');
    
    // Create cache key
    const cacheKey = `${city}-${offset}-${limit}`;
    const cached = progressiveCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return json(cached.data);
    }
    
    // Convert city slug to proper name
    const cityName = city
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Query for additional data beyond the initial load
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
      .range(offset, offset + limit - 1);

    if (hotelsError) {
      console.error('Error fetching additional hotels:', hotelsError);
      return json({ suites: [], error: 'Failed to load additional data' }, { status: 500 });
    }

    // Transform the data into suite format (same logic as main page)
    const allSuites: any[] = [];
    
    for (const hotel of hotels || []) {
      if (hotel.rooms && hotel.rooms.length > 0) {
        for (const room of hotel.rooms) {
          // Parse JSON fields with error handling
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
            } else if (displayImage && allImages.includes(displayImage)) {
              // If main image is already in the array but not first, move it to the front
              const mainImageIndex = allImages.indexOf(displayImage);
              if (mainImageIndex > 0) {
                allImages.splice(mainImageIndex, 1);
                allImages.unshift(displayImage);
              }
            }
            
            // Limit to 4 images for performance
            allImages = allImages.slice(0, 4);
            
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
            
            // Location
            address: {
              city: hotel.region,
              country: hotel.country,
              neighbourhood: hotel.neighbourhood
            },
            coordinates: hotel.lat && hotel.lng ? [hotel.lat, hotel.lng] : null,
            
            // Images
            image: displayImage || hotel.image,
            images: allImages.length > 0 ? allImages : [(displayImage || hotel.image)],
            
            // Pricing
            price: room.guideline_price || 0,
            freeCancellation: false,
            
            // Amenities
            bedTypes: bedTypes,
            facilities: facilities,
            
            // Hotel amenities
            ...(() => {
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
      hasMore: allSuites.length === limit // Simple check if there might be more
    };
    
    // Cache the result
    progressiveCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    console.log(`Progressive load for ${city}: ${allSuites.length} additional suites (offset: ${offset})`);
    
    return json(result);
  } catch (err) {
    console.error('Error in progressive loading:', err);
    return json({ suites: [], error: 'Failed to load additional data' }, { status: 500 });
  }
};