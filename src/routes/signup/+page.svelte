<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Check, Home, Maximize, Bath, Bed } from 'lucide-svelte';
  import { supabase } from '$lib/supabase';
  
  let email = '';
  let isLoading = false;
  let errorMessage = '';
  let propertyContext = null;
  
  // Get property context from URL parameters
  onMount(() => {
    const params = $page.url.searchParams;
    if (params.get('propertyId')) {
      propertyContext = {
        id: params.get('propertyId'),
        address: params.get('address'),
        price: params.get('price'),
        propertyType: params.get('propertyType'),
        bedrooms: parseInt(params.get('bedrooms') || '0'),
        bathrooms: parseInt(params.get('bathrooms') || '0'),
        sqft: parseInt(params.get('sqft') || '0'),
        image: params.get('image')
      };
    }
  });
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    errorMessage = '';
    
    if (!email) {
      errorMessage = 'Please enter your email address';
      return;
    }
    
    isLoading = true;
    
    try {
      // Create user account with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'temp_password_' + Math.random().toString(36).substring(7), // Temporary password
        options: {
          data: {
            property_context: propertyContext ? JSON.stringify(propertyContext) : null
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // User created successfully, redirect to onboarding
        console.log('User created:', data.user.id);
        console.log('Property context:', propertyContext);
        
        // Small delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.location.href = '/onboarding';
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message?.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else {
        errorMessage = error.message || 'An error occurred. Please try again.';
      }
    } finally {
      isLoading = false;
    }
  };
</script>

<svelte:head>
  <title>Register - OffMarketPrime | Premium Property Access</title>
  <meta name="description" content="Free registration for exclusive access to premium off-market properties in London. Discover homes before they reach the public market." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
  <!-- Mobile Layout -->
  <div class="lg:hidden mx-auto max-w-lg px-4 py-4">
    <div class="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-xl font-heading font-medium text-gray-900">
          Free sign up for exclusive property access
        </h1>
      </div>

      <!-- Signup Form -->
      <form on:submit={handleSubmit} class="mb-6">
        <div class="bg-white rounded-lg p-4">
          {#if errorMessage}
            <div class="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p class="text-sm text-red-600">{errorMessage}</p>
            </div>
          {/if}
          
                      <input 
              type="email" 
              bind:value={email}
              placeholder="Enter your email address"
              required
              class="w-full p-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-blue focus:border-transparent mb-3"
            />
          
          <button 
            type="submit" 
            disabled={isLoading || !email}
            class="w-full bg-luxury-blue hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:cursor-not-allowed">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <!-- Property Preview -->
      {#if propertyContext}
        <div class="bg-white rounded-lg overflow-hidden mb-6">
          <div class="relative aspect-[3/2]">
            <img 
              src={propertyContext.image} 
              alt={propertyContext.address}
              class="w-full h-full object-cover"
            />
            <div class="absolute top-2 left-2">
              <div class="bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-900">
                Price guide: {propertyContext.price}
              </div>
            </div>
          </div>
          <div class="p-3">
            <h3 class="font-medium text-gray-900 text-sm mb-2">
              {propertyContext.address}
            </h3>
            
            <!-- Property Details -->
            <div class="flex items-center justify-between text-xs text-gray-600">
              <div class="flex items-center gap-1">
                <Home class="h-3 w-3" />
                <span>{propertyContext.propertyType}</span>
              </div>
              
              <div class="flex items-center gap-1">
                <Maximize class="h-3 w-3" />
                <span>{propertyContext.sqft} sq ft</span>
              </div>
              
              <div class="flex items-center gap-1">
                <Bed class="h-3 w-3" />
                <span>{propertyContext.bedrooms}</span>
              </div>
              
              <div class="flex items-center gap-1">
                <Bath class="h-3 w-3" />
                <span>{propertyContext.bathrooms}</span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Benefits Section -->
      <div class="mb-4">
        <h3 class="text-base font-medium text-gray-900 mb-3">
          Join thousands of property buyers on OffMarketPrime
        </h3>
        
        <div class="space-y-2">
          <div class="flex items-start gap-2">
            <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check class="h-3 w-3 text-white" />
            </div>
            <p class="text-gray-700 text-sm">
              Discover premium properties before public listing
            </p>
          </div>
          
          <div class="flex items-start gap-2">
            <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check class="h-3 w-3 text-white" />
            </div>
            <p class="text-gray-700 text-sm">
              Connect directly with verified property owners
            </p>
          </div>
          
          <div class="flex items-start gap-2">
            <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check class="h-3 w-3 text-white" />
            </div>
            <p class="text-gray-700 text-sm">
              Intelligent matching based on your preferences
            </p>
          </div>
        </div>
      </div>
      
      <!-- Terms -->
      <div class="text-center mt-4">
        <p class="text-xs text-gray-500">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>

  <!-- Desktop Layout -->
  <div class="hidden lg:flex min-h-screen">
    <!-- Left Side - Signup Form -->
    <div class="w-1/2 flex items-center justify-center p-6">
      <div class="max-w-sm w-full">
        <div class="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
          <!-- Header -->
          <div class="text-center mb-6">
            <h1 class="text-xl font-heading font-medium text-gray-900">
              Free sign up for exclusive property access
            </h1>
          </div>

          <!-- Signup Form -->
          <form on:submit={handleSubmit} class="mb-6">
            <div class="bg-white rounded-lg">
              {#if errorMessage}
                <div class="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p class="text-sm text-red-600">{errorMessage}</p>
                </div>
              {/if}
              
              <input 
                type="email" 
                bind:value={email}
                placeholder="Enter your email address"
                required
                class="w-full p-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-blue focus:border-transparent mb-4"
              />
              
              <button 
                type="submit" 
                disabled={isLoading || !email}
                class="w-full bg-luxury-blue hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:cursor-not-allowed">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <!-- Benefits Section -->
          <div>
            <h3 class="text-base font-medium text-gray-900 mb-3">
              Join thousands of property buyers on OffMarketPrime
            </h3>
            
            <div class="space-y-2.5">
              <div class="flex items-start gap-2.5">
                <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check class="h-3 w-3 text-white" />
                </div>
                <p class="text-sm text-gray-700">
                  Discover premium properties before public listing
                </p>
              </div>
              
              <div class="flex items-start gap-2.5">
                <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check class="h-3 w-3 text-white" />
                </div>
                <p class="text-sm text-gray-700">
                  Connect directly with verified property owners
                </p>
              </div>
              
              <div class="flex items-start gap-2.5">
                <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check class="h-3 w-3 text-white" />
                </div>
                <p class="text-sm text-gray-700">
                  Intelligent matching based on your preferences
                </p>
              </div>
            </div>
          </div>
          
          <!-- Terms -->
          <div class="text-center mt-8">
            <p class="text-xs text-gray-500">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Property Details -->
    <div class="w-1/2 flex items-center justify-center p-6 bg-gray-100">
      <div class="max-w-sm w-full">
        {#if propertyContext}
          <div class="bg-white rounded-xl overflow-hidden shadow-xl">
            <div class="relative aspect-[4/3]">
              <img 
                src={propertyContext.image} 
                alt={propertyContext.address}
                class="w-full h-full object-cover"
              />
              <div class="absolute top-4 left-4">
                <div class="bg-white/95 backdrop-blur-sm px-3 py-2 rounded text-sm font-medium text-gray-900">
                  Price guide: {propertyContext.price}
                </div>
              </div>
            </div>
            <div class="p-5">
              <h3 class="font-medium text-gray-900 text-base mb-3">
                {propertyContext.address}
              </h3>
              
              <!-- Property Details -->
              <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                  <Home class="h-4 w-4" />
                  <span>{propertyContext.propertyType}</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <Maximize class="h-4 w-4" />
                  <span>{propertyContext.sqft} sq ft</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <Bed class="h-4 w-4" />
                  <span>{propertyContext.bedrooms} bedrooms</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <Bath class="h-4 w-4" />
                  <span>{propertyContext.bathrooms} bathrooms</span>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <!-- Fallback when no property context -->
          <div class="bg-white rounded-xl p-8 shadow-xl text-center">
            <div class="w-16 h-16 bg-luxury-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Home class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">
              Exclusive Property Access
            </h3>
            <p class="text-gray-600">
              Join OffMarketPrime to discover premium properties before they reach the public market.
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>