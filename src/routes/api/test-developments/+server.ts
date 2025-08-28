import { supabase } from '$lib/supabase';
import { json } from '@sveltejs/kit';

export async function GET() {
  // Test query to see what we're getting from developments table
  const { data: developments, error } = await supabase
    .from('developments')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('Error fetching developments:', error);
    return json({ error: error.message, details: error });
  }
  
  return json({
    count: developments?.length || 0,
    hasSlugField: developments && developments.length > 0 ? 'slug' in developments[0] : false,
    firstDevelopment: developments && developments.length > 0 ? developments[0] : null,
    allSlugs: developments?.map(d => d.slug).filter(Boolean)
  });
}