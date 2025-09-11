<script lang="ts">
  import { MapPin, Star, Users, Bed, Check, X, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import type { PageData } from './$types';
  import DatePicker from '$lib/components/DatePicker.svelte';
  import RequestPricesModal from '$lib/components/RequestPricesModal.svelte';
  
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
  
  // Update translate position when index changes
  $: if (!isDragging) {
    currentTranslateX = -currentImageIndex * 100;
  }
  
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
  
  // Touch handling for Instagram-style swipe
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let currentTranslateX = 0;
  let isDragging = false;
  let containerEl: HTMLElement;
  
  // Fullscreen modal state
  let isFullscreen = false;
  let fullscreenIndex = 0;
  
  // Date picker and request modal state
  let checkIn: Date | null = null;
  let checkOut: Date | null = null;
  let showRequestModal = false;
  let isSubmittingRequest = false;
  let requestSuccess = false;
  let requestError = '';
  
  function openFullscreen(index: number = currentImageIndex) {
    isFullscreen = true;
    fullscreenIndex = index;
    document.body.style.overflow = 'hidden';
  }
  
  function closeFullscreen() {
    isFullscreen = false;
    document.body.style.overflow = '';
  }
  
  function nextFullscreenImage() {
    fullscreenIndex = (fullscreenIndex + 1) % suiteImages.length;
  }
  
  function prevFullscreenImage() {
    fullscreenIndex = (fullscreenIndex - 1 + suiteImages.length) % suiteImages.length;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (!isFullscreen) return;
    
    if (e.key === 'Escape') {
      closeFullscreen();
    } else if (e.key === 'ArrowRight') {
      nextFullscreenImage();
    } else if (e.key === 'ArrowLeft') {
      prevFullscreenImage();
    }
  }
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isDragging = false;
  }
  
  function handleTouchMove(e: TouchEvent) {
    if (!touchStartX || !touchStartY) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;
    
    // Determine if this is a horizontal swipe
    if (!isDragging && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
      isDragging = true;
    }
    
    if (isDragging) {
      e.preventDefault();
      
      // Calculate position with edge resistance
      const containerWidth = containerEl?.offsetWidth || window.innerWidth;
      let translateX = diffX / containerWidth * 100;
      
      // Add resistance at edges (Instagram-style rubber band effect)
      const basePosition = -currentImageIndex * 100;
      if ((currentImageIndex === 0 && diffX > 0) || 
          (currentImageIndex === suiteImages.length - 1 && diffX < 0)) {
        translateX = translateX * 0.35; // Rubber band resistance
      }
      
      currentTranslateX = basePosition + translateX;
    }
  }
  
  function handleTouchEnd(e: TouchEvent) {
    if (!isDragging) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndTime = Date.now();
    
    const distance = touchEndX - touchStartX;
    const duration = touchEndTime - touchStartTime;
    const velocity = Math.abs(distance) / duration;
    
    const containerWidth = containerEl?.offsetWidth || window.innerWidth;
    const threshold = containerWidth * 0.4; // 40% threshold like Instagram
    const velocityThreshold = 0.25; // Velocity sensitivity
    
    // Determine if we should change images
    const shouldSwipe = Math.abs(distance) > threshold || velocity > velocityThreshold;
    
    if (shouldSwipe && Math.abs(distance) > 30) { // Min 30px to avoid accidental swipes
      if (distance < 0 && currentImageIndex < suiteImages.length - 1) {
        currentImageIndex++;
      } else if (distance > 0 && currentImageIndex > 0) {
        currentImageIndex--;
      }
    }
    
    // Smooth snap to final position
    currentTranslateX = -currentImageIndex * 100;
    isDragging = false;
    
    // Reset touch values
    touchStartX = 0;
    touchStartY = 0;
    touchStartTime = 0;
  }
  
  function handleDateChange(event: CustomEvent<{ checkIn: Date | null; checkOut: Date | null }>) {
    checkIn = event.detail.checkIn;
    checkOut = event.detail.checkOut;
  }
  
  function openRequestModal() {
    if (!checkIn || !checkOut) {
      requestError = 'Please select your check-in and check-out dates first.';
      return;
    }
    showRequestModal = true;
    requestError = '';
  }
  
  function closeRequestModal() {
    showRequestModal = false;
    requestSuccess = false;
    requestError = '';
  }
  
  async function handleRequestSubmit(event: CustomEvent) {
    isSubmittingRequest = true;
    requestError = '';
    
    try {
      // Here you would typically send the request to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      requestSuccess = true;
      console.log('Price request submitted:', event.detail);
      
      // Auto-close after showing success message
      setTimeout(() => {
        closeRequestModal();
      }, 3000);
    } catch (error) {
      requestError = 'Failed to submit request. Please try again.';
    } finally {
      isSubmittingRequest = false;
    }
  }
  
