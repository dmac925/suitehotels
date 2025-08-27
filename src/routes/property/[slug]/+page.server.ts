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

    // If property has a development_id, fetch other properties in the same development
    let developmentProperties = [];
    let developmentInfo = null;
    
    if (property.development_id) {
      // Fetch other properties in the same development
      const { data: relatedProperties, error: relatedError } = await supabase
        .from('properties')
        .select('*')
        .eq('development_id', property.development_id)
        .eq('is_available', true)
        .eq('is_published', true)
        .order('price', { ascending: false })
        .limit(9); // Limit to 9 properties (including current one)
      
      if (!relatedError && relatedProperties) {
        developmentProperties = relatedProperties;
      }
      
      // Optionally fetch development info if you have a developments table
      const { data: development } = await supabase
        .from('developments')
        .select('*')
        .eq('id', property.development_id)
        .single();
      
      if (development) {
        developmentInfo = development;
      }
    }

    return {
      property,
      developmentProperties,
      developmentInfo,
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
