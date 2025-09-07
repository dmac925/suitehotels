import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL || process.env.supabaseUrl,
  process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    // Fetch one hotel to see its structure
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log('Hotel table columns:');
      console.log(Object.keys(data[0]));
      
      // Check specific amenities columns
      const amenityColumns = ['wellness_amenities', 'dining_amenities', 'services_amenities', 'unique_points'];
      console.log('\nAmenity columns present:');
      amenityColumns.forEach(col => {
        if (col in data[0]) {
          console.log(`  ✓ ${col}: ${typeof data[0][col]} - Sample:`, JSON.stringify(data[0][col], null, 2));
        } else {
          console.log(`  ✗ ${col}: NOT FOUND`);
        }
      });
    }
  } catch (err) {
    console.error('Error checking schema:', err);
  }
}

checkSchema();