import { supabase } from '$lib/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    // Fetch all developments
    const { data: developments, error: devError } = await supabase
      .from('developments')
      .select('*')
      .order('name', { ascending: true });

    if (devError) {
      console.error('Error loading developments:', devError);
      return {
        developments: [],
        error: 'Failed to load developments'
      };
    }

    // For each development, get the count of available properties
    const developmentsWithCounts = await Promise.all(
      (developments || []).map(async (dev) => {
        const { count, error: countError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('development_id', dev.id)
          .eq('is_available', true);

        if (countError) {
          console.error(`Error counting properties for development ${dev.id}:`, countError);
        }

        return {
          ...dev,
          available_properties_count: count || 0
        };
      })
    );

    return {
      developments: developmentsWithCounts,
      error: null
    };
  } catch (err) {
    console.error('Server error loading developments:', err);
    return {
      developments: [],
      error: 'Server error loading developments'
    };
  }
};