import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';
import { EmailService } from '$lib/email';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.user_name || !data.user_email || !data.property_id) {
      return json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Save to Supabase
    const { data: savedRequest, error: dbError } = await supabase
      .from('viewing_requests')
      .insert([
        {
          property_id: data.property_id,
          property_title: data.property_title,
          property_location: data.property_location,
          property_price: data.property_price,
          user_name: data.user_name,
          user_email: data.user_email,
          user_phone: data.user_phone || null,
          message: data.message || null,
          user_id: data.user_id || null,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return json(
        { error: 'Failed to save request' },
        { status: 500 }
      );
    }
    
    // Send email notification
    try {
      await EmailService.sendViewingRequestEmail({
        to: 'hello@offmarketprime.com', // Your notification email
        propertyTitle: data.property_title,
        propertyLocation: data.property_location,
        propertyPrice: data.property_price,
        userName: data.user_name,
        userEmail: data.user_email,
        userPhone: data.user_phone,
        message: data.message,
        requestId: savedRequest.id
      });
      
      // Send confirmation email to user
      await EmailService.sendViewingRequestConfirmation({
        to: data.user_email,
        userName: data.user_name,
        propertyTitle: data.property_title,
        propertyLocation: data.property_location,
        propertyPrice: data.property_price
      });
      
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the request if email fails, but log it
    }
    
    return json({ 
      success: true, 
      message: 'Viewing request submitted successfully',
      requestId: savedRequest.id 
    });
    
  } catch (error) {
    console.error('Error processing viewing request:', error);
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
