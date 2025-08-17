import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';

export const POST: RequestHandler = async ({ request }) => {
  const { email } = await request.json();

  if (!email) {
    return json({ exists: false }, { status: 400 });
  }

  try {
    // Check if user exists in auth.users (via profiles table)
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, profile_completed, email')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      // No user found with this email
      if (error.code === 'PGRST116') {
        return json({ exists: false });
      }
      throw error;
    }

    // User exists
    return json({
      exists: true,
      profileCompleted: profile.profile_completed || false,
      userId: profile.id
    });

  } catch (error: any) {
    console.error('Error checking email:', error);
    return json({ error: 'Failed to check email' }, { status: 500 });
  }
};
