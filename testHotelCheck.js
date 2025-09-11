import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import hotelData from './src/lib/data/london_sept.json' with { type: 'json' };

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testHotelCheck() {
  try {
    console.log('=== DRY RUN: Checking which hotels would be added ===');
    console.log(`Found ${hotelData.length} hotels in JSON file\n`);

    let existingCount = 0;
    let missingCount = 0;
    const missingHotels = [];

    for (const hotel of hotelData) {
      // Check if hotel already exists (by URL)
      const { data: existingHotel, error: checkError } = await supabase
        .from('hotels')
        .select('id, name')
        .eq('url', hotel.url)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`Error checking hotel "${hotel.name}":`, checkError.message);
        continue;
      }

      if (existingHotel) {
        console.log(`✓ EXISTS: ${hotel.name}`);
        existingCount++;
      } else {
        console.log(`➕ MISSING: ${hotel.name}`);
        missingHotels.push({
          name: hotel.name,
          url: hotel.url,
          address: hotel.address?.full
        });
        missingCount++;
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total hotels in JSON: ${hotelData.length}`);
    console.log(`Already in database: ${existingCount}`);
    console.log(`Missing from database: ${missingCount}`);

    if (missingCount > 0) {
      console.log('\n=== HOTELS THAT WOULD BE ADDED ===');
      missingHotels.forEach((hotel, index) => {
        console.log(`${index + 1}. ${hotel.name}`);
        console.log(`   URL: ${hotel.url}`);
        console.log(`   Address: ${hotel.address || 'N/A'}\n`);
      });
    }

    console.log('✓ Dry run complete - no changes made to database');
  } catch (error) {
    console.error('Error during check:', error);
  }
}

// Run the test
testHotelCheck();