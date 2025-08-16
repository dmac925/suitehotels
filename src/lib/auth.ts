import { supabase, type UserProfile, type PropertyListing } from './supabase';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

// Authentication utilities
export class AuthService {
  // Sign up new user
  static async signUp(email: string, password: string, userData: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: userData.phone || '',
          }
        }
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Supabase auth user created:', data.user?.id);

      // If user is created, update their profile with additional data
      if (data.user && !error) {
        console.log('Updating user profile with data:', userData);
        const profileResult = await this.updateUserProfile(data.user.id, userData);
        if (profileResult.error) {
          console.error('Profile update failed during signup:', profileResult.error);
          console.error('Profile error details:', JSON.stringify(profileResult.error, null, 2));
          // Don't throw error here, as the user account was created successfully
        } else {
          console.log('Profile updated successfully during signup');
        }
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      console.error('Sign up error type:', typeof error);
      console.error('Sign up error details:', JSON.stringify(error, null, 2));
      return { user: null, error: error.message || error };
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message };
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      if (browser) {
        goto('/');
      }
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return { user: null, error: error.message };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error: any) {
      console.error('Get user profile error:', error);
      return { profile: null, error: error.message };
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      console.log('Updating user profile for:', userId);
      console.log('Updates:', updates);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating profile:', error);
        throw error;
      }
      
      console.log('Profile updated successfully:', data);
      return { profile: data, error: null };
    } catch (error: any) {
      console.error('Update user profile error:', error);
      return { profile: null, error: error.message };
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: error.message };
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { error: error.message };
    }
  }

  // Update phone number for existing user
  static async updatePhoneNumber(phone: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        phone: phone
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Update phone error:', error);
      return { error: error.message };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  }

  // Subscribe to auth state changes
  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }

  // Send OTP to phone number
  static async sendPhoneOTP(phone: string) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Send phone OTP error:', error);
      return { error: error.message };
    }
  }

  // Verify phone OTP
  static async verifyPhoneOTP(phone: string, otp: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Verify phone OTP error:', error);
      return { user: null, error: error.message };
    }
  }

  // Sign up with phone number (for verification step)
  static async signUpWithPhone(email: string, password: string, phone: string, userData: Partial<UserProfile>) {
    try {
      // First create the user with email/password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            phone: phone,
          }
        }
      });

      if (authError) throw authError;

      // If user is created, update their profile with additional data
      if (authData.user && !authError) {
        const profileResult = await this.updateUserProfile(authData.user.id, {
          ...userData,
          phone: phone
        });
        if (profileResult.error) {
          console.error('Profile update failed during signup:', profileResult.error);
        }
      }

      // Send phone verification OTP
      const { error: otpError } = await this.sendPhoneOTP(phone);
      if (otpError) {
        console.error('Failed to send phone OTP:', otpError);
        // Don't fail the whole signup process if OTP fails
      }

      return { user: authData.user, error: null };
    } catch (error: any) {
      console.error('Sign up with phone error:', error);
      return { user: null, error: error.message || error };
    }
  }
}

// Property service for database operations
export class PropertyService {
  // Get all available properties
  static async getProperties(filters?: {
    neighborhood?: string;
    property_type?: string;
    min_price?: number;
    max_price?: number;
    min_bedrooms?: number;
    max_bedrooms?: number;
  }) {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (filters) {
        if (filters.neighborhood) {
          query = query.eq('neighborhood', filters.neighborhood);
        }
        if (filters.property_type) {
          query = query.eq('property_type', filters.property_type);
        }
        if (filters.min_price) {
          query = query.gte('price', filters.min_price);
        }
        if (filters.max_price) {
          query = query.lte('price', filters.max_price);
        }
        if (filters.min_bedrooms) {
          query = query.gte('bedrooms', filters.min_bedrooms);
        }
        if (filters.max_bedrooms) {
          query = query.lte('bedrooms', filters.max_bedrooms);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return { properties: data, error: null };
    } catch (error: any) {
      console.error('Get properties error:', error);
      return { properties: [], error: error.message };
    }
  }

  // Get single property by ID
  static async getProperty(id: string) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('is_available', true)
        .single();

      if (error) throw error;
      return { property: data, error: null };
    } catch (error: any) {
      console.error('Get property error:', error);
      return { property: null, error: error.message };
    }
  }

  // Record property interest (view, favorite, etc.)
  static async recordPropertyInterest(
    userId: string,
    propertyId: string,
    interestType: 'view' | 'favorite' | 'viewing_request' | 'inquiry',
    additionalData?: { message?: string; viewing_requested_date?: string }
  ) {
    try {
      const { data, error } = await supabase
        .from('property_interests')
        .upsert({
          user_id: userId,
          property_id: propertyId,
          interest_type: interestType,
          ...additionalData
        })
        .select()
        .single();

      if (error) throw error;
      return { interest: data, error: null };
    } catch (error: any) {
      console.error('Record property interest error:', error);
      return { interest: null, error: error.message };
    }
  }

  // Get user's property interests
  static async getUserPropertyInterests(userId: string, interestType?: string) {
    try {
      let query = supabase
        .from('property_interests')
        .select(`
          *,
          properties (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (interestType) {
        query = query.eq('interest_type', interestType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { interests: data, error: null };
    } catch (error: any) {
      console.error('Get user property interests error:', error);
      return { interests: [], error: error.message };
    }
  }

  // Submit property listing
  static async submitPropertyListing(userId: string, listingData: Omit<PropertyListing, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('property_listings')
        .insert({
          user_id: userId,
          ...listingData
        })
        .select()
        .single();

      if (error) throw error;
      return { listing: data, error: null };
    } catch (error: any) {
      console.error('Submit property listing error:', error);
      return { listing: null, error: error.message };
    }
  }
}

// Activity tracking
export class ActivityService {
  // Track user activity
  static async trackActivity(
    userId: string | null,
    activityType: string,
    activityData?: any,
    metadata?: { ip_address?: string; user_agent?: string }
  ) {
    try {
      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData,
          ip_address: metadata?.ip_address,
          user_agent: metadata?.user_agent
        });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Track activity error:', error);
      return { error: error.message };
    }
  }
}
