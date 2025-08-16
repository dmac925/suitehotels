import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';

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

    // In development, log the OTP
    if (import.meta.env.DEV) {
      console.log(`[DEV] OTP for ${phone}: ${generatedOTP}`);
    }

    // In production, you would send SMS via Twilio API directly
    // For now, we'll simulate it
    try {
      // TODO: Implement direct Twilio integration
      // const twilioClient = twilio(accountSid, authToken);
      // await twilioClient.messages.create({
      //   body: `Your Off Market Prime verification code is: ${generatedOTP}`,
      //   from: twilioPhoneNumber,
      //   to: phone
      // });

      // For development/testing, just log the OTP
      console.log(`[OTP] Verification code for ${phone}: ${generatedOTP}`);
      
      return json({ success: true, message: 'OTP sent successfully' });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
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
