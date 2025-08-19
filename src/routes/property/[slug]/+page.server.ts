import { supabase } from '$lib/supabase';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { slug } = params;
  
  if (!slug) {
    throw error(400, 'Property slug is required');
  }

  try {
    // Fetch property by slug from Supabase
    const { data: property, error: supabaseError } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .eq('is_available', true)
      .single();

    if (supabaseError) {
      console.error('Error loading property:', supabaseError);
      
      // If property not found, redirect to London properties page
      if (supabaseError.code === 'PGRST116') {
        throw redirect(302, '/london');
      }
      
      throw error(500, 'Failed to load property');
    }

    if (!property) {
      throw redirect(302, '/london');
    }

    return {
      property,
      error: null
    };
  } catch (err) {
    console.error('Server error loading property:', err);
    
    // If it's already a SvelteKit error or redirect, re-throw it
    if (err.status) {
      throw err;
    }
    
    throw error(500, 'Server error loading property');
  }
};
