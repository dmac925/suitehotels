import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    // Fetch the development by slug with all new fields
    const { data: development, error: devError } = await supabase
      .from('developments')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (devError || !development) {
      console.error('Error loading development:', devError);
      throw error(404, 'Development not found');
    }

    // Fetch all available properties in this development
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('development_id', development.id)
      .eq('is_available', true)
      .order('price', { ascending: false });

    if (propError) {
      console.error('Error loading properties:', propError);
    }

    return {
      development,
      properties: properties || [],
      error: null
    };
  } catch (err) {
    console.error('Server error loading development:', err);
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    throw error(500, 'Server error loading development');
  }
};