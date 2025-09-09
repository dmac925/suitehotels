import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import hotelData from './src/lib/data/nyc_sept.json' with { type: 'json' };

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper function to extract room size from facilities
function extractRoomSize(facilities) {
  if (!facilities || !Array.isArray(facilities)) {
    return { size_sqft: null, size_sqm: null };
  }

  // Look for size in facilities (e.g., "194 feet²", "18 m²")
  const sizeEntry = facilities.find(f => 
    typeof f === 'string' && (f.includes('feet²') || f.includes('ft²') || f.includes('m²') || f.includes('sqm'))
  );

  if (!sizeEntry) {
    return { size_sqft: null, size_sqm: null };
  }

  // Parse the number from the string - handle comma-separated thousands
  const match = sizeEntry.match(/([\d,]+(?:\.\d+)?)\s*(feet²|ft²|m²|sqm)/i);
  if (!match) {
    return { size_sqft: null, size_sqm: null };
  }

  const size = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2].toLowerCase();

  // Convert based on unit
  if (unit.includes('feet') || unit.includes('ft')) {
    return {
      size_sqft: size,
      size_sqm: Math.round(size * 0.092903 * 100) / 100 // Convert sqft to sqm, round to 2 decimals
    };
  } else if (unit.includes('m') || unit.includes('sqm')) {
    return {
      size_sqft: Math.round(size / 0.092903 * 100) / 100, // Convert sqm to sqft, round to 2 decimals
      size_sqm: size
    };
  }

  return { size_sqft: null, size_sqm: null };
}

// Helper function to build room images map
function buildRoomImagesMap(roomImages) {
  const roomImageMap = {};
  
  if (!roomImages || !Array.isArray(roomImages)) {
    return roomImageMap;
  }

  roomImages.forEach(image => {
    if (image.associatedRoomIds && Array.isArray(image.associatedRoomIds)) {
      image.associatedRoomIds.forEach(roomId => {
        if (!roomImageMap[roomId]) {
          roomImageMap[roomId] = [];
        }
        // Store the large URL (not the thumb URL)
        roomImageMap[roomId].push(image.largeUrl);
      });
    }
  });

  return roomImageMap;
}

// Helper function to calculate guideline price (rounded to nearest $50)
function calculateGuidelinePrice(options) {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return null;
  }

  // Find the cheapest option with taxes included
  let lowestPriceWithTax = Infinity;
  
  for (const option of options) {
    // Calculate total price including taxes
    const displayedPrice = option.displayedPrice || 0;
    const taxesPrice = option.excludedTaxesPrice || 0;
    const totalPrice = displayedPrice + taxesPrice;
    
    if (totalPrice > 0 && totalPrice < lowestPriceWithTax) {
      lowestPriceWithTax = totalPrice;
    }
  }

  if (lowestPriceWithTax === Infinity) {
    return null;
  }

  // Round to nearest $50
  return Math.round(lowestPriceWithTax / 50) * 50;
}

// Helper function to extract UK postal code from address
function extractPostalCode(addressFull) {
  if (!addressFull) return null;
  
  // UK postal code pattern: matches formats like SW7 4LL, E1 3JK, SW14 9JK, W1D 7DT, etc.
  const ukPostalCodePattern = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/i;
  const match = addressFull.match(ukPostalCodePattern);
  
  if (match) {
    // Ensure proper formatting with space
    const postcode = match[1].toUpperCase();
    // Add space if not present (between outward and inward code)
    if (!postcode.includes(' ') && postcode.length >= 5) {
      return postcode.slice(0, -3) + ' ' + postcode.slice(-3);
    }
    return postcode;
  }
  
  return null;
}

