<script lang="ts">
  import { Lock, Eye, EyeOff } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { AuthService } from '$lib/auth';
  
  let email = '';
  let password = '';
  let rememberMe = false;
  let showPassword = false;
  let isLoading = false;
  let errorMessage = '';
  let successMessage = '';
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    errorMessage = '';
    successMessage = '';
    isLoading = true;
    
    if (!email || !password) {
      errorMessage = 'Please enter both email and password';
      isLoading = false;
      return;
    }
    
    try {
      const { user, error } = await AuthService.signIn(email, password);

      if (error) {
        throw new Error(error);
      }

      if (user) {
        // Check for redirect parameter
        const redirectTo = $page.url.searchParams.get('redirect');
        
        // Check if user has completed onboarding
        const { profile } = await AuthService.getUserProfile(user.id);

        if (profile && profile.profile_completed) {
          // If there's a redirect parameter, go there, otherwise dashboard
          goto(redirectTo || '/dashboard');
        } else {
          goto('/onboarding');
        }
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else {
        errorMessage = error.message || 'An error occurred. Please try again.';
      }
    } finally {
      isLoading = false;
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      errorMessage = 'Please enter your email address first';
      return;
    }

    try {
      const { error } = await AuthService.resetPassword(email);
      if (error) {
        throw new Error(error);
      }
      
      successMessage = 'Password reset email sent! Check your inbox.';
      errorMessage = '';
    } catch (error: any) {
      errorMessage = error.message || 'Failed to send reset email. Please try again.';
    }
  };
</script>

<svelte:head>
  <title>Sign In - Off Market Prime | Access Your Account</title>
  <meta name="description" content="Sign in to your Off Market Prime account to access exclusive off-market luxury properties in London." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-luxury-pearl to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full">
    
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="luxury-heading text-3xl mb-2">Welcome Back</h1>
      <p class="luxury-text">Sign in to access exclusive properties</p>
    </div>
    
    <!-- Login Form -->
    <div class="luxury-card rounded-2xl p-8">
      <form on:submit={handleSubmit} class="space-y-6">
        {#if errorMessage}
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <p class="text-sm text-red-600">{errorMessage}</p>
          </div>
        {/if}

        {#if successMessage}
          <div class="bg-green-50 border border-green-200 rounded-md p-4">
            <p class="text-sm text-green-600">{successMessage}</p>
          </div>
        {/if}
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            bind:value={email}
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue transition-colors"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div class="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              bind:value={password}
              required
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue transition-colors"
              placeholder="Enter your password"
            />
            <button
              type="button"
              on:click={() => showPassword = !showPassword}
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              {#if showPassword}
                <EyeOff class="h-5 w-5" />
              {:else}
                <Eye class="h-5 w-5" />
              {/if}
            </button>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              bind:checked={rememberMe}
              class="h-4 w-4 text-luxury-blue focus:ring-luxury-blue border-gray-300 rounded"
            />
            <label for="rememberMe" class="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>

        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          class="w-full luxury-button rounded-md py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div class="text-center mt-4">
          <button
            type="button"
            on:click={handleForgotPassword}
            class="text-sm text-luxury-blue hover:text-blue-700 underline"
          >
            Forgot your password?
          </button>
        </div>
      </form>
      
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Don't have an account?</span>
          </div>
        </div>
        <div class="mt-6 text-center">
          <a href="/signup" class="luxury-button bg-white text-luxury-black border-2 border-luxury-blue hover:bg-luxury-lightblue rounded-md inline-flex items-center justify-center w-full py-3">
            Create Account
          </a>
        </div>
      </div>
    </div>
    
    <!-- Trust indicators -->
    <div class="mt-8 text-center">
      <p class="text-xs text-gray-500 mb-2">Trusted by over 1,000 property investors</p>
      <div class="flex justify-center space-x-4 text-xs text-gray-400">
        <span>256-bit SSL encryption</span>
        <span>•</span>
        <span>GDPR compliant</span>
        <span>•</span>
        <span>Data protected</span>
      </div>
    </div>
  </div>
</div> 