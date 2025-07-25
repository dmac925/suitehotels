<script lang="ts">
  import { ChevronLeft, ChevronRight, Check } from 'lucide-svelte';
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  
  let currentStep = 0;
  let isLoading = false;
  let currentUser: any = null;
  let formData = {
    buyerType: '',
    timeframe: '',
    purchaseMethod: '',
    sellingProperty: '',
    priceRange: '',
    propertyType: '',
    bedrooms: '',
    location: ''
  };
  
  const steps = [
    { id: 'buyer-type', title: 'About me', description: 'Tell us about your buying situation' },
    { id: 'location-timeframe', title: 'What & where', description: 'Your preferences and timeline' },
    { id: 'specifics', title: 'Specifics', description: 'Property details and budget' },
    { id: 'verify', title: 'Verify', description: 'Confirm your details' }
  ];

  const buyerTypes = [
    { id: 'buying-home', label: 'Buying a home', description: 'Looking for my primary residence' },
    { id: 'investor', label: 'Investor', description: 'Investment property opportunity' },
    { id: 'developer', label: 'Developer', description: 'Development or renovation project' },
    { id: 'buying-agent', label: 'Buying agent', description: 'Representing a client' }
  ];

  const timeframes = [
    { id: 'asap', label: 'ASAP' },
    { id: 'within-6', label: 'Within 6 months' },
    { id: 'within-year', label: 'Within a year' },
    { id: 'right-place', label: 'When I find the right place' }
  ];

  const purchaseMethods = [
    { id: 'mortgage', label: 'Mortgage' },
    { id: 'cash', label: 'Cash' }
  ];

  const priceRanges = [
    { id: 'under-2m', label: 'Under £2M' },
    { id: '2m-5m', label: '£2M - £5M' },
    { id: '5m-10m', label: '£5M - £10M' },
    { id: 'over-10m', label: 'Over £10M' }
  ];

  const propertyTypes = [
    { id: 'apartment', label: 'Apartment' },
    { id: 'house', label: 'House' },
    { id: 'penthouse', label: 'Penthouse' },
    { id: 'townhouse', label: 'Townhouse' }
  ];

  const bedroomOptions = [
    { id: '1', label: '1 bedroom' },
    { id: '2', label: '2 bedrooms' },
    { id: '3', label: '3 bedrooms' },
    { id: '4+', label: '4+ bedrooms' }
  ];

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }

  function isStepComplete(stepIndex: number) {
    switch (stepIndex) {
      case 0:
        return formData.buyerType !== '';
      case 1:
        return formData.timeframe !== '' && formData.location !== '';
      case 2:
        return formData.priceRange !== '' && formData.propertyType !== '' && formData.bedrooms !== '';
      case 3:
        return formData.sellingProperty !== '' && formData.purchaseMethod !== '';
      default:
        return false;
    }
  }

  onMount(async () => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    currentUser = user;
  });

  async function completeOnboarding() {
    if (!currentUser) return;
    
    isLoading = true;
    
    try {
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('user_profiles')
        .update({
          buyer_type: formData.buyerType,
          timeframe: formData.timeframe,
          purchase_method: formData.purchaseMethod,
          selling_property: formData.sellingProperty === 'yes',
          price_range: formData.priceRange,
          property_type: formData.propertyType,
          bedrooms: formData.bedrooms,
          location: formData.location,
          onboarding_completed: true
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating profile:', error);
        alert('Error saving preferences. Please try again.');
        return;
      }

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Error completing onboarding. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Personalize Your Experience - OffMarketEdit</title>
  <meta name="description" content="Tell us about your property needs so we can curate the perfect off-market opportunities for you." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-luxury-pearl to-white">
  <!-- Progress Header -->
  <div class="bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <div class="flex items-center justify-between mb-4">
        {#each steps as step, index}
          <div class="flex items-center" class:flex-1={index < steps.length - 1}>
            <div class="flex items-center">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                class:bg-luxury-gold={index <= currentStep}
                class:text-white={index <= currentStep}
                class:bg-gray-200={index > currentStep}
                class:text-gray-600={index > currentStep}
              >
                {#if isStepComplete(index) && index < currentStep}
                  <Check class="h-4 w-4" />
                {:else}
                  {index + 1}
                {/if}
              </div>
              <span class="ml-2 text-sm font-medium text-gray-700">{step.title}</span>
            </div>
            {#if index < steps.length - 1}
              <div class="flex-1 h-0.5 bg-gray-200 mx-4">
                <div 
                  class="h-full bg-luxury-gold transition-all duration-300"
                  style="width: {index < currentStep ? '100%' : '0%'}"
                ></div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="mx-auto max-w-3xl px-4 py-12">
    <div class="luxury-card rounded-2xl p-8 lg:p-12">
      
      <!-- Step Content -->
      {#if currentStep === 0}
        <!-- Buyer Type -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">Tailoring your buying experience</h1>
          <p class="luxury-text text-lg">Knowing your needs helps us curate your perfect properties.</p>
        </div>

        <div class="mb-8">
          <h2 class="luxury-heading text-xl mb-6">Buyer Type</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each buyerTypes as type}
              <label class="relative">
                <input 
                  type="radio" 
                  bind:group={formData.buyerType} 
                  value={type.id}
                  class="sr-only"
                />
                <div 
                  class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-gold"
                  class:border-luxury-gold={formData.buyerType === type.id}
                  class:bg-luxury-champagne={formData.buyerType === type.id}
                  class:border-gray-200={formData.buyerType !== type.id}
                >
                  <h3 class="font-semibold text-luxury-charcoal mb-1">{type.label}</h3>
                  <p class="text-sm text-gray-600">{type.description}</p>
                </div>
              </label>
            {/each}
          </div>
        </div>

      {:else if currentStep === 1}
        <!-- Location & Timeframe -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">What & Where</h1>
          <p class="luxury-text text-lg">Tell us about your location preferences and timeline.</p>
        </div>

        <div class="space-y-8">
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-3">
              Preferred Location
            </label>
            <input
              type="text"
              id="location"
              bind:value={formData.location}
              placeholder="e.g., Mayfair, Chelsea, Kensington..."
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
            />
          </div>

          <div>
            <h2 class="luxury-heading text-xl mb-6">Ideal timeframe</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each timeframes as timeframe}
                <label class="relative">
                  <input 
                    type="radio" 
                    bind:group={formData.timeframe} 
                    value={timeframe.id}
                    class="sr-only"
                  />
                  <div 
                    class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-gold text-center"
                    class:border-luxury-gold={formData.timeframe === timeframe.id}
                    class:bg-luxury-champagne={formData.timeframe === timeframe.id}
                    class:border-gray-200={formData.timeframe !== timeframe.id}
                  >
                    <span class="font-medium text-luxury-charcoal">{timeframe.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>
        </div>

      {:else if currentStep === 2}
        <!-- Specifics -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">Property Specifics</h1>
          <p class="luxury-text text-lg">Help us understand your ideal property requirements.</p>
        </div>

        <div class="space-y-8">
          <div>
            <h2 class="luxury-heading text-xl mb-6">Price Range</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each priceRanges as range}
                <label class="relative">
                  <input 
                    type="radio" 
                    bind:group={formData.priceRange} 
                    value={range.id}
                    class="sr-only"
                  />
                  <div 
                    class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-gold text-center"
                    class:border-luxury-gold={formData.priceRange === range.id}
                    class:bg-luxury-champagne={formData.priceRange === range.id}
                    class:border-gray-200={formData.priceRange !== range.id}
                  >
                    <span class="font-medium text-luxury-charcoal">{range.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <div>
            <h2 class="luxury-heading text-xl mb-6">Property Type</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each propertyTypes as type}
                <label class="relative">
                  <input 
                    type="radio" 
                    bind:group={formData.propertyType} 
                    value={type.id}
                    class="sr-only"
                  />
                  <div 
                    class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-gold text-center"
                    class:border-luxury-gold={formData.propertyType === type.id}
                    class:bg-luxury-champagne={formData.propertyType === type.id}
                    class:border-gray-200={formData.propertyType !== type.id}
                  >
                    <span class="font-medium text-luxury-charcoal text-sm">{type.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <div>
            <h2 class="luxury-heading text-xl mb-6">Bedrooms</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each bedroomOptions as bedroom}
                <label class="relative">
                  <input 
                    type="radio" 
                    bind:group={formData.bedrooms} 
                    value={bedroom.id}
                    class="sr-only"
                  />
                  <div 
                    class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-gold text-center"
                    class:border-luxury-gold={formData.bedrooms === bedroom.id}
                    class:bg-luxury-champagne={formData.bedrooms === bedroom.id}
                    class:border-gray-200={formData.bedrooms !== bedroom.id}
                  >
                    <span class="font-medium text-luxury-charcoal text-sm">{bedroom.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>
        </div>

      {:else if currentStep === 3}
        <!-- Final Details -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">Final Details</h1>
          <p class="luxury-text text-lg">Just a couple more details to complete your profile.</p>
        </div>

        <div class="space-y-8">
          <div>
            <h2 class="luxury-heading text-xl mb-6">Purchase method</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each purchaseMethods as method}
                <label class="relative">
                  <input 
                    type="radio" 
                    bind:group={formData.purchaseMethod} 
                    value={method.id}
                    class="sr-only"
                  />
                  <div 
                    class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-gold text-center"
                    class:border-luxury-gold={formData.purchaseMethod === method.id}
                    class:bg-luxury-champagne={formData.purchaseMethod === method.id}
                    class:border-gray-200={formData.purchaseMethod !== method.id}
                  >
                    <span class="font-semibold text-luxury-charcoal">{method.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <div>
            <h2 class="luxury-heading text-xl mb-6">Selling a property?</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="relative">
                <input 
                  type="radio" 
                  bind:group={formData.sellingProperty} 
                  value="yes"
                  class="sr-only"
                />
                <div 
                  class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-gold text-center"
                  class:border-luxury-gold={formData.sellingProperty === 'yes'}
                  class:bg-luxury-champagne={formData.sellingProperty === 'yes'}
                  class:border-gray-200={formData.sellingProperty !== 'yes'}
                >
                  <span class="font-semibold text-luxury-charcoal">Yes</span>
                </div>
              </label>
              <label class="relative">
                <input 
                  type="radio" 
                  bind:group={formData.sellingProperty} 
                  value="no"
                  class="sr-only"
                />
                <div 
                  class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-gold text-center"
                  class:border-luxury-gold={formData.sellingProperty === 'no'}
                  class:bg-luxury-champagne={formData.sellingProperty === 'no'}
                  class:border-gray-200={formData.sellingProperty !== 'no'}
                >
                  <span class="font-semibold text-luxury-charcoal">No</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      {/if}

      <!-- Navigation -->
      <div class="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
        <button
          on:click={prevStep}
          disabled={currentStep === 0}
          class="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-luxury-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft class="h-4 w-4" />
          <span>Previous</span>
        </button>

        {#if currentStep === steps.length - 1}
          <button
            on:click={completeOnboarding}
            disabled={!isStepComplete(currentStep) || isLoading}
            class="luxury-button rounded-md px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </button>
        {:else}
          <button
            on:click={nextStep}
            disabled={!isStepComplete(currentStep)}
            class="flex items-center space-x-2 luxury-button rounded-md px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continue</span>
            <ChevronRight class="h-4 w-4" />
          </button>
        {/if}
      </div>
    </div>
  </div>
</div> 