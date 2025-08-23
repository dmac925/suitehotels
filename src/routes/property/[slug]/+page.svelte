<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ChevronLeft, Heart, Share2, Bath, Bed, Maximize, MapPin, Calendar, Eye } from 'lucide-svelte';
  import { AuthService } from '$lib/auth';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let isAuthenticated = false;
  let currentUser: any = null;
  // Start with false so SEO crawlers see content immediately
  let isLoadingAuth = false;
  
  // Get property data from server
  $: rawProperty = data.property;
  $: serverError = data.error;
  
  // Get property slug from URL
  $: propertySlug = $page.params.slug;
  
  // Current image index for gallery
  let currentImageIndex = 0;
  

  
  // Modal state for request viewing
  let showRequestModal = false;
  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = '';
  
  // Form data
  let formData = {
    message: ''
  };
  
  // Function to parse property images from Supabase JSON
  function parsePropertyImages(property: any): string[] {
    if (!property?.images) {
      return ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'];
    }

    try {
      // If images is already an array
      if (Array.isArray(property.images)) {
        return property.images.map((img: any) => 
          typeof img === 'object' ? img.url : img
        ).filter(Boolean);
      }
      
      // If images is a JSON string, parse it
      if (typeof property.images === 'string') {
        const parsedImages = JSON.parse(property.images);
        if (Array.isArray(parsedImages)) {
          return parsedImages.map((img: any) => 
            typeof img === 'object' ? img.url : img
          ).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('Error parsing property images:', e);
    }
    
    return ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'];
  }

  // Function to parse property features from Supabase
  function parsePropertyFeatures(property: any): string[] {
    if (!property?.features) {
      return [];
    }

    try {
      // If features is already an array
      if (Array.isArray(property.features)) {
        return property.features.filter(Boolean);
      }
      
      // If features is a JSON string, parse it
      if (typeof property.features === 'string') {
        const parsedFeatures = JSON.parse(property.features);
        if (Array.isArray(parsedFeatures)) {
          return parsedFeatures.filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('Error parsing property features:', e);
    }
    
    return [];
  }

  // Helper function to get price range for non-authenticated users
  function getPriceRange(price: string | number): string {
    // Extract numeric value from price string
    let numericPrice = 0;
    if (typeof price === 'number') {
      numericPrice = price;
    } else if (typeof price === 'string') {
      // Remove currency symbols and parse
      const cleaned = price.replace(/[£$,]/g, '');
      numericPrice = parseInt(cleaned) || 0;
    }
    
    if (numericPrice === 0) {
      return 'Price on application';
    }
    
    // Define price ranges
    if (numericPrice < 750000) {
      return '£500k - £750k';
    } else if (numericPrice < 1000000) {
      return '£750k - £1m';
    } else if (numericPrice < 1500000) {
      return '£1m - £1.5m';
    } else if (numericPrice < 2000000) {
      return '£1.5m - £2m';
    } else if (numericPrice < 3000000) {
      return '£2m - £3m';
    } else if (numericPrice < 5000000) {
      return '£3m - £5m';
    } else if (numericPrice < 7500000) {
      return '£5m - £7.5m';
    } else if (numericPrice < 10000000) {
      return '£7.5m - £10m';
    } else if (numericPrice < 15000000) {
      return '£10m - £15m';
    } else if (numericPrice < 20000000) {
      return '£15m - £20m';
    } else if (numericPrice < 30000000) {
      return '£20m - £30m';
    } else if (numericPrice < 50000000) {
      return '£30m - £50m';
    } else if (numericPrice < 75000000) {
      return '£50m - £75m';
    } else if (numericPrice < 100000000) {
      return '£75m - £100m';
    } else {
      return '£100m+';
    }
  }

  // Transform Supabase property data to expected format
  $: property = rawProperty ? {
    id: rawProperty.id,
    title: rawProperty.title || 'Property Title',
    location: `${rawProperty.address || 'London'} • ${rawProperty.tenure || 'Freehold'}`,
    price: rawProperty.price_display || rawProperty.price?.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }) || 'Price on request',
    priceRange: getPriceRange(rawProperty.price_display || rawProperty.price || 0),
    priceNumeric: rawProperty.price || 0,
    priceGuide: rawProperty.price_guide || 'Price guide',
    bedrooms: rawProperty.bedrooms || 0,
    bathrooms: rawProperty.bathrooms || 0,
    sqft: rawProperty.sqft || 0,
    propertyType: rawProperty.property_type?.charAt(0).toUpperCase() + rawProperty.property_type?.slice(1) || 'Property',
    images: parsePropertyImages(rawProperty),
    description: rawProperty.description || 'Luxury property in London.',
    features: parsePropertyFeatures(rawProperty),
    floorplanUrl: rawProperty.floorplan_url || 'https://placehold.co/800x600/f8f8f8/333333?text=Floorplan',
    locationDetails: {
      address: rawProperty.address || 'London',
      transport: [
        'Central London - 30 mins',
        'Underground nearby',
        'Excellent transport links'
      ]
    }
  } : null;
  
  // Helper function to create signup URL with property context
  function createSignupUrlWithPropertyContext() {
    if (!property) {
      return '/signup';
    }
    
    const params = new URLSearchParams({
      redirect: `/property/${propertySlug}`,
      propertyId: property.id.toString(),
      address: property.locationDetails.address,
      price: property.price,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      sqft: property.sqft.toString(),
      image: property.images[0]
    });
    return `/signup?${params.toString()}`;
  }

  onMount(async () => {
    // Only check auth on client side, start loading after mount
    isLoadingAuth = true;
    
    try {
      // Check authentication and email verification
      const { user } = await AuthService.getCurrentUser();
      
      if (user && user.email_confirmed_at) {
        // User is authenticated and email is verified
        isAuthenticated = true;
        currentUser = user;
      }
      // If not authenticated, we'll show the partial/SEO view instead of redirecting
    } catch (error) {
      console.error('Authentication error:', error);
      // On error, just show the partial view
      isAuthenticated = false;
    } finally {
      // Set loading to false only after auth check is complete
      isLoadingAuth = false;
    }
  });
  
  // Separate onMount for scroll listener to avoid async/return issues
  onMount(() => {
    // Set fixed viewport height to prevent browser UI from hiding
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', setViewportHeight);
    
    // Set initial viewport height
    setViewportHeight();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setViewportHeight);
    };
  });
  
  function handleBack() {
    window.history.back();
  }
  
  function nextImage() {
    if (!property) return;
    currentImageIndex = (currentImageIndex + 1) % property.images.length;
  }
  
  function prevImage() {
    if (!property) return;
    currentImageIndex = (currentImageIndex - 1 + property.images.length) % property.images.length;
  }
  
  function selectImage(index: number) {
    currentImageIndex = index;
  }
  
  // Touch handling for swipe
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }
  
  function handleTouchMove(e: TouchEvent) {
    if (!isSwiping) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = Math.abs(touchX - touchStartX);
    const diffY = Math.abs(touchY - touchStartY);
    
    // If horizontal movement is greater than vertical, prevent default to stop page bounce
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }
  
  function handleTouchEnd(e: TouchEvent) {
    if (!isSwiping) return;
    
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
    isSwiping = false;
  }
  
  function handleSwipe() {
    const swipeThreshold = 50; // minimum distance for swipe
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - next image
        nextImage();
      } else {
        // Swiped right - previous image
        prevImage();
      }
    }
  }
  
  // Modal functions
  function openRequestModal() {
    showRequestModal = true;
    // Reset form state
    submitSuccess = false;
    submitError = '';
  }
  
  function closeRequestModal() {
    showRequestModal = false;
    // Reset form data
    formData = {
      message: ''
    };
  }
  
  // Form submission
  async function submitViewingRequest() {
    if (!currentUser) {
      submitError = 'Please log in to request a viewing.';
      return;
    }
    
    isSubmitting = true;
    submitError = '';
    
    try {
      // Prepare data for submission
      const requestData = {
        property_id: property?.id || propertySlug,
        property_title: property?.title || 'Property',
        property_location: property?.location || 'London',
        property_price: property?.price || 'Price on request',
        user_name: `${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() || currentUser.email,
        user_email: currentUser.email,
        user_phone: currentUser.user_metadata?.phone || '',
        message: formData.message,
        user_id: currentUser.id,
        created_at: new Date().toISOString()
      };
      
      // Send to your API endpoint (you'll need to create this)
      const response = await fetch('/api/viewing-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit request');
      }
      
      submitSuccess = true;
      setTimeout(() => {
        closeRequestModal();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting viewing request:', error);
      submitError = 'Failed to submit request. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>{property ? `${property.bedrooms} Bed ${property.propertyType} in ${property.location.split(',')[0].split(' ').slice(0, 2).join(' ')}` : 'Property Details'} | Off Market Prime</title>
  <meta name="description" content="{property ? `${property.bedrooms} bed ${property.propertyType.toLowerCase()} in ${property.location.split(',')[0]}. ${property.bathrooms} bath, ${property.sqft ? property.sqft.toLocaleString() + ' sq ft. ' : ''}${property.priceRange}. Sign up for full details.` : 'Luxury off-market property details from Off Market Prime'}" />
  <meta property="og:title" content="{property ? `${property.bedrooms} Bedroom ${property.propertyType} - ${property.priceRange}` : 'Off Market Property'}" />
  <meta property="og:description" content="{property ? `Exclusive ${property.bedrooms} bed ${property.propertyType.toLowerCase()} in ${property.location.split(',')[0]}. Price range: ${property.priceRange}. Sign up to view exact price, photos and request viewings.` : 'View exclusive off-market properties'}" />
  <meta property="og:type" content="website" />
  {#if property && property.images && property.images[0]}
    <meta property="og:image" content="{property.images[0]}" />
  {/if}
  <meta name="robots" content="index, follow" />
  
  <!-- Structured Data for SEO -->
  {#if property}
    {@html `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": "${property.bedrooms} Bedroom ${property.propertyType} in ${property.location.split(',')[0]}",
        "description": "${property.description ? property.description.substring(0, 200).replace(/"/g, '\\"') : ''}",
        "image": ${property.images && property.images[0] ? `"${property.images[0]}"` : 'null'},
        "url": "https://offmarketprime.com/property/${propertySlug}",
        "numberOfRooms": ${property.bedrooms || 0},
        "numberOfBathroomsTotal": ${property.bathrooms || 0},
        "floorSize": {
          "@type": "QuantitativeValue",
          "value": ${property.sqft || 0},
          "unitCode": "FTK"
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "${property.location.split(',')[0]}",
          "addressRegion": "London",
          "addressCountry": "GB"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "GBP",
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "${property.priceRange}",
            "priceCurrency": "GBP"
          },
          "availability": "https://schema.org/InStock"
        }
      }
    </script>`}
  {/if}
</svelte:head>

<style>
  /* Import elegant fonts */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500&family=Inter:wght@300;400;500&display=swap');
  
  /* Page-specific container to prevent browser UI from hiding */
  .property-detail-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    height: calc(var(--vh, 1vh) * 100);
    overflow: hidden;
    touch-action: pan-y pinch-zoom;
  }
  
  /* Main scrollable container */
  .page-container {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    position: relative;
    /* Account for sticky header */
    padding-top: 64px;
  }
  
  /* Fixed bottom bar with safe area handling */
  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  
  /* Ensure main content has proper spacing */
  .main-content {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0));
  }
  
  /* Carousel container styles to prevent layout shift */
  .carousel-container {
    position: relative;
    width: 100%;
    aspect-ratio: 4/3;
    overflow: hidden;
    background-color: #f3f4f6;
    touch-action: pan-y pinch-zoom;
  }
  
  .carousel-track {
    display: flex;
    height: 100%;
    transition: transform 300ms ease-out;
    will-change: transform;
  }
  
  .carousel-slide {
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
</style>

<div class="property-detail-page">
<div class="page-container bg-white">

{#if serverError}
  <!-- Server error loading property -->
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center max-w-md mx-auto px-4">
      <div class="text-red-500 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Property Not Found</h1>
      <p class="text-gray-600 mb-6">The property you're looking for could not be found or is no longer available.</p>
      <a href="/london" class="bg-luxury-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
        Browse All Properties
      </a>
    </div>
  </div>
{:else if !property}
  <!-- No property data -->
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading property...</p>
    </div>
  </div>
{:else}
  <!-- Show property content (full for authenticated, partial for SEO) -->

  {#if !isAuthenticated}
    <!-- SEO-Friendly Partial View for Non-Authenticated Users -->
    <div class="min-h-screen bg-white">
      <!-- Header with basic property info -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 class="text-2xl md:text-3xl font-light text-gray-900 mb-2">
            {property.bedrooms} Bedroom {property.propertyType} in {property.location.split(',')[0]}
          </h1>
          <p class="text-gray-600">Price range: {property.priceRange}</p>
        </div>
      </div>

      <!-- Limited Image Preview with Blur Overlay -->
      <div class="relative">
        <div class="relative h-64 md:h-96 overflow-hidden bg-gray-100">
          {#if property.images && property.images[0]}
            <img 
              src={property.images[0]} 
              alt="{property.bedrooms} bedroom {property.propertyType.toLowerCase()} in {property.location.split(',')[0]}"
              class="w-full h-full object-cover filter blur-sm"
            />
          {/if}
          <!-- Overlay with Sign Up CTA -->
          <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div class="text-center text-white p-6">
              <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <div class="text-xl md:text-2xl font-medium mb-2">Sign up to view full details</div>
              <p class="text-sm md:text-base mb-4">Get access to all photos, floorplans, and location</p>
              <a href={createSignupUrlWithPropertyContext()} class="inline-block bg-white text-gray-900 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors">
                Create Free Account
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- SEO Content Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="md:col-span-2">
            <!-- Property Overview -->
            <div class="mb-8">
              <h2 class="text-xl font-medium text-gray-900 mb-4">Property Overview</h2>
              <div class="grid grid-cols-3 gap-4 mb-6">
                {#if property.bedrooms && property.bedrooms > 0}
                  <div class="text-center p-4 bg-gray-50 rounded">
                    <div class="text-2xl font-light text-gray-900">{property.bedrooms}</div>
                    <div class="text-sm text-gray-600">Bedrooms</div>
                  </div>
                {/if}
                {#if property.bathrooms && property.bathrooms > 0}
                  <div class="text-center p-4 bg-gray-50 rounded">
                    <div class="text-2xl font-light text-gray-900">{property.bathrooms}</div>
                    <div class="text-sm text-gray-600">Bathrooms</div>
                  </div>
                {/if}
                {#if property.sqft && property.sqft > 0}
                  <div class="text-center p-4 bg-gray-50 rounded">
                    <div class="text-2xl font-light text-gray-900">{property.sqft.toLocaleString()}</div>
                    <div class="text-sm text-gray-600">Sq Ft</div>
                  </div>
                {/if}
              </div>
              
              <!-- Truncated Description -->
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 leading-relaxed">
                  {property.description.substring(0, 200)}...
                </p>
                <p class="text-gray-500 italic mt-2">
                  Sign up to read the full property description and view all details.
                </p>
              </div>
            </div>

            <!-- Limited Features List -->
            {#if property.features && property.features.length > 0}
              <div class="mb-8">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Key Features</h2>
                <ul class="space-y-2">
                  {#each property.features.slice(0, 3) as feature}
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      <span class="text-gray-700">{feature}</span>
                    </li>
                  {/each}
                  {#if property.features.length > 3}
                    <li class="text-gray-500 italic">
                      + {property.features.length - 3} more features available to registered users
                    </li>
                  {/if}
                </ul>
              </div>
            {/if}

            <!-- Area Information (Generic) -->
            <div class="mb-8">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Location</h2>
              <p class="text-gray-700 mb-2">
                This property is located in {property.location.split(',')[0]}, one of London's most desirable areas.
              </p>
              <p class="text-gray-500 italic">
                Location and transport links available to registered users.
              </p>
            </div>

            <!-- About Off-Market Properties Section -->
            <div class="mb-8">
              <h2 class="text-lg font-medium text-gray-900 mb-4">About Off-Market Properties</h2>
              <div class="space-y-4 text-gray-700">
                <p>
                  This exclusive {property.bedrooms} bedroom {property.propertyType.toLowerCase()} represents a rare opportunity in London's off-market property sector. Off-market properties, also known as pocket listings, are not publicly advertised and offer distinct advantages for discerning buyers seeking privacy and exclusive access to premium real estate opportunities.
                </p>
                <p>
                  Properties in {property.location.split(',')[0]} typically attract significant interest from both domestic and international buyers, making off-market opportunities particularly valuable. This {property.propertyType.toLowerCase()} offers {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}{property.bathrooms > 0 ? `, ${property.bathrooms} ${property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}` : ''}{property.sqft > 0 ? `, and ${property.sqft.toLocaleString()} square feet of living space` : ''}, presenting an exceptional investment opportunity in one of London's most sought-after locations.
                </p>
                <p>
                  Off Market Prime specializes in connecting qualified buyers with exclusive properties before they reach the public market. Our curated portfolio includes luxury apartments, townhouses, and family homes across London's premier neighborhoods. Each property is carefully vetted to ensure it meets our high standards for quality, location, and investment potential.
                </p>
              </div>
            </div>

            <!-- Why Choose Off-Market Section -->
            <div class="mb-8">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Why Choose Off-Market Properties?</h2>
              <div class="space-y-3 text-gray-700">
                <p>
                  Purchasing an off-market property provides several key advantages in today's competitive London real estate market:
                </p>
                <ul class="space-y-2 ml-4">
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span><strong>Less Competition:</strong> Access properties before they're publicly listed, reducing bidding wars and allowing for more thoughtful decision-making.</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span><strong>Privacy:</strong> Both buyers and sellers benefit from discreet transactions that maintain confidentiality throughout the process.</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span><strong>Better Negotiation:</strong> Direct access to sellers often leads to more favorable terms and pricing opportunities.</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span><strong>Exclusive Access:</strong> View premium properties that may never reach the public market, including estates from private collections.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Sidebar CTA -->
          <div class="md:col-span-1">
            <div class="sticky top-4">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div class="mb-4">
                  <p class="text-sm text-gray-600 mb-1">Price Range</p>
                  <p class="text-2xl font-light text-gray-900">{property.priceRange}</p>
                </div>
                <div class="text-lg font-medium text-gray-900 mb-4">Get Full Access</div>
                <ul class="space-y-3 mb-6">
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span class="text-sm text-gray-700">See exact asking price</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span class="text-sm text-gray-700">View all {property.images.length} property photos</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span class="text-sm text-gray-700">See detailed floorplans</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span class="text-sm text-gray-700">Get property location</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span class="text-sm text-gray-700">Request property viewings</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span class="text-sm text-gray-700">Contact selling agents directly</span>
                  </li>
                </ul>
                <a href={createSignupUrlWithPropertyContext()} class="block w-full text-center bg-gray-900 text-white px-4 py-3 rounded-md hover:bg-gray-800 transition-colors mb-3">
                  Sign Up - It's Free
                </a>
                <p class="text-center text-sm text-gray-600">
                  Already have an account? 
                  <a href="/signin?redirect=/property/{propertySlug}" class="text-blue-600 hover:underline">Sign in</a>
                </p>
              </div>

              <!-- Trust Indicators -->
              <div class="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                <div class="text-sm font-medium text-gray-900 mb-3">Why Off Market Prime?</div>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>✓ Exclusive off-market properties</li>
                  <li>✓ Verified listings only</li>
                  <li>✓ Direct agent contact</li>
                  <li>✓ No spam or ads</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA Bar for Mobile -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <a href={createSignupUrlWithPropertyContext()} class="block w-full text-center bg-gray-900 text-white px-4 py-3 rounded-md hover:bg-gray-800 transition-colors">
          Sign Up to View Full Details
        </a>
      </div>
    </div>
  {:else}
    <!-- Full View for Authenticated Users -->

  <!-- Main Property Header Bar - Desktop only -->
  <div class="hidden md:block bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-6 py-3">
      <div class="flex items-center justify-between">
        <!-- Left side: Property info -->
        <div class="flex flex-col gap-1">
          <div class="text-lg font-medium text-gray-900">{property.title}, {property.location.split('•')[0].trim()}</div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-base font-medium text-gray-900">{property.price}</span>
            
            <!-- Bedrooms - always show if available -->
            {#if property.bedrooms && property.bedrooms > 0}
              <span class="text-gray-400">•</span>
              <span class="text-gray-700">{property.bedrooms} Beds</span>
            {/if}
            
            <!-- Bathrooms - only show if available -->
            {#if property.bathrooms && property.bathrooms > 0}
              <span class="text-gray-400">•</span>
              <span class="text-gray-700">{property.bathrooms} Baths</span>
            {/if}
            
            <!-- Square footage - only show if available -->
            {#if property.sqft && property.sqft > 0}
              <span class="text-gray-400">•</span>
              <span class="text-gray-700">{property.sqft.toLocaleString()} SQ.FT.</span>
            {/if}
          </div>
        </div>
        
        <!-- Right side: Action buttons -->
        <div class="flex items-center gap-2">
          <a href="/property/{propertySlug}/floorplan" class="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Floorplan
          </a>
          <a href="/property/{propertySlug}/gallery" class="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Gallery ({property.images.length})
          </a>

          <button class="p-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors">
            <Share2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Property Info - Non-sticky, appears below header -->
  <div class="md:hidden bg-white">
    <div class="px-4 pt-4 pb-2">
      <div class="text-center space-y-2">
        <!-- Property title -->
        <div class="text-lg font-medium text-gray-900">{property.title}, {property.location.split('•')[0].trim()}</div>
        
        <!-- Price and property details on one line -->
        <div class="flex items-center justify-center gap-2 text-sm text-gray-700">
          <span class="font-medium text-gray-900">{property.price}</span>
          
          <!-- Bedrooms - always show if available -->
          {#if property.bedrooms && property.bedrooms > 0}
            <span class="text-gray-400">•</span>
            <span>{property.bedrooms} Beds</span>
          {/if}
          
          <!-- Bathrooms - only show if available -->
          {#if property.bathrooms && property.bathrooms > 0}
            <span class="text-gray-400">•</span>
            <span>{property.bathrooms} Baths</span>
          {/if}
          
          <!-- Square footage - only show if available -->
          {#if property.sqft && property.sqft > 0}
            <span class="text-gray-400">•</span>
            <span>{property.sqft.toLocaleString()} SQ.FT.</span>
          {/if}
        </div>
        

      </div>
    </div>
  </div>

  <!-- Image Gallery -->
  <section class="md:bg-gray-50 md:py-8">
    <!-- Mobile: Full width -->
    <div class="md:hidden">
      <div 
        class="carousel-container"
        on:touchstart={handleTouchStart}
        on:touchmove={handleTouchMove}
        on:touchend={handleTouchEnd}
      >
        <!-- Image carousel -->
        <div 
          class="carousel-track"
          style="transform: translateX(-{currentImageIndex * 100}%)"
        >
          {#each property.images as image, index}
            <div class="carousel-slide">
              <img 
                src={image} 
                alt="{property.title} - Image {index + 1}"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          {/each}
        </div>
        
        <!-- Image counter -->
        <div class="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {currentImageIndex + 1} / {property.images.length}
        </div>
      </div>
      
      <!-- Mobile action buttons below image -->
      <div class="bg-white px-4 py-4">
        <div class="flex justify-center gap-3">
          <a href="/property/{propertySlug}/floorplan" class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Floorplan
          </a>
          <a href="/property/{propertySlug}/gallery" class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Gallery ({property.images.length})
          </a>
          <button class="p-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors">
            <Share2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop: Contained with navigation -->
    <div class="hidden md:block">
      <div class="max-w-5xl mx-auto px-6">
        <div 
          class="carousel-container rounded-lg shadow-lg mx-auto"
          style="max-height: 700px;"
          on:touchstart={handleTouchStart}
          on:touchmove={handleTouchMove}
          on:touchend={handleTouchEnd}
        >
          <!-- Image carousel -->
          <div 
            class="carousel-track"
            style="transform: translateX(-{currentImageIndex * 100}%)"
          >
            {#each property.images as image, index}
              <div class="carousel-slide">
                <img 
                  src={image} 
                  alt="{property.title} - Image {index + 1}"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            {/each}
          </div>
          
          <!-- Image counter -->
          <div class="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
          
          <!-- Navigation arrows - Desktop only -->
          <button 
            on:click={prevImage}
            class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft class="w-5 h-5 text-gray-700" />
          </button>
          <button 
            on:click={nextImage}
            class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="Next image"
          >
            <ChevronLeft class="w-5 h-5 text-gray-700 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Property Details -->
  <main class="bg-white main-content">
    <div class="max-w-7xl mx-auto px-6 py-16">
      
      <!-- Property Title and Stats (Full Width) -->
      <div class="text-center mb-16">
        <h1 class="text-3xl md:text-4xl font-light text-gray-900 mb-6" style="font-family: 'Georgia', 'Times New Roman', serif; letter-spacing: 0.02em;">
          {property.title}
        </h1>
        <div class="flex items-center justify-center gap-6 text-sm text-gray-600 mb-12" style="font-family: 'Helvetica Neue', 'Arial', sans-serif; font-weight: 300;">
          <span class="uppercase tracking-wider">{property.location.split('•')[0].trim()}</span>
          <span class="text-gray-400">•</span>
          <span class="uppercase tracking-wider">{property.propertyType}</span>
          {#if property.location.split('•')[1]}
            <span class="text-gray-400">•</span>
            <span class="uppercase tracking-wider">{property.location.split('•')[1].trim()}</span>
          {/if}
        </div>
        
        <!-- Property Stats Bar -->
        <div class="flex justify-center items-center gap-12 pb-16 border-b border-gray-200">
          {#if property.bedrooms && property.bedrooms > 0}
            <div class="text-center">
              <div class="text-2xl font-light text-gray-900" style="font-family: 'Georgia', serif;">{property.bedrooms}</div>
              <div class="text-xs uppercase tracking-widest text-gray-500 mt-1" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Bedrooms</div>
            </div>
          {/if}
          
          {#if property.bathrooms && property.bathrooms > 0}
            <div class="text-center">
              <div class="text-2xl font-light text-gray-900" style="font-family: 'Georgia', serif;">{property.bathrooms}</div>
              <div class="text-xs uppercase tracking-widest text-gray-500 mt-1" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Bathrooms</div>
            </div>
          {/if}
          
          {#if property.sqft && property.sqft > 0}
            <div class="text-center">
              <div class="text-2xl font-light text-gray-900" style="font-family: 'Georgia', serif;">{property.sqft.toLocaleString()}</div>
              <div class="text-xs uppercase tracking-widest text-gray-500 mt-1" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Square Feet</div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Two Column Layout: Description + Sidebar -->
      <div class="grid lg:grid-cols-3 gap-12">
        
        <!-- Left Column: Main Content (2 columns wide) -->
        <div class="lg:col-span-2 space-y-12">
          
          <!-- Description Section -->
          <div>
            <h2 class="text-xs uppercase tracking-widest text-gray-500 mb-6" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">About This Property</h2>
            <p class="text-gray-700 leading-relaxed" style="font-family: 'Georgia', serif; font-size: 1.125rem; line-height: 1.8;">
              {property.description}
            </p>
          </div>

          <!-- Features Section -->
          {#if property.features && property.features.length > 0}
            <div>
              <h2 class="text-xs uppercase tracking-widest text-gray-500 mb-6" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">Key Features</h2>
              <div class="grid md:grid-cols-2 gap-x-8 gap-y-3">
                {#each property.features as feature}
                  <div class="flex items-start">
                    <span class="text-gray-400 mr-3 mt-1.5" style="font-size: 0.5rem;">●</span>
                    <span class="text-gray-700" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300; font-size: 0.95rem;">{feature}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Transport Section -->
          <div>
            <h2 class="text-xs uppercase tracking-widest text-gray-500 mb-6" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">Transport Links</h2>
            <div class="space-y-2">
              {#each property.locationDetails.transport as transport}
                <div class="text-gray-700" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300; font-size: 0.95rem;">{transport}</div>
              {/each}
            </div>
          </div>
        </div>
        
        <!-- Right Column: Sticky Sidebar (1 column wide) - Desktop Only -->
        <div class="hidden lg:block lg:col-span-1">
          <div class="sticky top-24">
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div class="space-y-4">
                <div>
                  <p class="text-xs uppercase tracking-wider text-gray-500 mb-2" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">Price Guide</p>
                  <p class="text-2xl font-light text-gray-900" style="font-family: 'Georgia', serif;">{property.price}</p>
                </div>
                
                <div class="pt-4 border-t border-gray-200">
                  <div class="space-y-3">
                    {#if property.bedrooms && property.bedrooms > 0}
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Bedrooms</span>
                        <span class="text-gray-900" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">{property.bedrooms}</span>
                      </div>
                    {/if}
                    {#if property.bathrooms && property.bathrooms > 0}
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Bathrooms</span>
                        <span class="text-gray-900" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">{property.bathrooms}</span>
                      </div>
                    {/if}
                    {#if property.sqft && property.sqft > 0}
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Square Feet</span>
                        <span class="text-gray-900" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">{property.sqft.toLocaleString()}</span>
                      </div>
                    {/if}
                  </div>
                </div>
                
                <div class="pt-4">
                  <button 
                    on:click={openRequestModal}
                    class="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 text-sm uppercase tracking-wider rounded" 
                    style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400; letter-spacing: 0.1em;"
                  >
                    Request Viewing
                  </button>
                  <button 
                    class="w-full px-6 py-3 mt-3 border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all duration-300 text-sm uppercase tracking-wider rounded" 
                    style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400; letter-spacing: 0.1em;"
                  >
                    Save Property
                  </button>
                  <button 
                    class="w-full px-6 py-3 mt-3 border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all duration-300 text-sm uppercase tracking-wider rounded" 
                    style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400; letter-spacing: 0.1em;"
                  >
                    Share Property
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Agent Contact Info (Optional) -->
            <div class="mt-6 bg-gray-50 rounded-lg p-6">
              <div class="text-xs uppercase tracking-wider text-gray-500 mb-4" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">Contact Agent</div>
              <p class="text-sm text-gray-600 mb-4" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Get in touch with our team for more information or to arrange a viewing.</p>
              <a href="tel:+442012345678" class="text-sm text-gray-900 hover:text-gray-700" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">+44 20 1234 5678</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Fixed bottom bar - Mobile only -->
  <div class="lg:hidden bottom-bar bg-white border-t border-gray-200 shadow-lg z-50">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Price guide -->
        <div>
          <p class="text-sm text-gray-600">Price guide</p>
          <p class="text-lg font-medium text-gray-900">{property.price}</p>
        </div>
        
        <!-- Request viewing button -->
        <button 
          on:click={openRequestModal}
          class="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 text-sm uppercase tracking-wider rounded" 
          style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400; letter-spacing: 0.1em;"
        >
          Request Viewing
        </button>
      </div>
    </div>
  </div>
  {/if}
{/if}
</div>
</div>

<!-- Request Viewing Modal -->
{#if showRequestModal}
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
      on:click={closeRequestModal}
      on:keydown={(e) => e.key === 'Escape' && closeRequestModal()}
      role="button"
      tabindex="-1"
      aria-label="Close modal"
    ></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-end justify-center p-4 sm:items-center">
      <div class="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8">
        <!-- Header -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Request Viewing</h3>
            <button
              on:click={closeRequestModal}
              class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="bg-white px-6 py-4">
          <!-- Property info -->
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-900">{property?.title || 'Property'}</h4>
            <p class="text-sm text-gray-600">{property?.location || 'London'}</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{property?.price || 'Price on request'}</p>
          </div>

          {#if currentUser}
            <!-- User info display -->
            <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 class="text-sm font-medium text-blue-900 mb-2">Request will be sent from:</h4>
              <p class="text-sm text-blue-800">
                <strong>Name:</strong> {`${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() || currentUser.email}
              </p>
              <p class="text-sm text-blue-800">
                <strong>Email:</strong> {currentUser.email}
              </p>
              {#if currentUser.user_metadata?.phone}
                <p class="text-sm text-blue-800">
                  <strong>Phone:</strong> {currentUser.user_metadata.phone}
                </p>
              {/if}
            </div>
          {/if}
          
          {#if submitSuccess}
            <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-green-800 text-sm">✓ Your viewing request has been submitted successfully!</p>
            </div>
          {:else}
            <!-- Form -->
            <form on:submit|preventDefault={submitViewingRequest} class="space-y-4">
              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
                <textarea
                  id="message"
                  bind:value={formData.message}
                  rows="4"
                  placeholder="Tell us about your requirements, preferred viewing times, or any questions..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>
              
              {#if submitError}
                <div class="text-red-600 text-sm">{submitError}</div>
              {/if}
              
              <!-- Submit button -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  on:click={closeRequestModal}
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  class="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
