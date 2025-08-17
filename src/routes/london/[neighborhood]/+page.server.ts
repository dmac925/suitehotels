import { supabase } from '$lib/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { neighborhood } = params;
  
  if (!neighborhood) {
    return {
      properties: [],
      error: 'Neighborhood not specified'
    };
  }

  try {
    // Convert slug back to proper neighborhood name for database query
    const neighborhoodName = neighborhood.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Fetch neighborhood-specific properties on the server
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_available', true)
      .eq('city', 'London')
      .ilike('neighborhood', neighborhoodName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading neighborhood properties:', error);
      return {
        properties: [],
        error: 'Failed to load properties',
        neighborhood
      };
    }

    return {
      properties: properties || [],
      error: null,
      neighborhood
    };
  } catch (err) {
    console.error('Server error loading neighborhood properties:', err);
    return {
      properties: [],
      error: 'Server error loading properties',
      neighborhood
    };
  }
};