async function uploadHotelsToSupabase() {
  try {
    console.log('Starting upload process...');
    console.log(`Found ${hotelData.length} hotels to process`);

    let hotelsInserted = 0;
    let hotelsSkipped = 0;
    let roomsInserted = 0;
    let errors = [];

    for (const hotel of hotelData) {
      try {
        // First check if hotel already exists
        const { data: existingHotel, error: checkError } = await supabase
          .from('hotels')
          .select('id')
          .eq('booking_id', hotel.order)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is expected for new hotels
          console.error(`Error checking hotel "${hotel.name}":`, checkError.message);
          errors.push({ hotel: hotel.name, error: checkError.message });
          continue;
        }

        // Check if this hotel already has rooms
        if (existingHotel) {
          const { data: existingRooms, error: roomCheckError } = await supabase
            .from('rooms')
            .select('id')
            .eq('hotel_id', existingHotel.id)
            .limit(1);

          if (!roomCheckError && existingRooms && existingRooms.length > 0) {
            console.log(`⏭ Skipping already processed hotel: ${hotel.name} (has rooms)`);
            hotelsSkipped++;
            continue;
          }
        }

        // Extract postal code from full address
        const extractedPostalCode = extractPostalCode(hotel.address?.full);
        
        // Prepare hotel data
        const hotelRecord = {
          booking_id: hotel.order,
          url: hotel.url,
          name: hotel.name,
          type: hotel.type,
          description: hotel.description,
          stars: hotel.stars,
          rating: hotel.rating,
          reviews: hotel.reviews,
          breakfast: hotel.breakfast,
          check_in: hotel.checkIn,
          check_out: hotel.checkOut,
          lat: hotel.location?.lat ? parseFloat(hotel.location.lat) : null,
          lng: hotel.location?.lng ? parseFloat(hotel.location.lng) : null,
          address_full: hotel.address?.full,
          postal_code: extractedPostalCode || hotel.address?.postalCode,
          country: hotel.address?.country,
          region: hotel.address?.city || hotel.address?.region,  // Use city for region field
          image: hotel.image
        };

        let insertedHotel;
        
        if (existingHotel) {
          // Update existing hotel that hasn't been processed yet
          const { data: updatedHotel, error: updateError } = await supabase
            .from('hotels')
            .update(hotelRecord)
            .eq('id', existingHotel.id)
            .select()
            .single();

          if (updateError) {
            console.error(`Error updating hotel "${hotel.name}":`, updateError.message);
            errors.push({ hotel: hotel.name, error: updateError.message });
            continue;
          }
          
          insertedHotel = updatedHotel;
          console.log(`✓ Updated hotel: ${hotel.name}`);
        } else {
          // Insert new hotel
          const { data: newHotel, error: hotelError } = await supabase
            .from('hotels')
            .insert([hotelRecord])
            .select()
            .single();

          if (hotelError) {
            console.error(`Error inserting hotel "${hotel.name}":`, hotelError.message);
            errors.push({ hotel: hotel.name, error: hotelError.message });
            continue;
          }
          
          insertedHotel = newHotel;
          console.log(`✓ Inserted hotel: ${hotel.name}`);
        }
        
        hotelsInserted++;

        // Build room images map for this hotel
        const roomImageMap = buildRoomImagesMap(hotel.roomImages);

        // Insert rooms for this hotel
        if (hotel.rooms && hotel.rooms.length > 0) {
          for (const room of hotel.rooms) {
            try {
              // Extract room size from facilities
              const roomSize = extractRoomSize(room.facilities);

              // Get images for this room
              const roomImages = roomImageMap[room.id] || [];

              // Calculate guideline price
              const guidelinePrice = calculateGuidelinePrice(room.options);

              const roomRecord = {
                hotel_id: insertedHotel.id,
                booking_room_id: room.id,
                url: room.url,
                room_type: room.roomType,
                persons: room.persons,
                size_sqft: roomSize.size_sqft,
                size_sqm: roomSize.size_sqm,
                guideline_price: guidelinePrice,
                bed_types: room.bedTypes ? JSON.stringify(room.bedTypes) : null,
                facilities: room.facilities ? JSON.stringify(room.facilities) : null,
                images: roomImages.length > 0 ? JSON.stringify(roomImages) : null,
                is_partner_offer_room: room.isPartnerOfferRoom,
                rooms_left: room.roomsLeft,
                available: room.available
              };

              const { error: roomError } = await supabase
                .from('rooms')
                .insert([roomRecord]);

              if (roomError) {
                console.error(`  Error inserting room for hotel "${hotel.name}":`, roomError.message);
                errors.push({ hotel: hotel.name, room: room.roomType, error: roomError.message });
              } else {
                console.log(`  ✓ Inserted room: ${room.roomType}`);
                roomsInserted++;
              }
            } catch (roomError) {
              console.error(`  Unexpected error inserting room:`, roomError);
              errors.push({ hotel: hotel.name, room: room.roomType, error: roomError.message });
            }
          }
        }
      } catch (hotelError) {
        console.error(`Unexpected error processing hotel "${hotel.name}":`, hotelError);
        errors.push({ hotel: hotel.name, error: hotelError.message });
      }
    }

    console.log('\n=== Upload Summary ===');
    console.log(`Hotels processed: ${hotelsInserted}/${hotelData.length}`);
    console.log(`Hotels skipped (already processed): ${hotelsSkipped}`);
    console.log(`Rooms inserted: ${roomsInserted}`);
    
    if (errors.length > 0) {
      console.log(`\nErrors encountered: ${errors.length}`);
      console.log('Error details:', JSON.stringify(errors, null, 2));
    }

    console.log('\nUpload process completed!');
  } catch (error) {
    console.error('Fatal error during upload:', error);
    process.exit(1);
  }
}

// Run the upload
uploadHotelsToSupabase();