import { supabase } from '$lib/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    // Fetch all available London properties on the server
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_available', true)
      .eq('city', 'London')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading properties:', error);
      return {
        properties: [],
        error: 'Failed to load properties'
      };
    }

    return {
      properties: properties || [],
      error: null
    };
  } catch (err) {
    console.error('Server error loading properties:', err);
    return {
      properties: [],
      error: 'Server error loading properties'
    };
  }
};
