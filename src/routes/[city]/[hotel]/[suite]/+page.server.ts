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
    const { city, hotel: hotelSlug, suite: suiteSlug } = params;
    
    // Query all hotels with their rooms
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
        suite: null,
        error: 'Failed to load hotel data'
      };
    }

    // Find the hotel that matches the slug
    const hotel = hotels?.find(h => createSlug(h.name) === hotelSlug);
    
    if (!hotel) {
      return {
        hotel: null,
        suite: null,
        error: 'Hotel not found'
      };
    }
    
    // Find the suite/room
    const suite = hotel.rooms?.find((room: any) => {
      const roomSlug = createSlug(room.room_type);
      return roomSlug === suiteSlug;
    });
    
    if (!suite) {
      return {
        hotel: null,
        suite: null,
        error: 'Suite not found'
      };
    }
    
    // Parse JSON fields for the suite - handle both string and already-parsed data
    const options = suite.options ? 
      (typeof suite.options === 'string' ? JSON.parse(suite.options) : suite.options) : [];
    const facilities = suite.facilities ? 
      (typeof suite.facilities === 'string' ? JSON.parse(suite.facilities) : suite.facilities) : [];
    const bedTypes = suite.bed_types ? 
      (typeof suite.bed_types === 'string' ? JSON.parse(suite.bed_types) : suite.bed_types) : [];
    
    // Handle images field - can be string, array, or single URL
    let roomImages = [];
    if (suite.images) {
      if (typeof suite.images === 'string') {
        if (suite.images.startsWith('[')) {
          roomImages = JSON.parse(suite.images);
        } else if (suite.images.startsWith('http')) {
          roomImages = [suite.images];
        }
      } else if (Array.isArray(suite.images)) {
        roomImages = suite.images;
      }
    }
    
    // Get all room images for the hotel gallery
    const allHotelImages: string[] = [];
    hotel.rooms?.forEach((room: any) => {
      if (room.images) {
        let images = [];
        if (typeof room.images === 'string') {
          if (room.images.startsWith('[')) {
            images = JSON.parse(room.images);
          } else if (room.images.startsWith('http')) {
            images = [room.images];
          }
        } else if (Array.isArray(room.images)) {
          images = room.images;
        }
        allHotelImages.push(...images);
      }
    });
    
    // Transform hotel data
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
      images: allHotelImages.length > 0 ? allHotelImages : [hotel.image]
    };
    
    // Transform suite data
    const suiteData = {
      id: suite.booking_room_id,
      roomType: suite.room_type,
      slug: suiteSlug,
      persons: suite.persons,
      bedTypes: bedTypes,
      facilities: facilities,
      available: suite.available,
      roomsLeft: suite.rooms_left,
      isPartnerOfferRoom: suite.is_partner_offer_room,
      options: options,
      guidelinePrice: suite.guideline_price,
      image: roomImages[0] || hotel.image,
      roomImages: roomImages.length > 0 ? roomImages : [hotel.image],
      sqft: suite.size_sqft,
      sqm: suite.size_sqm
    };
    
    return {
      hotel: hotelData,
      suite: suiteData,
      error: null
    };
  } catch (err) {
    console.error('Error loading suite:', err);
    return {
      hotel: null,
      suite: null,
      error: 'Error loading suite data'
    };
  }
};