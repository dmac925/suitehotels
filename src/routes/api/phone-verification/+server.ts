import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID } from '$env/static/private';

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map<string, { otp: string; timestamp: number; userId?: string }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean up expired OTPs (older than 10 minutes)
function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) {
      otpStore.delete(phone);
    }
  }
}

export const POST: RequestHandler = async ({ request }) => {
  const { action, phone, otp, userId } = await request.json();

  cleanupExpiredOTPs();

  if (action === 'send') {
    // Generate and store OTP
    const generatedOTP = generateOTP();
    otpStore.set(phone, { 
      otp: generatedOTP, 
      timestamp: Date.now(),
      userId 
    });

    // Send SMS via Twilio REST API
    try {
      // Create Basic Auth header (using btoa for Cloudflare compatibility)
      const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
      
      // Twilio API endpoint
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
      
      // Create form data
      const formData = new URLSearchParams();
      formData.append('Body', `Your Off Market Prime verification code is: ${generatedOTP}`);
      formData.append('MessagingServiceSid', TWILIO_MESSAGING_SERVICE_SID);
      formData.append('To', phone);
      
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Twilio API error: ${response.status}`);
      }

      const messageData = await response.json();
      console.log(`SMS sent successfully to ${phone}. Message SID: ${messageData.sid}`);
      
      // Also log OTP in development for easier testing
      if (import.meta.env.DEV) {
        console.log(`[DEV] OTP for ${phone}: ${generatedOTP}`);
      }
      
      return json({ success: true, message: 'OTP sent successfully' });
    } catch (error: any) {
      console.error('Error sending SMS via Twilio:', error);
      
      // In development, still return success since OTP is stored
      if (import.meta.env.DEV) {
        console.log(`[DEV FALLBACK] OTP for ${phone}: ${generatedOTP}`);
        return json({ success: true, message: 'OTP sent successfully (dev fallback)' });
      }
      
      return json({ success: false, error: 'Failed to send verification code' }, { status: 500 });
    }
  }

  if (action === 'verify') {
    const storedData = otpStore.get(phone);
    
    if (!storedData) {
      return json({ success: false, error: 'OTP expired or not found' }, { status: 400 });
    }

    if (storedData.otp !== otp) {
      return json({ success: false, error: 'Invalid OTP' }, { status: 400 });
    }

    // OTP is valid, remove it from store
    otpStore.delete(phone);

    return json({ 
      success: true, 
      message: 'Phone verified successfully',
      userId: storedData.userId 
    });
  }

  return json({ success: false, error: 'Invalid action' }, { status: 400 });
};
