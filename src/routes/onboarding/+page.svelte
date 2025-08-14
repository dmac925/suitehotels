<script lang="ts">
  import { ChevronLeft, ChevronRight, Check } from 'lucide-svelte';
  import { AuthService } from '$lib/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let currentStep = 0;
  let isLoading = false;
  let currentUser: any = null;
  let signupData: any = null;
  let personalInfo = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
  };
  let formData = {
    buyerType: '',
    timeframe: '',
    purchaseMethod: '',
    sellingProperty: '',
    currentlyOnMarket: '',
    priceMin: 'no-min',
    priceMax: 'no-max',
    propertyType: '',
    bedroomsMin: 'no-min',
    bedroomsMax: 'no-max',
    selectedNeighborhoods: [],
    idealFeatures: []
  };
  
  const steps = [
    { id: 'personal-info', title: 'Personal Details', description: 'Your name and contact information' },
    { id: 'buyer-type', title: 'About me', description: 'Tell us about your buying situation' },
    { id: 'location-timeframe', title: 'What & where', description: 'Your preferences and timeline' },
    { id: 'specifics', title: 'Specifics', description: 'Property details and budget' },
    { id: 'complete', title: 'Complete', description: 'Confirm your details' }
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

  const priceOptions = [
    { id: 'no-min', label: 'No Min' },
    { id: '500k', label: '£500K' },
    { id: '750k', label: '£750K' },
    { id: '1m', label: '£1M' },
    { id: '1-5m', label: '£1.5M' },
    { id: '2m', label: '£2M' },
    { id: '2-5m', label: '£2.5M' },
    { id: '3m', label: '£3M' },
    { id: '4m', label: '£4M' },
    { id: '5m', label: '£5M' },
    { id: '7-5m', label: '£7.5M' },
    { id: '10m', label: '£10M' },
    { id: '15m', label: '£15M' },
    { id: '20m', label: '£20M+' }
  ];

  const priceMaxOptions = [
    { id: 'no-max', label: 'No Max' },
    { id: '750k', label: '£750K' },
    { id: '1m', label: '£1M' },
    { id: '1-5m', label: '£1.5M' },
    { id: '2m', label: '£2M' },
    { id: '2-5m', label: '£2.5M' },
    { id: '3m', label: '£3M' },
    { id: '4m', label: '£4M' },
    { id: '5m', label: '£5M' },
    { id: '7-5m', label: '£7.5M' },
    { id: '10m', label: '£10M' },
    { id: '15m', label: '£15M' },
    { id: '20m', label: '£20M' },
    { id: '25m', label: '£25M+' }
  ];

  const propertyTypes = [
    { id: 'house', label: 'House' },
    { id: 'flat', label: 'Flat' }
  ];

  const bedroomOptions = [
    { id: 'no-min', label: 'No Min' },
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
    { id: '4', label: '4' },
    { id: '5', label: '5' },
    { id: '6', label: '6+' }
  ];

  const bedroomMaxOptions = [
    { id: 'no-max', label: 'No Max' },
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
    { id: '4', label: '4' },
    { id: '5', label: '5' },
    { id: '6', label: '6' },
    { id: '7', label: '7+' }
  ];

  const idealFeatures = [
    'Outdoor Space',
    'Own Front Door', 
    'Garden',
    'Parking'
  ];

  const neighborhoods = [
    'Mayfair', 'Belgravia', 'Chelsea', 'Kensington', 'Knightsbridge',
    'Marylebone', 'Fitzrovia', 'Notting Hill', 'Holland Park', 'South Kensington',
    'Pimlico', 'Westminster', 'St James\'s', 'Bloomsbury', 'King\'s Cross',
    'Shoreditch', 'Canary Wharf', 'Clapham', 'Fulham', 'Hammersmith',
    'Battersea', 'Wandsworth', 'Richmond', 'Wimbledon', 'Putney'
  ];

  let selectAllNeighborhoods = false;

  function toggleSelectAll() {
    if (selectAllNeighborhoods) {
      formData.selectedNeighborhoods = [...neighborhoods];
    } else {
      formData.selectedNeighborhoods = [];
    }
  }

  function toggleNeighborhood(neighborhood) {
    if (formData.selectedNeighborhoods.includes(neighborhood)) {
      formData.selectedNeighborhoods = formData.selectedNeighborhoods.filter(n => n !== neighborhood);
    } else {
      formData.selectedNeighborhoods = [...formData.selectedNeighborhoods, neighborhood];
    }
    
    // Update select all state
    selectAllNeighborhoods = formData.selectedNeighborhoods.length === neighborhoods.length;
  }

  function toggleFeature(feature) {
    if (formData.idealFeatures.includes(feature)) {
      formData.idealFeatures = formData.idealFeatures.filter(f => f !== feature);
    } else {
      formData.idealFeatures = [...formData.idealFeatures, feature];
    }
  }

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

  // Map form values to database enum values
  function mapFormToDatabase(formValue: string, type: 'buyer_type' | 'timeframe' | 'purchase_method'): string {
    const mappings = {
      buyer_type: {
        'buying-home': 'first_time_buyer',
        'investor': 'investor',
        'developer': 'other',
        'buying-agent': 'other'
      },
      timeframe: {
        'asap': 'asap',
        'within-6': '3-6months',
        'within-year': '6-12months',
        'right-place': 'exploring'
      },
      purchase_method: {
        'mortgage': 'mortgage',
        'cash': 'cash',
        'part_cash_part_mortgage': 'part_cash_part_mortgage'
      }
    };
    
    return mappings[type][formValue] || formValue;
  }

  function isStepComplete(stepIndex: number) {
    switch (stepIndex) {
      case 0:
        // Personal info step
        return !!(personalInfo.firstName && personalInfo.lastName && personalInfo.email && personalInfo.password);
      case 1:
        const step1Required = formData.buyerType !== '' && formData.timeframe !== '' && formData.purchaseMethod !== '' && formData.sellingProperty !== '';
        if (formData.sellingProperty === 'yes') {
          return step1Required && formData.currentlyOnMarket !== '';
        }
        return step1Required;
      case 2:
        return formData.selectedNeighborhoods.length > 0;
      case 3:
        return formData.propertyType !== '';
      case 4:
        return true; // Summary step is always complete
      default:
        return false;
    }
  }

  onMount(async () => {
    console.log('Onboarding page mounted');
    
    // Check for pending signup data from localStorage
    const pendingSignupJson = localStorage.getItem('pendingSignup');
    console.log('Pending signup data:', !!pendingSignupJson);
    
    if (pendingSignupJson) {
      try {
        signupData = JSON.parse(pendingSignupJson);
        personalInfo.email = signupData.email;
        console.log('Loaded signup data:', { email: signupData.email, hasPropertyContext: !!signupData.propertyContext });
        
        // Check if signup data is recent (within 1 hour)
        const now = Date.now();
        const signupTime = signupData.timestamp || 0;
        const hourInMs = 60 * 60 * 1000;
        
        if (now - signupTime > hourInMs) {
          // Signup data is too old, redirect to signup
          console.log('Signup data too old, redirecting to signup');
          localStorage.removeItem('pendingSignup');
          goto('/signup');
          return;
        }
      } catch (e) {
        console.error('Error parsing signup data:', e);
        localStorage.removeItem('pendingSignup');
        goto('/signup');
        return;
      }
    } else {
      // No signup data, check if user is already authenticated
      console.log('No signup data, checking authentication');
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        console.log('Not authenticated, redirecting to signup');
        goto('/signup');
        return;
      }
      
      // User is authenticated, get their profile
      const { user } = await AuthService.getCurrentUser();
      if (user) {
        currentUser = user;
        console.log('Authenticated user found:', user.id);
        const { profile } = await AuthService.getUserProfile(user.id);
        if (profile && profile.profile_completed) {
          console.log('Profile already completed, redirecting to dashboard');
          goto('/dashboard');
          return;
        }
      }
    }
    
    console.log('Onboarding setup complete, currentStep:', currentStep, 'steps.length:', steps.length, 'isLastStep:', currentStep === steps.length - 1);
  });

  async function completeOnboarding() {
    console.log('completeOnboarding called, currentStep:', currentStep, 'signupData:', !!signupData);
    
    // Don't allow completion unless user is on the last step
    if (currentStep !== steps.length - 1) {
      console.log('Not on final step, returning');
      return;
    }
    
    isLoading = true;
    
    try {
      let user = currentUser;
      
      // If we have signup data, create the user account now
      if (signupData && !currentUser) {
        console.log('Form data:', formData);
        
        // Create user account with all onboarding data
        const { user: newUser, error } = await AuthService.signUp(
          personalInfo.email, 
          personalInfo.password, 
          {
            email: personalInfo.email, // Include email explicitly
            first_name: personalInfo.firstName,
            last_name: personalInfo.lastName,
            phone: personalInfo.phone,
            // Include all the onboarding preferences - mapped to database enum values
            buyer_type: mapFormToDatabase(formData.buyerType, 'buyer_type'),
            timeframe: mapFormToDatabase(formData.timeframe, 'timeframe'),
            purchase_method: mapFormToDatabase(formData.purchaseMethod, 'purchase_method'),
            selling_property: formData.sellingProperty === 'yes',
            price_range: `${formData.priceMin}-${formData.priceMax}`,
            property_types: [formData.propertyType],
            min_bedrooms: formData.bedroomsMin === 'no-min' ? null : parseInt(formData.bedroomsMin),
            max_bedrooms: formData.bedroomsMax === 'no-max' ? null : parseInt(formData.bedroomsMax),
            preferred_locations: formData.selectedNeighborhoods,
            profile_completed: true,
            // Store property context if available
            ...(signupData.propertyContext && { 
              property_context: JSON.stringify(signupData.propertyContext) 
            })
          }
        );

        if (error) {
          console.error('Error creating user:', error);
          throw new Error(error);
        }
        
        console.log('User created successfully with profile data:', newUser?.id);
        user = newUser;
        
        // Clear pending signup data
        localStorage.removeItem('pendingSignup');
      }
      
      // If user is already authenticated, just update their profile
      if (currentUser) {
        const { error } = await AuthService.updateUserProfile(currentUser.id, {
          email: currentUser.email, // Include email
          buyer_type: mapFormToDatabase(formData.buyerType, 'buyer_type'),
          timeframe: mapFormToDatabase(formData.timeframe, 'timeframe'),
          purchase_method: mapFormToDatabase(formData.purchaseMethod, 'purchase_method'),
          selling_property: formData.sellingProperty === 'yes',
          price_range: `${formData.priceMin}-${formData.priceMax}`,
          property_types: [formData.propertyType],
          min_bedrooms: formData.bedroomsMin === 'no-min' ? null : parseInt(formData.bedroomsMin),
          max_bedrooms: formData.bedroomsMax === 'no-max' ? null : parseInt(formData.bedroomsMax),
          preferred_locations: formData.selectedNeighborhoods,
          profile_completed: true
        });

        if (error) {
          throw new Error(error);
        }
      }

      // Success! Show completion message or redirect
      if (signupData) {
        // New user - show email confirmation message
        setTimeout(() => {
          alert('Account created successfully! Please check your email to verify your account before signing in.');
          goto('/login');
        }, 500);
      } else {
        // Existing user - redirect to dashboard
        goto('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Onboarding error:', error);
      alert(error.message || 'Error completing onboarding. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Personalize Your Experience - OffMarketPrime</title>
  <meta name="description" content="Tell us about your property needs so we can curate the perfect off-market opportunities for you." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-luxury-pearl to-white">
  <!-- Progress Header - Hidden on mobile -->
  <div class="hidden md:block bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-4xl px-4 py-4">
      <div class="flex items-center justify-between mb-4">
        {#each steps as step, index}
          <div class="flex items-center" class:flex-1={index < steps.length - 1}>
            <div class="flex items-center">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                class:bg-luxury-blue={index <= currentStep}
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
                  class="h-full bg-luxury-blue transition-all duration-300"
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
  <div class="mx-auto max-w-3xl px-4 py-4">
    <div class="luxury-card rounded-2xl p-8 lg:p-12">
      
      <!-- Step Content -->
      {#if currentStep === 0}
        <!-- Personal Information -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">Let's get to know you</h1>
          <p class="luxury-text text-lg">We'll use this information to create your personalized account.</p>
        </div>

        <div class="space-y-6 max-w-lg mx-auto">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input 
                id="firstName"
                type="text" 
                bind:value={personalInfo.firstName}
                placeholder="Your first name"
                required
                class="w-full p-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input 
                id="lastName"
                type="text" 
                bind:value={personalInfo.lastName}
                placeholder="Your last name"
                required
                class="w-full p-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              id="email"
              type="email" 
              bind:value={personalInfo.email}
              placeholder="your.email@example.com"
              required
              disabled={!!signupData}
              class="w-full p-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-blue focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
            <input 
              id="password"
              type="password" 
              bind:value={personalInfo.password}
              placeholder="Create a secure password (min. 6 characters)"
              required
              minlength="6"
              class="w-full p-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
            <input 
              id="phone"
              type="tel" 
              bind:value={personalInfo.phone}
              placeholder="+44 7xxx xxx xxx"
              class="w-full p-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-luxury-blue focus:border-transparent"
            />
          </div>
        </div>

      {:else if currentStep === 1}
        <!-- Buyer Type -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">Tailoring your buying experience</h1>
          <p class="luxury-text text-lg">Knowing your needs helps us curate your perfect properties.</p>
        </div>

        <div class="space-y-8">
          <!-- Buyer Type -->
          <div>
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
                    class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue"
                    class:border-luxury-blue={formData.buyerType === type.id}
                    class:bg-luxury-lightblue={formData.buyerType === type.id}
                    class:border-gray-200={formData.buyerType !== type.id}
                  >
                    <h3 class="font-semibold text-luxury-charcoal mb-1">{type.label}</h3>
                    <p class="text-sm text-gray-600">{type.description}</p>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <!-- When you are looking to move -->
          <div>
            <h2 class="luxury-heading text-xl mb-6">When you are looking to move</h2>
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
                    class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                    class:border-luxury-blue={formData.timeframe === timeframe.id}
                    class:bg-luxury-lightblue={formData.timeframe === timeframe.id}
                    class:border-gray-200={formData.timeframe !== timeframe.id}
                  >
                    <span class="font-medium text-luxury-charcoal">{timeframe.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <!-- Purchase Method -->
          <div>
            <h2 class="luxury-heading text-xl mb-6">Purchase Method</h2>
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
                    class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                    class:border-luxury-blue={formData.purchaseMethod === method.id}
                    class:bg-luxury-lightblue={formData.purchaseMethod === method.id}
                    class:border-gray-200={formData.purchaseMethod !== method.id}
                  >
                    <span class="font-semibold text-luxury-charcoal">{method.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <!-- Selling a Property -->
          <div>
            <h2 class="luxury-heading text-xl mb-6">Selling a Property</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="relative">
                <input 
                  type="radio" 
                  bind:group={formData.sellingProperty} 
                  value="yes"
                  class="sr-only"
                />
                <div 
                  class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                  class:border-luxury-blue={formData.sellingProperty === 'yes'}
                  class:bg-luxury-lightblue={formData.sellingProperty === 'yes'}
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
                  class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                  class:border-luxury-blue={formData.sellingProperty === 'no'}
                  class:bg-luxury-lightblue={formData.sellingProperty === 'no'}
                  class:border-gray-200={formData.sellingProperty !== 'no'}
                >
                  <span class="font-semibold text-luxury-charcoal">No</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Currently on Market (conditional) -->
          {#if formData.sellingProperty === 'yes'}
            <div>
              <h2 class="luxury-heading text-xl mb-6">Currently on Market</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="relative">
                  <input 
                    type="radio" 
                    bind:group={formData.currentlyOnMarket} 
                    value="yes"
                    class="sr-only"
                  />
                  <div 
                    class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                    class:border-luxury-blue={formData.currentlyOnMarket === 'yes'}
                    class:bg-luxury-lightblue={formData.currentlyOnMarket === 'yes'}
                    class:border-gray-200={formData.currentlyOnMarket !== 'yes'}
                  >
                    <span class="font-semibold text-luxury-charcoal">Yes</span>
                  </div>
                </label>
                <label class="relative">
                  <input 
                    type="radio" 
                    bind:group={formData.currentlyOnMarket} 
                    value="no"
                    class="sr-only"
                  />
                  <div 
                    class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                    class:border-luxury-blue={formData.currentlyOnMarket === 'no'}
                    class:bg-luxury-lightblue={formData.currentlyOnMarket === 'no'}
                    class:border-gray-200={formData.currentlyOnMarket !== 'no'}
                  >
                    <span class="font-semibold text-luxury-charcoal">No</span>
                  </div>
                </label>
              </div>
            </div>
          {/if}
        </div>

      {:else if currentStep === 2}
        <!-- Location -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">Where</h1>
          <p class="luxury-text text-lg">Select your preferred neighborhoods in London.</p>
        </div>

        <div class="space-y-6">
          <!-- Select All Option -->
          <div class="border-b border-gray-200 pb-4">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={selectAllNeighborhoods}
                on:change={toggleSelectAll}
                class="h-4 w-4 text-luxury-blue focus:ring-luxury-blue border-gray-300 rounded"
              />
              <span class="ml-3 text-lg font-medium text-gray-900">Select All Neighborhoods</span>
            </label>
          </div>

          <!-- Individual Neighborhoods -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-4">Choose specific neighborhoods:</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {#each neighborhoods as neighborhood}
                <label class="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.selectedNeighborhoods.includes(neighborhood)}
                    on:change={() => toggleNeighborhood(neighborhood)}
                    class="h-4 w-4 text-luxury-blue focus:ring-luxury-blue border-gray-300 rounded"
                  />
                  <span class="ml-3 text-sm text-gray-900">{neighborhood}</span>
                </label>
              {/each}
            </div>
          </div>

          <!-- Selected Count -->
          {#if formData.selectedNeighborhoods.length > 0}
            <div class="bg-luxury-lightblue rounded-lg p-4">
              <p class="text-sm text-luxury-blue">
                <span class="font-medium">{formData.selectedNeighborhoods.length}</span> 
                neighborhood{formData.selectedNeighborhoods.length === 1 ? '' : 's'} selected
              </p>
            </div>
          {/if}
        </div>

      {:else if currentStep === 3}
        <!-- Specifics -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">Property Specifics</h1>
          <p class="luxury-text text-lg">Help us understand your ideal property requirements.</p>
        </div>

        <div class="space-y-8">
          <!-- Price Range Min/Max -->
          <div>
            <h2 class="luxury-heading text-xl mb-6">Price Range</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="priceMin" class="block text-sm font-medium text-gray-700 mb-3">
                  Minimum Price
                </label>
                <select
                  id="priceMin"
                  bind:value={formData.priceMin}
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue bg-white"
                >
                  {#each priceOptions as price}
                    <option value={price.id}>{price.label}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label for="priceMax" class="block text-sm font-medium text-gray-700 mb-3">
                  Maximum Price
                </label>
                <select
                  id="priceMax"
                  bind:value={formData.priceMax}
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue bg-white"
                >
                  {#each priceMaxOptions as price}
                    <option value={price.id}>{price.label}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>

          <!-- Bedrooms Min/Max -->
          <div>
            <h2 class="luxury-heading text-xl mb-6">Number of Bedrooms</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="bedroomsMin" class="block text-sm font-medium text-gray-700 mb-3">
                  Minimum Bedrooms
                </label>
                <select
                  id="bedroomsMin"
                  bind:value={formData.bedroomsMin}
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue bg-white"
                >
                  {#each bedroomOptions as bedroom}
                    <option value={bedroom.id}>{bedroom.label}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label for="bedroomsMax" class="block text-sm font-medium text-gray-700 mb-3">
                  Maximum Bedrooms
                </label>
                <select
                  id="bedroomsMax"
                  bind:value={formData.bedroomsMax}
                  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue bg-white"
                >
                  {#each bedroomMaxOptions as bedroom}
                    <option value={bedroom.id}>{bedroom.label}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>

          <!-- Property Type -->
          <div>
            <h2 class="luxury-heading text-xl mb-6">Property Type</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each propertyTypes as type}
                <label class="relative">
                  <input 
                    type="radio" 
                    bind:group={formData.propertyType} 
                    value={type.id}
                    class="sr-only"
                  />
                  <div 
                    class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                    class:border-luxury-blue={formData.propertyType === type.id}
                    class:bg-luxury-lightblue={formData.propertyType === type.id}
                    class:border-gray-200={formData.propertyType !== type.id}
                  >
                    <span class="font-medium text-luxury-charcoal text-lg">{type.label}</span>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <!-- Ideal Features -->
          <div>
            <h2 class="luxury-heading text-xl mb-6">Ideal Features</h2>
            <p class="text-sm text-gray-600 mb-4">Select any features that are important to you (optional)</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each idealFeatures as feature}
                <label class="flex items-center cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  class:bg-luxury-lightblue={formData.idealFeatures.includes(feature)}
                  class:border-luxury-blue={formData.idealFeatures.includes(feature)}
                >
                  <input
                    type="checkbox"
                    checked={formData.idealFeatures.includes(feature)}
                    on:change={() => toggleFeature(feature)}
                    class="h-4 w-4 text-luxury-blue focus:ring-luxury-blue border-gray-300 rounded"
                  />
                  <span class="ml-3 text-sm font-medium text-gray-900">{feature}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>

      {:else if currentStep === 4}
        <!-- Final Details -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-3xl mb-4">Review & Complete</h1>
          <p class="luxury-text text-lg">Review your preferences and complete your profile setup.</p>
        </div>

        <div class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Your Preferences Summary</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Buyer Type:</span>
                <span class="font-medium ml-2">{buyerTypes.find(t => t.id === formData.buyerType)?.label || 'Not selected'}</span>
              </div>
              <div>
                <span class="text-gray-600">Timeline:</span>
                <span class="font-medium ml-2">{timeframes.find(t => t.id === formData.timeframe)?.label || 'Not selected'}</span>
              </div>
              <div>
                <span class="text-gray-600">Purchase Method:</span>
                <span class="font-medium ml-2">{purchaseMethods.find(p => p.id === formData.purchaseMethod)?.label || 'Not selected'}</span>
              </div>
              <div class="col-span-full">
                <span class="text-gray-600">Preferred Neighborhoods:</span>
                <div class="mt-2">
                  {#if formData.selectedNeighborhoods.length > 0}
                    <div class="flex flex-wrap gap-2">
                      {#each formData.selectedNeighborhoods as neighborhood}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-luxury-lightblue text-luxury-blue">
                          {neighborhood}
                        </span>
                      {/each}
                    </div>
                  {:else}
                    <span class="font-medium text-gray-500">Not selected</span>
                  {/if}
                </div>
              </div>
              <div>
                <span class="text-gray-600">Price Range:</span>
                <span class="font-medium ml-2">
                  {priceOptions.find(p => p.id === formData.priceMin)?.label || 'No Min'} - {priceMaxOptions.find(p => p.id === formData.priceMax)?.label || 'No Max'}
                </span>
              </div>
              <div>
                <span class="text-gray-600">Property Type:</span>
                <span class="font-medium ml-2">{propertyTypes.find(p => p.id === formData.propertyType)?.label || 'Not selected'}</span>
              </div>
              <div>
                <span class="text-gray-600">Bedrooms:</span>
                <span class="font-medium ml-2">
                  {bedroomOptions.find(b => b.id === formData.bedroomsMin)?.label || 'No Min'} - {bedroomMaxOptions.find(b => b.id === formData.bedroomsMax)?.label || 'No Max'}
                </span>
              </div>
              <div>
                <span class="text-gray-600">Selling Property:</span>
                <span class="font-medium ml-2">{formData.sellingProperty === 'yes' ? 'Yes' : formData.sellingProperty === 'no' ? 'No' : 'Not selected'}</span>
              </div>
              {#if formData.sellingProperty === 'yes'}
                <div>
                  <span class="text-gray-600">Currently on Market:</span>
                  <span class="font-medium ml-2">{formData.currentlyOnMarket === 'yes' ? 'Yes' : formData.currentlyOnMarket === 'no' ? 'No' : 'Not selected'}</span>
                </div>
              {/if}
              <div class="col-span-full">
                <span class="text-gray-600">Ideal Features:</span>
                <div class="mt-2">
                  {#if formData.idealFeatures.length > 0}
                    <div class="flex flex-wrap gap-2">
                      {#each formData.idealFeatures as feature}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {feature}
                        </span>
                      {/each}
                    </div>
                  {:else}
                    <span class="font-medium text-gray-500">None selected</span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Navigation -->
      <div class="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
        <button
          on:click={prevStep}
          disabled={currentStep === 0}
          class="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-luxury-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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