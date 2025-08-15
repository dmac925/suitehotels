<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Mail, CheckCircle, ArrowLeft } from 'lucide-svelte';
  import { AuthService } from '$lib/auth';
  
  let userEmail = '';
  let isResending = false;
  let resendMessage = '';
  let redirectPath = '';
  
  onMount(async () => {
    // Get redirect path from URL params
    redirectPath = $page.url.searchParams.get('redirect') || '/dashboard';
    
    // Get current user email
    const { user } = await AuthService.getCurrentUser();
    if (user) {
      userEmail = user.email || '';
      
      // If email is already confirmed, redirect to intended destination
      if (user.email_confirmed_at) {
        goto(redirectPath);
        return;
      }
    } else {
      // Not logged in, redirect to login
      goto('/login');
      return;
    }
  });
  
  const handleResendEmail = async () => {
    if (!userEmail) return;
    
    isResending = true;
    resendMessage = '';
    
    try {
      const { error } = await AuthService.resetPassword(userEmail);
      if (error) {
        resendMessage = 'Failed to resend email. Please try again.';
      } else {
        resendMessage = 'Verification email sent! Please check your inbox.';
      }
    } catch (error) {
      resendMessage = 'Failed to resend email. Please try again.';
    } finally {
      isResending = false;
    }
  };
</script>

<svelte:head>
  <title>Verify Your Email - Off Market Prime</title>
  <meta name="description" content="Please verify your email address to access exclusive off-market properties." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-luxury-pearl to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Back Button -->
    <div class="text-left">
      <button 
        on:click={() => window.history.back()} 
        class="inline-flex items-center text-luxury-blue hover:text-blue-700 transition-colors"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back
      </button>
    </div>
    
    <!-- Icon -->
    <div class="text-center">
      <div class="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
        <Mail class="h-10 w-10 text-luxury-blue" />
      </div>
    </div>
    
    <!-- Content -->
    <div class="text-center">
      <h1 class="luxury-heading text-3xl mb-4">Please Verify Your Email</h1>
      <p class="luxury-text text-lg mb-6">
        To access exclusive off-market properties, please verify your email address.
      </p>
      
      {#if userEmail}
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <p class="text-sm text-gray-600 mb-4">
            We sent a verification email to:
          </p>
          <p class="font-medium text-gray-900 text-lg mb-4">
            {userEmail}
          </p>
          <p class="text-sm text-gray-600">
            Click the link in the email to verify your account and gain access to premium properties.
          </p>
        </div>
      {/if}
      
      <!-- Resend Email Section -->
      <div class="space-y-4">
        {#if resendMessage}
          <div class="bg-green-50 border border-green-200 rounded-md p-3">
            <div class="flex items-center">
              <CheckCircle class="h-5 w-5 text-green-400 mr-2" />
              <p class="text-sm text-green-600">{resendMessage}</p>
            </div>
          </div>
        {/if}
        
        <p class="text-sm text-gray-600">
          Didn't receive the email?
        </p>
        
        <button
          on:click={handleResendEmail}
          disabled={isResending}
          class="luxury-button rounded-md px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </div>
      
      <!-- Help Text -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-500">
          Check your spam folder if you don't see the email.
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Need help? Contact us at 
          <a href="mailto:hello@offmarketprime.com" class="text-luxury-blue hover:underline">
            hello@offmarketprime.com
          </a>
        </p>
      </div>
    </div>
  </div>
</div>