</script>

<svelte:window on:keydown={handleKeydown} />

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
  <div class="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-amber-400 px-4 py-3 lg:hidden z-40">
    <div class="flex items-center gap-3">
      <div class="flex-1">
        <DatePicker bind:checkIn bind:checkOut on:change={handleDateChange} />
      </div>
      <button 
        on:click={openRequestModal}
        class="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 px-4 py-2.5 rounded-lg font-semibold shadow-md whitespace-nowrap"
      >
        Request Prices
      </button>
    </div>
    {#if requestError && !showRequestModal}
      <div class="mt-2 text-xs text-red-300">{requestError}</div>
    {/if}
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
  
  <!-- Image Carousel - Full width mobile, side-by-side desktop -->
  <!-- Mobile: Full width carousel -->
  <section class="md:hidden relative w-full">
    <div 
      class="relative w-full h-[350px] overflow-hidden bg-gray-100"
      bind:this={containerEl}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      <!-- Image track -->
      <div 
        class="flex h-full transition-transform {isDragging ? 'duration-0' : 'duration-300 ease-out'}"
        style="transform: translateX({currentTranslateX}%); will-change: transform;"
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
      
      <!-- Image counter - Mobile -->
      {#if suiteImages.length > 1}
        <div class="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
          {currentImageIndex + 1} / {suiteImages.length}
        </div>
      {/if}
    </div>
  </section>
  
  <!-- Desktop: Side-by-side layout -->
  <section class="hidden md:block bg-gradient-to-b from-white to-amber-50 py-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 gap-8">
        <!-- Left: Image Gallery -->
        <div class="relative">
          <div class="sticky top-24">
            <!-- Main image -->
            <div class="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg bg-gray-100">
              <div 
                class="flex h-full transition-transform duration-300 ease-out"
                style="transform: translateX(-{currentImageIndex * 100}%);"
              >
                {#each suiteImages as image, index}
                  <button 
                    class="min-w-full h-full cursor-zoom-in"
                    on:click={() => openFullscreen(index)}
                    aria-label="View {suite.roomType} - Image {index + 1} in fullscreen"
                  >
                    <img 
                      src={image} 
                      alt="{suite.roomType} - Image {index + 1}"
                      class="w-full h-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </button>
                {/each}
              </div>
              
              <!-- Navigation dots -->
              {#if suiteImages.length > 1}
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {#each suiteImages as _, index}
                    <button
                      on:click={() => currentImageIndex = index}
                      class="w-2 h-2 rounded-full transition-all {index === currentImageIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'}"
                      aria-label="Go to image {index + 1}"
                    />
                  {/each}
                </div>
                
                <!-- Navigation arrows -->
                <button
                  on:click={prevImage}
                  class="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Previous image"
                >
                  <ChevronLeft class="h-5 w-5 text-slate-800" />
                </button>
                <button
                  on:click={nextImage}
                  class="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Next image"
                >
                  <ChevronRight class="h-5 w-5 text-slate-800" />
                </button>
              {/if}
            </div>
            
            <!-- Grid view button or additional images preview -->
            {#if suiteImages.length > 4}
              <button 
                on:click={() => openFullscreen(0)}
                class="mt-3 w-full py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View all {suiteImages.length} photos
              </button>
            {:else if suiteImages.length > 1}
              <div class="mt-3 grid grid-cols-4 gap-2">
                {#each suiteImages.slice(0, 4) as image, index}
                  <button
                    on:click={() => currentImageIndex = index}
                    class="aspect-square rounded overflow-hidden {index === currentImageIndex ? 'ring-2 ring-amber-500' : 'opacity-80 hover:opacity-100'}"
                  >
                    <img 
                      src={image} 
                      alt="Thumbnail {index + 1}"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Right: Suite Info -->
        <div>
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
          
          <!-- Price Display -->
          {#if suite.guidelinePrice || (suite.options && suite.options.length > 0)}
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              {#if suite.guidelinePrice}
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-light text-slate-900">${suite.guidelinePrice.toLocaleString()}</span>
                  <span class="text-slate-600">per night</span>
                </div>
                <p class="text-xs text-slate-500 mt-1">Includes taxes & fees</p>
              {:else if suite.options && suite.options.length > 0}
                <div class="flex items-baseline gap-2">
                  <span class="text-3xl font-light text-slate-900">${Math.round(suite.options[0].price)}</span>
                  <span class="text-slate-600">per night</span>
                </div>
                {#if suite.options[0].excludedTaxesPrice}
                  <p class="text-xs text-slate-500 mt-1">Excluding taxes & fees</p>
                {/if}
              {/if}
            </div>
          {/if}
          
          <!-- Room Details -->
          <div class="border-t border-amber-200 pt-6">
            <h2 class="text-xl font-semibold text-slate-900 mb-4">Room Details</h2>
            
            <!-- Capacity -->
            <div class="flex items-center mb-4">
              <Users class="h-5 w-5 mr-2 text-gray-500" />
              <span>Up to {suite.persons} guests</span>
            </div>
            
            
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
            
            <!-- Date Picker and Request Prices -->
            <div class="mt-6 space-y-4">
              <DatePicker bind:checkIn bind:checkOut on:change={handleDateChange} />
              <button 
                on:click={openRequestModal}
                class="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 py-3 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all font-semibold shadow-md"
              >
                Request Prices
              </button>
              {#if requestError && !showRequestModal}
                <div class="text-sm text-red-600 text-center">{requestError}</div>
              {/if}
            </div>
            
            <!-- Free Cancellation -->
            {#if suite.options && suite.options.length > 0 && suite.options[0].freeCancellation}
              <div class="mt-4">
                <div class="flex items-start gap-2 text-sm">
                  <Check class="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span class="font-medium">Free cancellation</span>
                    <span class="text-gray-600 text-xs block">Within 48 hours of booking</span>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Mobile Suite Info Section -->
  <section class="md:hidden bg-gradient-to-b from-amber-50 to-white py-8 pb-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-slate-900 mb-4">{suite.roomType}</h1>
      
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
  
  <!-- Fullscreen Image Modal -->
  {#if isFullscreen}
    <div class="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <!-- Close button -->
      <button 
        on:click={closeFullscreen}
        class="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        aria-label="Close fullscreen"
      >
        <X class="h-6 w-6 text-white" />
      </button>
      
      <!-- Image counter -->
      <div class="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium">
        {fullscreenIndex + 1} / {suiteImages.length}
      </div>
      
      <!-- Previous button -->
      {#if suiteImages.length > 1}
        <button 
          on:click={prevFullscreenImage}
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft class="h-8 w-8 text-white" />
        </button>
      {/if}
      
      <!-- Image -->
      <div class="relative w-full h-full flex items-center justify-center p-4">
        <img 
          src={suiteImages[fullscreenIndex]} 
          alt="{suite.roomType} - Image {fullscreenIndex + 1}"
          class="max-w-full max-h-full object-contain"
        />
      </div>
      
      <!-- Next button -->
      {#if suiteImages.length > 1}
        <button 
          on:click={nextFullscreenImage}
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight class="h-8 w-8 text-white" />
        </button>
      {/if}
      
      <!-- Thumbnail strip at bottom -->
      {#if suiteImages.length > 1}
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
          {#each suiteImages as image, index}
            <button
              on:click={() => fullscreenIndex = index}
              class="flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all {index === fullscreenIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}"
            >
              <img 
                src={image} 
                alt="Thumbnail {index + 1}"
                class="w-full h-full object-cover"
              />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Request Prices Modal -->
  <RequestPricesModal
    bind:show={showRequestModal}
    bind:suite
    bind:hotel
    bind:checkIn
    bind:checkOut
    bind:isSubmitting={isSubmittingRequest}
    bind:submitSuccess={requestSuccess}
    bind:submitError={requestError}
    on:close={closeRequestModal}
    on:submit={handleRequestSubmit}
  />
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