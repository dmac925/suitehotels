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
    email: '',
    password: ''
  };
  
  let phoneVerification = {
    phone: '',
    otp: '',
    isOTPSent: false,
    isVerifying: false,
    otpError: '',
    phoneError: '',
    countryCode: '+44'
  };
  
  // Top 20 international country codes
  const countryCodes = [
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+1', country: 'USA', flag: '🇺🇸' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' }
  ];
  let formData = {
    buyerType: '',
    timeframe: '',
    purchaseMethod: '',
    sellingProperty: '',
    currentlyOnMarket: '',
    priceMin: 'no-min',
    priceMax: 'no-max',
    propertyTypes: [] as string[],
    bedroomsMin: 'no-min',
    bedroomsMax: 'no-max',
    selectedNeighborhoods: [] as string[],
    idealFeatures: [] as string[]
  };
  
  const steps = [
    { id: 'personal-info', title: 'About me', description: 'Your name and email' },
    { id: 'buyer-type', title: 'Preferences', description: 'Tell us about your buying situation' },
    { id: 'location', title: 'Location', description: 'Where are you looking' },
    { id: 'specifics', title: 'Specifics', description: 'Property requirements' },
    { id: 'verify', title: 'Verify', description: 'Mobile verification for security' }
  ];

  const buyerTypes = [
    { id: 'buying-home', label: 'Buying a home' },
    { id: 'investor', label: 'Investor' },
    { id: 'developer', label: 'Developer' },
    { id: 'buying-agent', label: 'Buying agent' }
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
    'Parking',
    'Share of Freehold',
    'Front Desk / Concierge'
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

  function toggleNeighborhood(neighborhood: string) {
    if (formData.selectedNeighborhoods.includes(neighborhood)) {
      formData.selectedNeighborhoods = formData.selectedNeighborhoods.filter(n => n !== neighborhood);
    } else {
      formData.selectedNeighborhoods = [...formData.selectedNeighborhoods, neighborhood];
    }
    
    // Update select all state
    selectAllNeighborhoods = formData.selectedNeighborhoods.length === neighborhoods.length;
  }

  function toggleFeature(feature: string) {
    if (formData.idealFeatures.includes(feature)) {
      formData.idealFeatures = formData.idealFeatures.filter(f => f !== feature);
    } else {
      formData.idealFeatures = [...formData.idealFeatures, feature];
    }
  }

  function togglePropertyType(type: string) {
    if (formData.propertyTypes.includes(type)) {
      formData.propertyTypes = formData.propertyTypes.filter(t => t !== type);
    } else {
      formData.propertyTypes = [...formData.propertyTypes, type];
    }
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      // Scroll to top immediately when changing steps
      window.scrollTo(0, 0);
      // Also try to scroll the body element
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      // Scroll to top immediately when changing steps
      window.scrollTo(0, 0);
      // Also try to scroll the body element
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  }

  // Phone verification functions
  async function sendPhoneOTP() {
    phoneVerification.phoneError = '';
    phoneVerification.isVerifying = true;

    try {
      // Format phone number - remove any spaces or special characters
      const cleanedPhone = phoneVerification.phone.replace(/\D/g, '');
      
      // Basic validation (minimum 7 digits for most countries)
      if (cleanedPhone.length < 7) {
        phoneVerification.phoneError = 'Please enter a valid mobile number';
        phoneVerification.isVerifying = false;
        return;
      }
      
      // Format phone number based on country code
      let formattedPhone = '';
      if (phoneVerification.countryCode === '+44') {
        // UK specific formatting - remove leading 0 if present
        const phoneWithoutLeading = cleanedPhone.startsWith('0') ? cleanedPhone.substring(1) : cleanedPhone;
        formattedPhone = phoneVerification.countryCode + phoneWithoutLeading;
      } else {
        // For other countries, just append the cleaned number
        formattedPhone = phoneVerification.countryCode + cleanedPhone;
      }
      
      // Check if we need to create account first (for new users)
      const signupDataStr = localStorage.getItem('pendingSignup');
      const pendingSignup = signupDataStr ? JSON.parse(signupDataStr) : null;
      
      let userId = currentUser?.id;
      
      if (pendingSignup && !currentUser) {
        // Check if this is an existing user
        if (pendingSignup.existingUser) {
          // Existing user - they need to login first
          phoneVerification.phoneError = 'Please login first to verify your phone number';
          phoneVerification.isVerifying = false;
          
          // Redirect to login after a short delay
          setTimeout(() => {
            const params = new URLSearchParams();
            params.set('email', personalInfo.email);
            if (pendingSignup.redirectUrl) {
              params.set('redirect', pendingSignup.redirectUrl);
            }
            const loginUrl = `/login?${params.toString()}`;
            goto(loginUrl);
          }, 2000);
          return;
        } else {
          // New user - create account
          const profileData = {
            email: personalInfo.email,
            first_name: personalInfo.firstName,
            last_name: personalInfo.lastName,
            buyer_type: mapFormToDatabase(formData.buyerType, 'buyer_type'),
            timeframe: mapFormToDatabase(formData.timeframe, 'timeframe'),
            purchase_method: mapFormToDatabase(formData.purchaseMethod, 'purchase_method'),
            selling_property: formData.sellingProperty === 'yes',
            min_price: convertPriceToNumber(formData.priceMin),
            max_price: convertPriceToNumber(formData.priceMax),
            property_types: formData.propertyTypes,
            min_bedrooms: formData.bedroomsMin === 'no-min' ? null : parseInt(formData.bedroomsMin),
            max_bedrooms: formData.bedroomsMax === 'no-max' ? null : parseInt(formData.bedroomsMax),
            preferred_locations: formData.selectedNeighborhoods,
            ideal_features: formData.idealFeatures,
            profile_completed: false, // Not completed until phone verified
            ...(pendingSignup?.propertyContext && { 
              property_context: JSON.stringify(pendingSignup.propertyContext) 
            })
          };
          
          const { user: newUser, error: signupError } = await AuthService.signUp(
            personalInfo.email,
            personalInfo.password,
            profileData
          );

          if (signupError) {
            phoneVerification.phoneError = signupError;
            phoneVerification.isVerifying = false;
            return;
          }
          
          currentUser = newUser;
          userId = newUser?.id;
        }
      }
      
      // Send OTP via our custom API
      const response = await fetch('/api/phone-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          phone: formattedPhone,
          userId
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        phoneVerification.phoneError = result.error || 'Failed to send verification code';
      } else {
        phoneVerification.isOTPSent = true;
      }
    } catch (error: any) {
      phoneVerification.phoneError = 'Failed to send verification code. Please try again.';
    } finally {
      phoneVerification.isVerifying = false;
    }
  }

  async function verifyPhoneOTP() {
    phoneVerification.otpError = '';
    phoneVerification.isVerifying = true;

    try {
      // Format phone number same way as sendPhoneOTP
      const cleanedPhone = phoneVerification.phone.replace(/\D/g, '');
      let formattedPhone = '';
      if (phoneVerification.countryCode === '+44') {
        const phoneWithoutLeading = cleanedPhone.startsWith('0') ? cleanedPhone.substring(1) : cleanedPhone;
        formattedPhone = phoneVerification.countryCode + phoneWithoutLeading;
      } else {
        formattedPhone = phoneVerification.countryCode + cleanedPhone;
      }
      
      // Verify OTP via our custom API
      const response = await fetch('/api/phone-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone: formattedPhone,
          otp: phoneVerification.otp
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        phoneVerification.otpError = result.error || 'Invalid verification code';
      } else {
        // Phone verified successfully, complete onboarding
        await completeOnboardingWithPhone(formattedPhone);
      }
    } catch (error: any) {
      phoneVerification.otpError = 'Invalid verification code. Please try again.';
    } finally {
      phoneVerification.isVerifying = false;
    }
  }

  // Helper function to convert price range strings to numeric values
  function convertPriceToNumber(priceId: string): number | null {
    if (priceId === 'no-min' || priceId === 'no-max') return null;
    
    const priceMap: Record<string, number> = {
      '500k': 500000,
      '750k': 750000,
      '1m': 1000000,
      '1-5m': 1500000,
      '2m': 2000000,
      '2-5m': 2500000,
      '3m': 3000000,
      '4m': 4000000,
      '5m': 5000000,
      '7-5m': 7500000,
      '10m': 10000000,
      '15m': 15000000,
      '20m': 20000000
    };
    
    return priceMap[priceId] || null;
  }

  // Map form values to database enum values
  function mapFormToDatabase(formValue: string, type: 'buyer_type' | 'timeframe' | 'purchase_method'): string {
    const mappings = {
      buyer_type: {
        'buying-home': 'first_time_buyer',
        'investor': 'investor',
        'developer': 'other',
        'buying-agent': 'other'
      } as Record<string, string>,
      timeframe: {
        'asap': 'asap',
        'within-6': '3-6months',
        'within-year': '6-12months',
        'right-place': 'exploring'
      } as Record<string, string>,
      purchase_method: {
        'mortgage': 'mortgage',
        'cash': 'cash',
        'part_cash_part_mortgage': 'part_cash_part_mortgage'
      } as Record<string, string>
    };
    
    return mappings[type][formValue] || formValue;
  }

  function isStepComplete(stepIndex: number) {
    switch (stepIndex) {
      case 0:
        // Personal info step
        return !!(personalInfo.firstName && personalInfo.lastName && personalInfo.email && personalInfo.password);
      case 1:
        // Buyer preferences step
        const step1Required = formData.buyerType !== '' && formData.timeframe !== '' && formData.purchaseMethod !== '' && formData.sellingProperty !== '';
        if (formData.sellingProperty === 'yes') {
          return step1Required && formData.currentlyOnMarket !== '';
        }
        return step1Required;
      case 2:
        // Location step - at least one neighborhood selected
        return formData.selectedNeighborhoods.length > 0;
      case 3:
        // Property specifics step - at least one property type selected
        return formData.propertyTypes.length > 0;
      case 4:
        // Phone verification step - completed when phone is entered
        return phoneVerification.phone !== '';
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
        console.log('Loaded signup data:', { 
          email: signupData.email, 
          hasPropertyContext: !!signupData.propertyContext,
          existingUser: signupData.existingUser 
        });
        
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
        
        // If existing user, pre-fill their data
        if (signupData.existingUser) {
          console.log('Existing user - attempting to load profile data');
          const { profile } = await AuthService.getUserProfileByEmail(signupData.email);
          if (profile) {
            // Pre-fill form with existing data
            personalInfo.firstName = profile.first_name || '';
            personalInfo.lastName = profile.last_name || '';
            // Don't pre-fill password for existing users
          }
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

  // Complete onboarding with phone verification
  async function completeOnboardingWithPhone(phoneNumber: string) {
    isLoading = true;
    
    try {
      // Get pending signup data
      const signupDataStr = localStorage.getItem('pendingSignup');
      const pendingSignup = signupDataStr ? JSON.parse(signupDataStr) : null;
      
      // Make sure we have a user (should be created in sendPhoneOTP)
      if (!currentUser) {
        throw new Error('No user session found. Please try again.');
      }
      
      // Update user profile to mark as completed
      const { error } = await AuthService.updateUserProfile(currentUser.id, {
        phone: phoneNumber,
        profile_completed: true
      });

      if (error) {
        throw new Error(error);
      }
      
      // Clear pending signup data
      localStorage.removeItem('pendingSignup');
      
      // Show success message
      alert('Account created successfully! Please check your email to verify your account before signing in.');
      
      // Redirect to login or original destination
      const redirectTarget = pendingSignup?.redirectUrl ? `/login?redirect=${encodeURIComponent(pendingSignup.redirectUrl)}` : '/login';
      goto(redirectTarget);
      
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      alert(`Error completing onboarding: ${error.message || error}`);
    } finally {
      isLoading = false;
    }
  }

</script>

<svelte:head>
  <title>Personalize Your Experience - Off Market Prime</title>
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
          <h1 class="luxury-heading text-xl mb-3">Let's get to know you</h1>
          <p class="luxury-text text-sm">This information will be used so agents and sellers can respond to you</p>
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
        </div>

      {:else if currentStep === 1}
        <!-- Buyer Type -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-xl mb-3">Set Your Buying Preferences</h1>
          <p class="luxury-text text-sm">Your preferences help us refine your property matches.</p>
        </div>

        <div class="space-y-8">
          <!-- Buyer Type -->
          <div>
            <h2 class="luxury-heading text-lg mb-4">Buyer Type</h2>
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
                    class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                    class:border-luxury-blue={formData.buyerType === type.id}
                    class:bg-luxury-lightblue={formData.buyerType === type.id}
                    class:border-gray-200={formData.buyerType !== type.id}
                  >
                    <h3 class="font-medium text-luxury-charcoal">{type.label}</h3>
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <!-- When you are looking to move -->
          <div>
            <h2 class="luxury-heading text-lg mb-4">When you are looking to move</h2>
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
            <h2 class="luxury-heading text-lg mb-4">Purchase Method</h2>
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
            <h2 class="luxury-heading text-lg mb-4">Selling a Property</h2>
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
              <h2 class="luxury-heading text-lg mb-4">Currently on Market</h2>
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
          <h1 class="luxury-heading text-xl mb-3">Where</h1>
          <p class="luxury-text text-sm">Select your preferred neighborhoods in London.</p>
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
          <h1 class="luxury-heading text-xl mb-3">Property Specifics</h1>
          <p class="luxury-text text-sm">Help us understand your ideal property requirements.</p>
        </div>

        <div class="space-y-8">
          <!-- Price Range Min/Max -->
          <div>
            <h2 class="luxury-heading text-lg mb-4">Price Range</h2>
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
            <h2 class="luxury-heading text-lg mb-4">Number of Bedrooms</h2>
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
            <h2 class="luxury-heading text-lg mb-4">Property Type</h2>
            <p class="text-sm text-gray-600 mb-4">Select all property types you're interested in</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each propertyTypes as type}
                <label class="relative">
                  <input 
                    type="checkbox" 
                    checked={formData.propertyTypes.includes(type.id)}
                    on:change={() => togglePropertyType(type.id)}
                    class="sr-only"
                  />
                  <div 
                    class="p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:border-luxury-blue text-center"
                    class:border-luxury-blue={formData.propertyTypes.includes(type.id)}
                    class:bg-luxury-lightblue={formData.propertyTypes.includes(type.id)}
                    class:border-gray-200={!formData.propertyTypes.includes(type.id)}
                  >
                    <span class="font-medium text-luxury-charcoal text-lg">{type.label}</span>
                    {#if formData.propertyTypes.includes(type.id)}
                      <div class="absolute top-2 right-2">
                        <Check class="h-5 w-5 text-luxury-blue" />
                      </div>
                    {/if}
                  </div>
                </label>
              {/each}
            </div>
          </div>

          <!-- Ideal Features -->
          <div>
            <h2 class="luxury-heading text-lg mb-4">Ideal Features</h2>
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
        <!-- Phone Verification -->
        <div class="text-center mb-8">
          <h1 class="luxury-heading text-xl mb-3">Just one more step</h1>
          <p class="luxury-text text-sm">Mobile verification is required for privacy and security.</p>
        </div>

        <div class="max-w-md mx-auto space-y-6">
          <!-- Phone Number Input -->
          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-3">Mobile number</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center">
                <select
                  bind:value={phoneVerification.countryCode}
                  disabled={phoneVerification.isOTPSent}
                  class="h-full rounded-l-md border-gray-300 bg-transparent py-0 pl-3 pr-6 text-gray-700 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue border-r-0 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {#each countryCodes as country}
                    <option value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  {/each}
                </select>
              </div>
              <input
                id="phoneNumber"
                type="tel"
                bind:value={phoneVerification.phone}
                disabled={phoneVerification.isOTPSent}
                placeholder={phoneVerification.countryCode === '+44' ? '7XXXXXXXXX' : 'Enter phone number'}
                class="block w-full rounded-md border-gray-300 pl-[5.5rem] pr-3 py-3 text-gray-900 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            {#if phoneVerification.phoneError}
              <p class="mt-2 text-sm text-red-600">{phoneVerification.phoneError}</p>
            {/if}
          </div>

          <!-- OTP Input (shown after phone number is submitted) -->
          {#if phoneVerification.isOTPSent}
            <div>
              <label for="otpCode" class="block text-sm font-medium text-gray-700 mb-3">Enter verification code</label>
              <input
                id="otpCode"
                type="text"
                bind:value={phoneVerification.otp}
                placeholder="6-digit code"
                maxlength="6"
                class="block w-full rounded-md border-gray-300 px-3 py-3 text-gray-900 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue text-center text-lg tracking-widest"
              />
              {#if phoneVerification.otpError}
                <p class="mt-2 text-sm text-red-600">{phoneVerification.otpError}</p>
              {/if}
              <p class="mt-2 text-sm text-gray-600">We sent a 6-digit code to {phoneVerification.countryCode}{phoneVerification.phone}</p>
            </div>
          {/if}

          <!-- Action Button -->
          <button
            on:click={phoneVerification.isOTPSent ? verifyPhoneOTP : sendPhoneOTP}
            disabled={phoneVerification.isVerifying || (!phoneVerification.isOTPSent && !phoneVerification.phone) || (phoneVerification.isOTPSent && phoneVerification.otp.length !== 6)}
            class="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium"
          >
            {#if phoneVerification.isVerifying}
              Verifying...
            {:else if phoneVerification.isOTPSent}
              Verify & Complete
            {:else}
              Send code
            {/if}
          </button>

          {#if phoneVerification.isOTPSent}
            <button
              on:click={() => { phoneVerification.isOTPSent = false; phoneVerification.otp = ''; phoneVerification.otpError = ''; }}
              class="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
            >
              Change phone number
            </button>
          {/if}
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

        <button
          on:click={nextStep}
          disabled={!isStepComplete(currentStep)}
          class="flex items-center space-x-2 luxury-button rounded-md px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</div> 