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
      // Not logged in - redirect to login
      goto('/login?redirect=/property/' + propertyId);
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
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }
  
  function handleTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
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
</script>

<svelte:head>
  <title>{property.title} | OffMarketPrime</title>
  <meta name="description" content="{property.title} - {property.location}. {property.bedrooms} bed {property.propertyType.toLowerCase()} for sale at {property.price}. {property.description}" />
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Mobile Sticky Header - Simple property name only -->
  <div class="md:hidden bg-white border-b border-gray-200 sticky top-16 z-40">
    <div class="px-4 py-3">
      <h1 class="text-base font-medium text-gray-900 truncate">{property.title}</h1>
    </div>
  </div>

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
          <button class="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Floorplan
          </button>
          <button class="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Gallery ({property.images.length})
          </button>
          <button class="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded text-sm transition-colors">
            Request information
          </button>
          <button class="p-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors">
            <Share2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Property Info - Non-sticky, appears below header -->
  <div class="md:hidden bg-white border-b border-gray-200">
    <div class="px-4 py-4">
      <div class="space-y-3">
        <!-- Property title and location -->
        <div>
          <h1 class="text-xl font-medium text-gray-900">{property.title}</h1>
          <p class="text-gray-600 text-sm mt-1">{property.location.split('•')[0].trim()}</p>
        </div>
        
        <!-- Price and property details -->
        <div class="flex items-center gap-2 text-sm">
          <span class="text-lg font-medium text-gray-900">{property.price}</span>
          <span class="text-gray-400">•</span>
          <span class="text-gray-700">{property.bedrooms} Beds</span>
          <span class="text-gray-400">•</span>
          <span class="text-gray-700">{property.bathrooms} Baths</span>
          <span class="text-gray-400">•</span>
          <span class="text-gray-700">{property.sqft.toLocaleString()} SQ.FT.</span>
        </div>
        
        <!-- Mobile action buttons -->
        <div class="flex flex-wrap gap-2">
          <button class="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Floorplan
          </button>
          <button class="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
            <Eye class="w-4 h-4" />
            Gallery ({property.images.length})
          </button>
          <button class="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded text-sm transition-colors">
            Request information
          </button>
          <button class="p-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors">
            <Share2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Gallery -->
  <section class="bg-gray-50 md:py-8">
    <!-- Mobile: Full width -->
    <div class="md:hidden">
      <div 
        class="relative aspect-[4/3] overflow-hidden bg-white"
        on:touchstart={handleTouchStart}
        on:touchend={handleTouchEnd}
      >
        <!-- Image carousel -->
        <div 
          class="flex h-full transition-transform duration-300 ease-out"
          style="transform: translateX(-{currentImageIndex * 100}%)"
        >
          {#each property.images as image, index}
            <img 
              src={image} 
              alt="{property.title} - Image {index + 1}"
              class="w-full h-full object-cover flex-shrink-0"
            />
          {/each}
        </div>
        
        <!-- Image counter -->
        <div class="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {currentImageIndex + 1} / {property.images.length}
        </div>
      </div>
    </div>

    <!-- Desktop: Contained with navigation -->
    <div class="hidden md:block">
      <div class="max-w-5xl mx-auto px-6">
        <div 
          class="relative aspect-[4/3] max-h-[700px] overflow-hidden rounded-lg shadow-lg bg-white mx-auto"
          on:touchstart={handleTouchStart}
          on:touchend={handleTouchEnd}
        >
          <!-- Image carousel -->
          <div 
            class="flex h-full transition-transform duration-300 ease-out"
            style="transform: translateX(-{currentImageIndex * 100}%)"
          >
            {#each property.images as image, index}
              <img 
                src={image} 
                alt="{property.title} - Image {index + 1}"
                class="w-full h-full object-cover flex-shrink-0"
              />
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
  <main class="bg-white">
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
</div>
