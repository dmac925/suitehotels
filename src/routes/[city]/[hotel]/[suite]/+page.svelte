<script lang="ts">
  import { MapPin, Star, Users, Bed, Check, X, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let hotel = data.hotel;
  let suite = data.suite;
  let serverError = data.error;
  
  // Image carousel state
  let currentImageIndex = 0;
  
  // Get all suite images (prioritize room-specific images, then use hotel images as fallback)
  $: suiteImages = suite ? 
    (suite.roomImages && suite.roomImages.length > 0 ? 
      suite.roomImages : 
      [suite.image, ...(hotel?.images || []).slice(0, 4)].filter(Boolean)
    ) : [];
  
  function nextImage() {
    if (suiteImages.length > 0) {
      currentImageIndex = (currentImageIndex + 1) % suiteImages.length;
    }
  }
  
  function prevImage() {
    if (suiteImages.length > 0) {
      currentImageIndex = (currentImageIndex - 1 + suiteImages.length) % suiteImages.length;
    }
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
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  }
  
</script>

<svelte:head>
  <title>{suite?.roomType} at {hotel?.name}</title>
  <meta name="description" content="{suite?.roomType} at {hotel?.name}. View details, amenities, and pricing for this luxury accommodation." />
</svelte:head>

{#if serverError}
  <section class="py-16 bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <p class="text-red-600 mb-4">{serverError}</p>
        <a href="/{hotel?.citySlug}/{hotel?.slug}" class="text-blue-600 hover:underline">Back to hotel</a>
      </div>
    </div>
  </section>
{:else if hotel && suite}
  <!-- Mobile Bottom Booking Bar -->
  <div class="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-amber-400 px-4 py-3 lg:hidden z-50">
    <div class="flex items-center justify-between">
      <div>
        {#if suite.guidelinePrice}
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-semibold text-white">${suite.guidelinePrice.toLocaleString()}</span>
            <span class="text-sm text-amber-200">night</span>
          </div>
          <button class="text-xs text-amber-300 underline">View details</button>
        {:else if suite.options && suite.options.length > 0}
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-semibold text-white">${Math.round(suite.options[0].price)}</span>
            <span class="text-sm text-amber-200">night</span>
          </div>
          <button class="text-xs text-amber-300 underline">View details</button>
        {:else}
          <span class="text-gray-300">Contact for pricing</span>
        {/if}
      </div>
      <button class="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-6 py-2.5 rounded-lg font-semibold shadow-md">
        Book Now
      </button>
    </div>
  </div>
  <!-- Breadcrumb -->
  <section class="bg-gradient-to-r from-slate-50 to-amber-50 py-4">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav class="text-sm">
        <a href="/{hotel.citySlug}" class="text-slate-600 hover:text-amber-600">{hotel.address?.city}</a>
        <span class="mx-2 text-slate-400">/</span>
        <a href="/{hotel.citySlug}/{hotel.slug}" class="text-slate-600 hover:text-amber-600">{hotel.name}</a>
        <span class="mx-2 text-slate-400">/</span>
        <span class="text-slate-900 font-medium">{suite.roomType}</span>
      </nav>
    </div>
  </section>
  
  <!-- Full Width Image Carousel -->
  <section class="relative w-full">
    <div 
      class="relative w-full h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-100"
      on:touchstart={handleTouchStart}
      on:touchend={handleTouchEnd}
    >
      <!-- Image track -->
      <div 
        class="flex h-full transition-transform duration-300 ease-out"
        style="transform: translateX(-{currentImageIndex * 100}%)"
      >
        {#each suiteImages as image, index}
          <div class="min-w-full h-full">
            <img 
              src={image} 
              alt="{suite.roomType} - Image {index + 1}"
              class="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        {/each}
      </div>
            
      <!-- Navigation arrows - Desktop only -->
      {#if suiteImages.length > 1}
        <button
          on:click={prevImage}
          class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 h-20 px-4 md:px-6 bg-black/20 hover:bg-black/40 items-center justify-center transition-all"
          aria-label="Previous image"
        >
          <ChevronLeft class="h-8 w-8 text-white drop-shadow-lg" />
        </button>
        <button
          on:click={nextImage}
          class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 h-20 px-4 md:px-6 bg-black/20 hover:bg-black/40 items-center justify-center transition-all"
          aria-label="Next image"
        >
          <ChevronRight class="h-8 w-8 text-white drop-shadow-lg" />
        </button>
      {/if}
            
      <!-- Image counter -->
      {#if suiteImages.length > 1}
        <div class="absolute top-4 right-4 md:top-6 md:right-8 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
          {currentImageIndex + 1} / {suiteImages.length}
        </div>
      {/if}
    </div>
  </section>
  
  <!-- Suite Info Section -->
  <section class="bg-gradient-to-b from-amber-50 to-white py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Main Suite Info (2 columns wide) -->
        <div class="lg:col-span-2">
          <h1 class="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{suite.roomType}</h1>
          
          <!-- Hotel Info -->
          <div class="mb-6">
            <p class="text-lg text-slate-700 mb-2">{hotel.name}</p>
            <div class="flex items-center mb-2">
              {#each Array(hotel.stars || 0) as _}
                <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
              {/each}
              <span class="ml-2 text-sm text-slate-600">{hotel.stars} Star Hotel</span>
            </div>
            <div class="flex items-center text-sm text-slate-600">
              <MapPin class="h-4 w-4 mr-1 text-amber-600" />
              <span>{hotel.address?.neighbourhood}, {hotel.address?.city}</span>
            </div>
          </div>
          
          <!-- Room Details -->
          <div class="border-t border-amber-200 pt-6">
            <h2 class="text-xl font-semibold text-slate-900 mb-4">Room Details</h2>
            
            <!-- Capacity -->
            <div class="flex items-center mb-4">
              <Users class="h-5 w-5 mr-2 text-gray-500" />
              <span>Up to {suite.persons} guests</span>
            </div>
            
            <!-- Availability -->
            {#if suite.available}
              <div class="flex items-center mb-4 text-green-600">
                <Check class="h-5 w-5 mr-2" />
                <span>Available</span>
                {#if suite.roomsLeft}
                  <span class="ml-2 text-red-600">- Only {suite.roomsLeft} left!</span>
                {/if}
              </div>
            {:else}
              <div class="flex items-center mb-4 text-red-600">
                <X class="h-5 w-5 mr-2" />
                <span>Not Available</span>
              </div>
            {/if}
            
            <!-- Bed Types -->
            {#if suite.bedTypes && suite.bedTypes.length > 0}
              <div class="mb-6">
                <h3 class="font-semibold mb-2 flex items-center">
                  <Bed class="h-5 w-5 mr-2 text-gray-500" />
                  Bed Configuration
                </h3>
                {#each suite.bedTypes as bedType}
                  {#if bedType.beds}
                    <ul class="ml-7 text-gray-600">
                      {#each bedType.beds as bed}
                        <li class="mb-1">• {bed}</li>
                      {/each}
                    </ul>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Sticky Booking Widget (1 column) -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <div class="bg-gradient-to-b from-slate-50 to-white rounded-lg border border-amber-300 shadow-xl p-6">
              <!-- Classic Price Display -->
              {#if suite.guidelinePrice}
                <div class="pb-4 border-b border-amber-200 mb-5">
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-light text-slate-900">${suite.guidelinePrice.toLocaleString()}</span>
                    <span class="text-slate-600 text-sm">per night</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1">Includes taxes & fees</p>
                </div>
              {:else if suite.options && suite.options.length > 0}
                <div class="pb-4 border-b border-amber-200 mb-5">
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-light text-slate-900">${Math.round(suite.options[0].price)}</span>
                    <span class="text-slate-600 text-sm">per night</span>
                  </div>
                  {#if suite.options[0].excludedTaxesPrice}
                    <p class="text-xs text-slate-500 mt-1">Excluding taxes & fees</p>
                  {/if}
                </div>
              {/if}
              
              {#if suite.guidelinePrice || (suite.options && suite.options.length > 0)}
                <!-- Date Selection -->
                <div class="mb-4">
                  <div class="border border-slate-400 rounded">
                    <div class="flex">
                      <div class="flex-1 p-3 border-r border-slate-400">
                        <label class="text-xs font-semibold text-slate-700 block mb-1">CHECK-IN</label>
                        <input type="text" placeholder="Add date" class="w-full text-sm outline-none placeholder-slate-400" />
                      </div>
                      <div class="flex-1 p-3">
                        <label class="text-xs font-semibold text-slate-700 block mb-1">CHECKOUT</label>
                        <input type="text" placeholder="Add date" class="w-full text-sm outline-none placeholder-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Guest Selection -->
                <div class="mb-5">
                  <div class="border border-slate-400 rounded p-3 cursor-pointer hover:border-slate-600 transition-colors">
                    <label class="text-xs font-semibold text-slate-700 block mb-1">GUESTS</label>
                    <div class="text-sm text-slate-900">1 guest</div>
                  </div>
                </div>
                
                <!-- Reserve Button -->
                <button class="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-3 rounded hover:from-amber-400 hover:to-amber-500 transition-all font-semibold shadow-md">
                  Check Availability
                </button>
                
                <!-- Booking Info -->
                <p class="text-center text-xs text-slate-500 mt-3">You won't be charged yet</p>
                
                <!-- Additional Info -->
                {#if suite.options && suite.options.length > 0 && suite.options[0].freeCancellation}
                  <div class="mt-5 pt-5 border-t border-gray-200">
                    <div class="flex items-start gap-2 text-sm">
                      <Check class="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span class="font-medium">Free cancellation</span>
                        <span class="text-gray-600 text-xs block">Within 48 hours of booking</span>
                      </div>
                    </div>
                  </div>
                {/if}
              {:else}
                <div class="text-center">
                  <p class="text-gray-500 mb-4">Contact for pricing</p>
                  <button class="w-full bg-gray-100 text-gray-700 py-3 rounded hover:bg-gray-200 transition-colors font-medium">
                    Contact Hotel
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  
  <!-- Hotel Information -->
  <section class="bg-gradient-to-b from-amber-50 to-slate-50 py-12 border-t border-amber-200 pb-24 lg:pb-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-bold text-slate-900 mb-6">About {hotel.name}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p class="text-slate-700 mb-4">{@html (() => {
            let desc = hotel.description || '';
            // Remove citation artifacts like citeturn1search1turn0search0...
            desc = desc.replace(/citeturn\d+search\d+[a-z0-9]*/gi, '').trim();
            // Truncate if needed
            if (desc.length > 500) {
              return `${desc.slice(0, 500)}...`;
            }
            return desc;
          })()}</p>
          <a href="/{hotel.citySlug}/{hotel.slug}" class="text-amber-600 hover:text-amber-700 font-medium">
            View all room types at this hotel →
          </a>
        </div>
        <div>
          <div class="bg-white border border-amber-200 p-6 rounded-lg shadow-md">
            <h3 class="font-semibold text-slate-900 mb-4">Hotel Information</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm text-slate-500">Check-in</dt>
                <dd class="font-medium text-slate-900">{hotel.checkIn}</dd>
              </div>
              <div>
                <dt class="text-sm text-slate-500">Check-out</dt>
                <dd class="font-medium text-slate-900">{hotel.checkOut}</dd>
              </div>
              {#if hotel.breakfast}
                <div>
                  <dt class="text-sm text-slate-500">Breakfast</dt>
                  <dd class="font-medium text-slate-900">{hotel.breakfast}</dd>
                </div>
              {/if}
              <div>
                <dt class="text-sm text-slate-500">Address</dt>
                <dd class="font-medium text-slate-900">{hotel.address?.full}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </section>
{:else}
  <section class="py-16 bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <p class="text-gray-600">Suite not found</p>
        <a href="/london" class="text-blue-600 hover:underline">Back to hotels</a>
      </div>
    </div>
  </section>
{/if}