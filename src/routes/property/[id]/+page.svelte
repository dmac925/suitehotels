<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ChevronLeft, Heart, Share2, Bath, Bed, Maximize, MapPin, Calendar, Eye } from 'lucide-svelte';
  import { AuthService } from '$lib/auth';
  
  let isAuthenticated = false;
  let currentUser: any = null;
  
  // Get property ID from URL
  $: propertyId = $page.params.id;
  
  // Current image index for gallery
  let currentImageIndex = 0;
  
  // Scroll state for sticky header
  let showStickyHeader = false;
  
  // Modal state for request viewing
  let showRequestModal = false;
  let isSubmitting = false;
  let submitSuccess = false;
  let submitError = '';
  
  // Form data
  let formData = {
    message: ''
  };
  
  // Mock property data - replace with real data fetch
  const property = {
    id: 1,
    title: 'Albury Park Mansion',
    location: 'Guildford, Surrey • Freehold',
    price: '£1,795,000',
    priceGuide: 'Price guide',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 3003,
    propertyType: 'House',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
    ],
    description: 'An exceptional Georgian mansion set within beautifully landscaped gardens in the heart of Surrey. This magnificent property combines period elegance with contemporary luxury, offering spacious accommodation and unparalleled privacy.',
    features: [
      'Georgian mansion with period features',
      'Recently restored throughout',
      'Grand reception rooms',
      'Landscaped gardens and grounds',
      'Three double bedrooms',
      'Three luxury bathrooms',
      'Original architectural details',
      'Excellent transport links to London'
    ],
    floorplanUrl: 'https://placehold.co/800x600/f8f8f8/333333?text=Floorplan',
    locationDetails: {
      address: 'Albury Park, Guildford, Surrey',
      transport: [
        'Guildford Station - 10 mins drive',
        'London Waterloo - 45 mins by train',
        'Heathrow Airport - 30 mins drive'
      ]
    }
  };
  
  onMount(async () => {
    // Check authentication and email verification
    const { user } = await AuthService.getCurrentUser();
    
    if (!user) {
      // Not logged in - redirect to signup
      goto('/signup?redirect=/property/' + propertyId);
      return;
    }
    
    if (!user.email_confirmed_at) {
      // Email not verified - redirect to verification notice
      goto('/verify-email?redirect=/property/' + propertyId);
      return;
    }
    
    // User is authenticated and email is verified
    isAuthenticated = true;
    currentUser = user;
  });
  
  // Separate onMount for scroll listener to avoid async/return issues
  onMount(() => {
    // Add scroll listener for sticky header
    const handleScroll = () => {
      // Show sticky header when scrolled past the property info section (approx 300px)
      showStickyHeader = window.scrollY > 300;
    };
    
    // Set fixed viewport height to prevent browser UI from hiding
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', setViewportHeight);
    
    // Set initial viewport height
    setViewportHeight();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', setViewportHeight);
    };
  });
  
  function handleBack() {
    window.history.back();
  }
  
  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % property.images.length;
  }
  
  function prevImage() {
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
        property_id: propertyId,
        property_title: property.title,
        property_location: property.location,
        property_price: property.price,
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
  <title>{property.title} | Off Market Prime</title>
  <meta name="description" content="{property.title} - {property.location}. {property.bedrooms} bed {property.propertyType.toLowerCase()} for sale at {property.price}. {property.description}" />
</svelte:head>

<style>
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
  <!-- Mobile Sticky Header - Simple property name only (shows when scrolling) -->
  {#if showStickyHeader}
    <div class="md:hidden bg-white border-b border-gray-200 sticky top-16 z-40 transition-all duration-300">
      <div class="px-4 py-2">
        <h1 class="text-base font-medium text-gray-900 truncate">{property.title}</h1>
      </div>
    </div>
  {/if}

  <!-- Desktop Property Header Bar - Full details -->
  <div class="hidden md:block bg-white border-b border-gray-200 sticky top-16 z-40">
    <div class="max-w-7xl mx-auto px-6 py-3">
      <div class="flex items-center justify-between">
        <!-- Left side: Property info -->
        <div class="flex flex-col gap-1">
          <h1 class="text-lg font-medium text-gray-900">{property.title}, {property.location.split('•')[0].trim()}</h1>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-base font-medium text-gray-900">{property.price}</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-700">{property.bedrooms} Beds</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-700">{property.bathrooms} Baths</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-700">{property.sqft.toLocaleString()} SQ.FT.</span>
          </div>
        </div>
        
        <!-- Right side: Action buttons -->
        <div class="flex items-center gap-2">
          <a href="/property/{propertyId}/floorplan" class="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Floorplan
          </a>
          <a href="/property/{propertyId}/gallery" class="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
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
        <h1 class="text-lg font-medium text-gray-900">{property.title}, {property.location.split('•')[0].trim()}</h1>
        
        <!-- Price and property details on one line -->
        <div class="flex items-center justify-center gap-2 text-sm text-gray-700">
          <span class="font-medium text-gray-900">{property.price}</span>
          <span class="text-gray-400">•</span>
          <span>{property.bedrooms} Beds</span>
          <span class="text-gray-400">•</span>
          <span>{property.bathrooms} Baths</span>
          <span class="text-gray-400">•</span>
          <span>{property.sqft.toLocaleString()} SQ.FT.</span>
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
          <a href="/property/{propertyId}/floorplan" class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Floorplan
          </a>
          <a href="/property/{propertyId}/gallery" class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
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
    <div class="px-6 py-12 space-y-12 max-w-6xl mx-auto">

      <!-- Description -->
      <div class="grid md:grid-cols-2 gap-12">
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-light text-gray-900 mb-4">About this property</h2>
            <p class="text-gray-700 leading-relaxed text-lg">
              {property.description}
            </p>
          </div>

          <!-- Features -->
          <div class="space-y-4">
            <h3 class="text-xl font-light text-gray-900">Key features</h3>
            <ul class="space-y-3">
              {#each property.features as feature}
                <li class="text-gray-700 text-lg">
                  {feature}
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Transport -->
          <div>
            <h3 class="text-xl font-light text-gray-900 mb-4">Transport links</h3>
            <ul class="space-y-3">
              {#each property.locationDetails.transport as transport}
                <li class="text-gray-700 text-lg">{transport}</li>
              {/each}
            </ul>
          </div>

          <!-- Contact -->
          <div class="bg-gray-50 p-8 rounded-lg">
            <h3 class="text-xl font-light text-gray-900 mb-4">Interested in this property?</h3>
            <p class="text-gray-600 mb-6">Get in touch with our team for more information or to arrange a viewing.</p>
            <button class="w-full px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white transition-colors font-medium text-lg">
              Contact agent
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Fixed bottom bar with price and request viewing button -->
  <div class="bottom-bar bg-white border-t border-gray-200 shadow-lg z-50">
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
          class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-small text-sm rounded transition-colors"
        >
          Request viewing
        </button>
      </div>
    </div>
  </div>
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
            <h4 class="font-medium text-gray-900">{property.title}</h4>
            <p class="text-sm text-gray-600">{property.location}</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{property.price}</p>
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
