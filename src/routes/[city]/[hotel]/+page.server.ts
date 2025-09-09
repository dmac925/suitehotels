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

    // Find the hotel that matches the slug
    const hotel = hotels?.find(h => createSlug(h.name) === hotelSlug);
    
    if (!hotel) {
      return {
        hotel: null,
        suites: [],
        error: 'Hotel not found'
      };
    }
    
    // Process rooms/suites data
    const suites = hotel.rooms?.map((room: any, index: number) => {
      // Parse JSON fields
      const options = room.options ? JSON.parse(room.options) : [];
      const facilities = room.facilities ? JSON.parse(room.facilities) : [];
      const bedTypes = room.bed_types ? JSON.parse(room.bed_types) : [];
      const roomImages = room.images ? JSON.parse(room.images) : [];
      
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
        image: roomImages[0] || hotel.image,
        roomImages: roomImages.length > 0 ? roomImages : [hotel.image],
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