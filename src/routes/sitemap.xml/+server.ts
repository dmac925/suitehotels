import { supabase } from '$lib/supabase';

export async function GET() {
  // Fetch all published developments
  const { data: developments } = await supabase
    .from('developments')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  // Fetch all available and published properties (limit to prevent huge sitemaps)
  const { data: properties } = await supabase
    .from('properties')
    .select('slug, updated_at')
    .eq('is_published', true)
    .eq('is_available', true)
    .order('updated_at', { ascending: false })
    .limit(1000);

  const today = new Date().toISOString().split('T')[0];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage - Highest Priority -->
  <url>
    <loc>https://offmarketprime.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Main Property Pages - High Priority -->
  <url>
    <loc>https://offmarketprime.com/london</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Developments Section - High Priority -->
  <url>
    <loc>https://offmarketprime.com/developments</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Individual Development Pages -->
  ${developments?.map(dev => `<url>
    <loc>https://offmarketprime.com/developments/${dev.slug}</loc>
    <lastmod>${new Date(dev.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n  ') || ''}

  <!-- Individual Property Pages -->
  ${properties?.map(prop => `<url>
    <loc>https://offmarketprime.com/property/${prop.slug}</loc>
    <lastmod>${new Date(prop.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n  ') || ''}

  <!-- Neighborhood Pages - High Priority for SEO -->
  ${[
    'mayfair', 'chelsea', 'kensington', 'knightsbridge', 'belgravia',
    'hampstead', 'notting-hill', 'islington', 'clapham', 'shoreditch',
    'battersea', 'fulham', 'wimbledon', 'richmond', 'putney',
    'st-johns-wood', 'marylebone'
  ].map(neighborhood => `<url>
    <loc>https://offmarketprime.com/london/${neighborhood}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n  ')}

  <!-- User Journey Pages -->
  <url>
    <loc>https://offmarketprime.com/signup</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://offmarketprime.com/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Information Pages -->
  <url>
    <loc>https://offmarketprime.com/how-it-works</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://offmarketprime.com/list-property</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://offmarketprime.com/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Legal Pages -->
  <url>
    <loc>https://offmarketprime.com/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://offmarketprime.com/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://offmarketprime.com/cookies</loc>
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