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
    const { city, hotel: hotelSlug } = params;
    
    // Add debugging logs
    console.log('Loading hotel for city:', city, 'hotelSlug:', hotelSlug);
    
    // Query hotel by matching slug
    const { data: hotels, error: hotelError } = await supabase
      .from('hotels')
      .select(`
        *,
        rooms (
          *
        )
      `);

    if (hotelError) {
      console.error('Error fetching hotel from Supabase:', hotelError);
      return {
        hotel: null,
        suites: [],
        error: 'Failed to load hotel data'
      };
    }

    console.log('Total hotels fetched:', hotels?.length);
    
    // Find the hotel that matches the slug
    const hotel = hotels?.find(h => createSlug(h.name) === hotelSlug);
    
    // Debug logging for slug matching
    if (!hotel) {
      console.log('Hotel not found. Available hotels with their slugs:');
      hotels?.forEach(h => {
        const slug = createSlug(h.name);
        console.log(`- "${h.name}" -> "${slug}" (match: ${slug === hotelSlug})`);
      });
    } else {
      console.log('Found hotel:', hotel.name);
    }
    
    if (!hotel) {
      return {
        hotel: null,
        suites: [],
        error: 'Hotel not found'
      };
    }
    
    // Process rooms/suites data - filter out unavailable rooms
    const suites = hotel.rooms?.filter((room: any) => room.available !== false)
      .map((room: any, index: number) => {
      // Parse JSON fields - handle both string and already-parsed data
      const options = room.options ? 
        (typeof room.options === 'string' ? JSON.parse(room.options) : room.options) : [];
      const facilities = room.facilities ? 
        (typeof room.facilities === 'string' ? JSON.parse(room.facilities) : room.facilities) : [];
      const bedTypes = room.bed_types ? 
        (typeof room.bed_types === 'string' ? JSON.parse(room.bed_types) : room.bed_types) : [];
      
      // Handle images field - can be string, array, or single URL
      let roomImages = [];
      if (room.images) {
        if (typeof room.images === 'string') {
          if (room.images.startsWith('[')) {
            roomImages = JSON.parse(room.images);
          } else if (room.images.startsWith('http')) {
            roomImages = [room.images];
          }
        } else if (Array.isArray(room.images)) {
          roomImages = room.images;
        }
      }
      
      // If main_image is set, use it as the first image in the carousel
      let displayImages = roomImages;
      if (room.main_image && roomImages.length > 0) {
        // Remove main_image from array if it exists, then add it to the front
        displayImages = roomImages.filter(img => img !== room.main_image);
        displayImages.unshift(room.main_image);
      } else if (room.main_image && roomImages.length === 0) {
        // If only main_image exists, use it
        displayImages = [room.main_image];
      }
      
      // Use main_image as the primary image, fallback to first image or hotel image
      const primaryImage = room.main_image || roomImages[0] || hotel.image;
      
      return {
        id: room.booking_room_id || room.id || index,
        roomType: room.room_type,
        slug: createSlug(room.room_type),
        persons: room.persons,
        bedTypes: bedTypes,
        facilities: facilities,
        available: room.available,
        roomsLeft: room.rooms_left,
        options: options,
        guidelinePrice: room.guideline_price,
        image: primaryImage,
        roomImages: displayImages.length > 0 ? displayImages : [hotel.image],
        sqft: room.size_sqft,
        sqm: room.size_sqm
      };
    }) || [];
    
    // Transform hotel data for template
    const hotelData = {
      name: hotel.name,
      slug: hotelSlug,
      citySlug: city,
      type: hotel.type,
      description: hotel.description,
      stars: hotel.stars,
      rating: hotel.rating,
      reviews: hotel.reviews,
      breakfast: hotel.breakfast,
      checkIn: hotel.check_in,
      checkOut: hotel.check_out,
      lat: hotel.lat,
      lng: hotel.lng,
      address: {
        full: hotel.address_full,
        street: hotel.street,
        postalCode: hotel.postal_code,
        city: hotel.region,
        country: hotel.country,
        neighbourhood: hotel.neighbourhood || hotel.street?.split(',')[0] || ''
      },
      image: hotel.image,
      // We'll use the first few room images as hotel images if available
      images: suites.flatMap((s: any) => s.roomImages).slice(0, 10),
      // Parse and include amenity fields
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
    };
    
    return {
      hotel: hotelData,
      suites,
      error: null
    };
  } catch (err) {
    console.error('Error loading hotel:', err);
    return {
      hotel: null,
      suites: [],
      error: 'Error loading hotel data'
    };
  }
};