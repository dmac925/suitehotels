import { supabase } from '$lib/supabaseClient';

export async function GET() {
  // Fetch all hotels with their cities
  const { data: hotels, error: hotelError } = await supabase
    .from('hotels')
    .select('slug, city, updated_at')
    .order('updated_at', { ascending: false });
  
  if (hotelError) {
    console.error('Error fetching hotels for sitemap:', hotelError);
  }
  
  // Fetch all suites with their hotel and city information
  const { data: suites, error: suiteError } = await supabase
    .from('suites')
    .select('slug, hotel_slug, city, updated_at')
    .order('updated_at', { ascending: false });
  
  if (suiteError) {
    console.error('Error fetching suites for sitemap:', suiteError);
  }
  
  // Get unique cities from hotels
  const cities = [...new Set(hotels?.map(h => h.city) || [])];

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
  ${hotels?.map(hotel => `<url>
    <loc>https://suitetheory.com/${hotel.city}/${hotel.slug}</loc>
    <lastmod>${hotel.updated_at ? new Date(hotel.updated_at).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n  ') || ''}

  <!-- Suite Pages - Medium Priority -->
  ${suites?.map(suite => `<url>
    <loc>https://suitetheory.com/${suite.city}/${suite.hotel_slug}/${suite.slug}</loc>
    <lastmod>${suite.updated_at ? new Date(suite.updated_at).toISOString().split('T')[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n  ') || ''}

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