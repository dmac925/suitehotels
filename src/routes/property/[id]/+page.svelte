<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ChevronLeft, Heart, Share2, Bath, Bed, Maximize, MapPin, Calendar, Eye } from 'lucide-svelte';
  
  // Mock authentication check - replace with real auth
  let isAuthenticated = true; // Set to true for now, replace with actual auth check
  
  // Get property ID from URL
  $: propertyId = $page.params.id;
  
  // Current image index for gallery
  let currentImageIndex = 0;
  
  // Mock property data - replace with real data fetch
  const property = {
    id: 1,
    title: 'Lawford Road',
    location: 'De Beauvoir N1 • Freehold',
    price: '£1,700,000',
    priceGuide: 'Price guide',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1256,
    propertyType: 'House',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
    ],
    description: 'Tastefully decorated family home situated on a no-through road in De Beauvoir. The property has been finished to a high standard throughout offering a series of modern interventions that elevate the original Victorian building.',
    features: [
      'Victorian terrace house',
      'Recently renovated throughout',
      'Open-plan kitchen/living area',
      'Private garden',
      'Two double bedrooms',
      'Two modern bathrooms',
      'Period features',
      'Excellent transport links'
    ],
    floorplanUrl: 'https://placehold.co/800x600/f8f8f8/333333?text=Floorplan',
    location: {
      address: 'Lawford Road, De Beauvoir, London N1',
      transport: [
        'Dalston Junction - 5 mins walk',
        'Haggerston Station - 8 mins walk',
        'Angel Station - 15 mins walk'
      ]
    }
  };
  
  onMount(() => {
    // Check authentication
    if (!isAuthenticated) {
      goto('/login?redirect=/property/' + propertyId);
    }
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

<div class="min-h-screen bg-[#faf9f6]">
  <!-- Image Gallery -->
  <section class="relative bg-gray-100">
    <div 
      class="relative aspect-[4/3] overflow-hidden"
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
      
      <!-- Back button overlay -->
      <button 
        on:click={handleBack}
        class="absolute top-4 left-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
        aria-label="Go back"
      >
        <ChevronLeft class="w-6 h-6" />
      </button>
      
      <!-- Image counter -->
      <div class="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
        {currentImageIndex + 1} / {property.images.length}
      </div>
      
      <!-- Navigation arrows for desktop -->
      <button 
        on:click={prevImage}
        class="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-colors z-10"
        aria-label="Previous image"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>
      <button 
        on:click={nextImage}
        class="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-colors z-10"
        aria-label="Next image"
      >
        <ChevronLeft class="w-5 h-5 rotate-180" />
      </button>
    </div>
  </section>

  <!-- Property Details -->
  <main class="bg-white">
    <div class="px-4 py-6 space-y-6 max-w-4xl mx-auto">
      <!-- Title and Location -->
      <div>
        <div class="flex items-start justify-between mb-2">
          <h1 class="text-2xl font-medium text-gray-900">{property.title}</h1>
          <div class="flex items-center gap-2">
            <button 
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Share property"
            >
              <Share2 class="w-5 h-5 text-gray-600" />
            </button>
            <button 
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Save to favorites"
            >
              <Heart class="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <p class="text-gray-600 flex items-center gap-1">
          <MapPin class="w-4 h-4" />
          {property.location}
        </p>
      </div>

      <!-- Price -->
      <div class="border-y border-gray-200 py-4">
        <p class="text-sm text-gray-600">{property.priceGuide}</p>
        <p class="text-2xl font-medium text-gray-900">{property.price}</p>
      </div>

      <!-- Property Stats -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 text-gray-700">
          <div class="flex items-center gap-1.5">
            <Bed class="w-5 h-5" />
            <span>{property.bedrooms}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Bath class="w-5 h-5" />
            <span>{property.bathrooms}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Maximize class="w-5 h-5" />
            <span>{property.sqft.toLocaleString()} sq ft</span>
          </div>
        </div>
        <span class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
          {property.propertyType}
        </span>
      </div>

      <!-- Description -->
      <div class="space-y-4">
        <h2 class="text-lg font-medium text-gray-900">About this property</h2>
        <p class="text-gray-700 leading-relaxed">
          {property.description}
        </p>
      </div>

      <!-- Features -->
      <div class="space-y-4">
        <h2 class="text-lg font-medium text-gray-900">Key features</h2>
        <ul class="space-y-2">
          {#each property.features as feature}
            <li class="flex items-start">
              <span class="text-[#003d7a] mr-2">•</span>
              <span class="text-gray-700">{feature}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-4">
        <button class="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
          Photos
        </button>
        <button class="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
          Floorplan
        </button>
      </div>

      <!-- Transport -->
      <div class="space-y-4">
        <h2 class="text-lg font-medium text-gray-900">Transport links</h2>
        <ul class="space-y-2">
          {#each property.location.transport as transport}
            <li class="text-gray-700">{transport}</li>
          {/each}
        </ul>
      </div>

      <!-- Request Viewing -->
      <div class="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 -mx-4">
        <button class="w-full px-6 py-4 bg-[#e85d75] hover:bg-[#d64866] text-white rounded-lg transition-colors font-medium text-lg">
          Request viewing
        </button>
      </div>
    </div>
  </main>
</div>
