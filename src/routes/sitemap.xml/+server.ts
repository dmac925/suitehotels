import { supabase } from '$lib/supabaseClient';

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  // Popular cities that should always be included
  const staticCities = [
    'london',
    'paris',
    'new-york',
    'dubai',
    'tokyo',
    'rome',
    'barcelona',
    'berlin'
  ];

  // Fetch all hotels with their rooms
  const { data: hotels, error: hotelError } = await supabase
    .from('hotels')
    .select(`
      name,
      region,
      updated_at,
      rooms (
        room_type,
        available,
        updated_at
      )
    `)
    .order('updated_at', { ascending: false });
  
  if (hotelError) {
    console.error('Error fetching hotels for sitemap:', hotelError);
  }
  
  // Process hotels and create hotel/suite URLs
  const hotelUrls: any[] = [];
  const suiteUrls: any[] = [];
  const dynamicCities = new Set<string>();
  
  if (hotels) {
    for (const hotel of hotels) {
      // Create city slug from region
      const citySlug = createSlug(hotel.region || 'london');
      const hotelSlug = createSlug(hotel.name);
      
      dynamicCities.add(citySlug);
      
      // Add hotel URL
      hotelUrls.push({
        city: citySlug,
        hotel: hotelSlug,
        updated: hotel.updated_at
      });
      
      // Add suite URLs
      if (hotel.rooms && Array.isArray(hotel.rooms)) {
        for (const room of hotel.rooms) {
          if (room.available !== false && room.room_type) {
            const roomSlug = createSlug(room.room_type);
            suiteUrls.push({
              city: citySlug,
              hotel: hotelSlug,
              room: roomSlug,
              updated: room.updated_at || hotel.updated_at
            });
          }
        }
      }
    }
  }
  
  // Combine static and dynamic cities
  const cities = [...new Set([...staticCities, ...dynamicCities])];

  const today = new Date().toISOString().split('T')[0];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage - Highest Priority -->
  <url>
    <loc>https://suitetheory.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- City Pages - High Priority -->
  ${cities.map(city => `<url>
    <loc>https://suitetheory.com/${city}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n  ')}

  <!-- Hotel Pages - High Priority -->
  ${hotelUrls.map(hotel => `<url>
    <loc>https://suitetheory.com/${hotel.city}/${hotel.hotel}</loc>
    <lastmod>${hotel.updated ? new Date(hotel.updated).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n  ')}

  <!-- Suite Pages - Medium Priority -->
  ${suiteUrls.map(suite => `<url>
    <loc>https://suitetheory.com/${suite.city}/${suite.hotel}/${suite.room}</loc>
    <lastmod>${suite.updated ? new Date(suite.updated).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n  ')}

  <!-- User Journey Pages -->
  <url>
    <loc>https://suitetheory.com/signup</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Service Pages -->
  <url>
    <loc>https://suitetheory.com/luxury-suites</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/business-travel</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/concierge</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/group-bookings</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Information Pages -->
  <url>
    <loc>https://suitetheory.com/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/help</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/cancellation</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <!-- Legal Pages -->
  <url>
    <loc>https://suitetheory.com/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://suitetheory.com/cookies</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600' // Cache for 1 hour
    }
  });
}