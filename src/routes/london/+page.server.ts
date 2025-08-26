import { supabase } from '$lib/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    // Only select the fields we actually need for the listing page
    // Use PostgreSQL JSON operators to extract just the first image
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        id,
        slug,
        address,
        neighborhood,
        city,
        postcode,
        property_type,
        price,
        price_display,
        bedrooms,
        bathrooms,
        sqft,
        images->0,
        created_at
      `)
      .eq('is_available', true)
      .eq('city', 'London')
      .order('created_at', { ascending: false })
      .limit(1500); // Reasonable limit to prevent loading thousands of properties

    if (error) {
      console.error('Error loading properties:', error);
      return {
        properties: [],
        error: 'Failed to load properties'
      };
    }

    // Process properties to handle the first image
    const processedProperties = properties?.map(property => {
      let firstImageUrl = null;
      
      // The images field now contains only the first image from the JSON array
      const firstImage = property.images;
      if (firstImage) {
        // Check if it's an object with url property or a direct string
        firstImageUrl = typeof firstImage === 'object' && firstImage.url 
          ? firstImage.url 
          : typeof firstImage === 'string' 
            ? firstImage 
            : null;
      }
      
      return {
        ...property,
        images: firstImageUrl ? [firstImageUrl] : [] // Keep as array for compatibility
      };
    }) || [];

    return {
      properties: processedProperties,
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
