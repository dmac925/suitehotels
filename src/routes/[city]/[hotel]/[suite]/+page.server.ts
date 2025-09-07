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
    
    // Parse JSON fields for the suite
    const options = suite.options ? JSON.parse(suite.options) : [];
    const facilities = suite.facilities ? JSON.parse(suite.facilities) : [];
    const bedTypes = suite.bed_types ? JSON.parse(suite.bed_types) : [];
    const roomImages = suite.images ? JSON.parse(suite.images) : [];
    
    // Get all room images for the hotel gallery
    const allHotelImages: string[] = [];
    hotel.rooms?.forEach((room: any) => {
      if (room.images) {
        const images = JSON.parse(room.images);
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
        country: hotel.country
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