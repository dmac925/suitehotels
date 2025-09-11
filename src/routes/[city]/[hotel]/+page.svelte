<script lang="ts">
  import { MapPin, Star, Users, Bed, Check, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let hotel = data.hotel;
  let allSuites = data.suites || [];
  let serverError = data.error;
  
  // Filter and sort state
  let filteredSuites = [...allSuites];
  let sortBy = 'price-low';
  let openDropdown: string | null = null;
  let filters = {
    persons: '',
    priceMin: '',
    priceMax: ''
  };

  // Price slider settings - same as TwoTierFilters
  const priceRange = { min: 0, max: 10000, step: 100 };
  let priceMinValue = parseInt(filters.priceMin) || priceRange.min;
  let priceMaxValue = parseInt(filters.priceMax) || priceRange.max;
  
  // Watch for external changes to filters
  $: {
    priceMinValue = parseInt(filters.priceMin) || priceRange.min;
    priceMaxValue = parseInt(filters.priceMax) || priceRange.max;
  }
  
  
  // Image carousel state for each suite
  let suiteImageIndexes: Record<string, number> = {};
  
  // Initialize image indexes
  allSuites.forEach(suite => {
    suiteImageIndexes[suite.id] = 0;
  });
  
  function nextImage(e: MouseEvent, suiteId: string, imageCount: number) {
    e.stopPropagation();
    suiteImageIndexes[suiteId] = (suiteImageIndexes[suiteId] + 1) % imageCount;
  }
  
  function prevImage(e: MouseEvent, suiteId: string, imageCount: number) {
    e.stopPropagation();
    suiteImageIndexes[suiteId] = (suiteImageIndexes[suiteId] - 1 + imageCount) % imageCount;
  }
  
  function handleSuiteClick(suite: any) {
    const citySlug = hotel.citySlug;
    const hotelSlug = hotel.slug;
    window.location.href = `/${citySlug}/${hotelSlug}/${suite.slug}`;
  }
  
  // Filter and sort functions
  function applyFiltersAndSort() {
    let filtered = [...allSuites];
    
    // Filter by persons
    if (filters.persons) {
      const minPersons = parseInt(filters.persons);
      filtered = filtered.filter(suite => 
        (suite.persons || 0) >= minPersons
      );
    }
    
    // Filter by price
    if (filters.priceMin || filters.priceMax) {
      const minPrice = filters.priceMin ? parseInt(filters.priceMin) : 0;
      // If maxPrice is at the slider maximum, treat it as "no limit"
      const maxPrice = filters.priceMax && parseInt(filters.priceMax) < priceRange.max 
        ? parseInt(filters.priceMax) 
        : Infinity;
      filtered = filtered.filter(suite => {
        // Use guidelinePrice if available, otherwise fall back to options[0].price
        const price = suite.guidelinePrice || suite.options?.[0]?.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }
    
    
    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => {
        const priceA = a.guidelinePrice || a.options?.[0]?.price || 0;
        const priceB = b.guidelinePrice || b.options?.[0]?.price || 0;
        return priceA - priceB;
      });
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => {
        const priceA = a.guidelinePrice || a.options?.[0]?.price || 0;
        const priceB = b.guidelinePrice || b.options?.[0]?.price || 0;
        return priceB - priceA;
      });
    } else if (sortBy === 'size') {
      filtered.sort((a, b) => (b.sqft || 0) - (a.sqft || 0));
    } else if (sortBy === 'guests') {
      filtered.sort((a, b) => (b.persons || 0) - (a.persons || 0));
    }
    
    filteredSuites = filtered;
  }
  
  // Apply filters whenever they change
  $: {
    filters;
    sortBy;
    applyFiltersAndSort();
  }
  
  function toggleDropdown(dropdown: string) {
    openDropdown = openDropdown === dropdown ? null : dropdown;
  }
  
  function closeDropdowns(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      openDropdown = null;
    }
  }
  
  
  function handlePriceSliderChange() {
    // Ensure min doesn't exceed max
    if (priceMinValue > priceMaxValue) {
      priceMaxValue = priceMinValue;
    }
    // Ensure max doesn't go below min
    if (priceMaxValue < priceMinValue) {
      priceMinValue = priceMaxValue;
    }
    
    filters.priceMin = priceMinValue === priceRange.min ? '' : priceMinValue.toString();
    filters.priceMax = priceMaxValue === priceRange.max ? '' : priceMaxValue.toString();
    applyFiltersAndSort();
  }

  function formatPrice(value: number): string {
    if (value === priceRange.max) {
      return `$${value.toLocaleString()}+`;
    }
    return `$${value.toLocaleString()}`;
  }

  function clearFilters() {
    filters = {
      persons: '',
      priceMin: '',
      priceMax: ''
    };
  }
  
  $: activeFilterCount = 
    (filters.persons ? 1 : 0) +
    (filters.priceMin || filters.priceMax ? 1 : 0);
</script>

<svelte:head>
  <title>{hotel?.name || 'Hotel'} - Luxury Suites</title>
  <meta name="description" content="Browse luxury suites and rooms at {hotel?.name}. {hotel?.description?.slice(0, 150)}" />
</svelte:head>

<svelte:window on:click={closeDropdowns} />

{#if serverError}
  <section class="py-16 bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <p class="text-red-600 mb-4">{serverError}</p>
        <a href="/london" class="text-blue-600 hover:underline">Back to hotels</a>
      </div>
    </div>
  </section>
{:else if hotel}
  <!-- Full Width Hero Image -->
  <section class="relative w-full">
    <div class="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-100">
      <img 
        src={hotel.image} 
        alt={hotel.name}
        class="w-full h-full object-cover"
      />
      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      
      <!-- Hotel Info Overlay -->
      <div class="absolute bottom-0 left-0 right-0 text-white p-6 md:p-8 lg:p-12">
        <div class="mx-auto max-w-7xl">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{hotel.name}</h1>
          
          <div class="flex flex-wrap items-center gap-4 mb-4">
            <!-- Stars -->
            <div class="flex items-center">
              {#each Array(hotel.stars || 0) as _}
                <Star class="h-5 w-5 fill-amber-400 text-amber-400" />
              {/each}
              <span class="ml-2">{hotel.stars} Star Hotel</span>
            </div>
            
            <!-- Rating -->
            <div class="flex items-center">
              <span class="bg-amber-500 text-slate-900 px-2 py-1 rounded font-semibold">{hotel.rating}</span>
            </div>
            
            <!-- Location -->
            <div class="flex items-center">
              <MapPin class="h-4 w-4 mr-1" />
              <span>{hotel.address?.neighbourhood}, {hotel.address?.city}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Hotel Details Section -->
  <section class="bg-gradient-to-b from-slate-50 to-white py-8">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Description (2 columns) -->
        <div class="lg:col-span-2">
          <h2 class="text-2xl font-semibold text-slate-900 mb-4">About {hotel.name}</h2>
          <p class="text-slate-700 leading-relaxed mb-6">{@html (() => {
            let desc = hotel.description || '';
            // Remove citation artifacts like citeturn1search1turn0search0...
            desc = desc.replace(/citeturn\d+search\d+[a-z0-9]*/gi, '').trim();
            return desc;
          })()}</p>
          
          <!-- Key Features -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-xs text-slate-500">Check-in</p>
                <p class="font-medium text-slate-900">{hotel.checkIn}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-xs text-slate-500">Check-out</p>
                <p class="font-medium text-slate-900">{hotel.checkOut}</p>
              </div>
            </div>
            {#if hotel.breakfast}
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18v18H3z" />
                </svg>
                <div>
                  <p class="text-xs text-slate-500">Breakfast</p>
                  <p class="font-medium text-slate-900">{hotel.breakfast}</p>
                </div>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Quick Info Card (1 column) -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border border-amber-200 shadow-md p-6">
            <h3 class="font-semibold text-slate-900 mb-4">Hotel Information</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-slate-500">Full Address</p>
                <p class="text-sm font-medium text-slate-900">{hotel.address?.full}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Neighborhood</p>
                <p class="text-sm font-medium text-slate-900">{hotel.address?.neighbourhood}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Guest Rating</p>
                <p class="text-sm font-medium text-slate-900">{hotel.rating}/10</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Hotel Amenities Section -->
  {#if hotel.wellnessAmenities?.length > 0 || hotel.diningAmenities?.length > 0 || hotel.servicesAmenities?.length > 0 || hotel.uniquePoints?.length > 0}
    <section class="bg-white py-8 border-t border-gray-200">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-semibold text-slate-900 mb-6">Hotel Amenities & Features</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Wellness Amenities with Details -->
          {#if hotel.wellnessAmenities && hotel.wellnessAmenities.length > 0}
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">💆</span>
                <h3 class="text-lg font-semibold text-slate-900">Wellness</h3>
              </div>
              <div class="space-y-3">
                {#each hotel.wellnessAmenities as amenity}
                  <div>
                    <div class="flex items-start gap-2">
                      <Check class="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="font-medium text-slate-800 text-sm">{amenity.name}</p>
                        {#if amenity.details}
                          <p class="text-xs text-slate-600 mt-1 leading-relaxed">{amenity.details}</p>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Dining Amenities with Details -->
          {#if hotel.diningAmenities && hotel.diningAmenities.length > 0}
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">🍽️</span>
                <h3 class="text-lg font-semibold text-slate-900">Dining</h3>
              </div>
              <div class="space-y-3">
                {#each hotel.diningAmenities as amenity}
                  <div>
                    <div class="flex items-start gap-2">
                      <Check class="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="font-medium text-slate-800 text-sm">{amenity.name}</p>
                        {#if amenity.details}
                          <p class="text-xs text-slate-600 mt-1 leading-relaxed">{amenity.details}</p>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Unique Features with Details -->
          {#if hotel.uniquePoints && hotel.uniquePoints.length > 0}
            <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">✨</span>
                <h3 class="text-lg font-semibold text-slate-900">Unique Features</h3>
              </div>
              <div class="space-y-3">
                {#each hotel.uniquePoints as amenity}
                  <div>
                    <div class="flex items-start gap-2">
                      <Check class="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div class="flex-1">
                        <p class="font-medium text-slate-800 text-sm">{amenity.name}</p>
                        {#if amenity.details}
                          <p class="text-xs text-slate-600 mt-1 leading-relaxed">{amenity.details}</p>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Services Amenities - Simple List -->
          {#if hotel.servicesAmenities && hotel.servicesAmenities.length > 0}
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">🛎️</span>
                <h3 class="text-lg font-semibold text-slate-900">Services</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {#each hotel.servicesAmenities as amenity}
                  <div class="flex items-start gap-2">
                    <Check class="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span class="text-sm text-slate-700">{amenity.name}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/if}
  
  <!-- Filter/Sort Bar -->
  <section class="bg-gradient-to-r from-slate-50 to-amber-50 border-b border-amber-200 sticky top-0" style="z-index: 40;">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Mobile Layout -->
      <div class="block lg:hidden">
        <div class="py-3 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">Suites & Rooms</h2>
            <div class="text-sm text-gray-600">
              {filteredSuites.length} of {allSuites.length} suites
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <!-- Price Filter -->
            <div class="relative dropdown-container">
              <button
                on:click={() => toggleDropdown('price')}
                class="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm transition-colors
                       {(filters.priceMin || filters.priceMax) ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900' : ''}"
              >
                <span>Price</span>
                {#if filters.priceMin || filters.priceMax}
                  <span class="text-xs">
                    ({formatPrice(priceMinValue)}-{formatPrice(priceMaxValue)})
                  </span>
                {/if}
                <ChevronDown class="h-3 w-3 ml-1" />
              </button>
              
              {#if openDropdown === 'price'}
                <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border p-4 min-w-[320px] max-w-[90vw]" style="z-index: 9999;">
                  <div class="space-y-4">
                    <!-- Price Range Display -->
                    <div class="flex justify-between items-center text-sm font-medium text-gray-700">
                      <span>{formatPrice(priceMinValue)}</span>
                      <span>–</span>
                      <span>{formatPrice(priceMaxValue)}</span>
                    </div>
                    
                    <!-- Dual Range Slider -->
                    <div class="relative">
                      <div class="price-slider-container">
                        <!-- Min Range Input -->
                        <input
                          type="range"
                          min={priceRange.min}
                          max={priceRange.max}
                          step={priceRange.step}
                          bind:value={priceMinValue}
                          on:input={handlePriceSliderChange}
                          class="price-slider price-slider-min"
                        />
                        <!-- Max Range Input -->
                        <input
                          type="range"
                          min={priceRange.min}
                          max={priceRange.max}
                          step={priceRange.step}
                          bind:value={priceMaxValue}
                          on:input={handlePriceSliderChange}
                          class="price-slider price-slider-max"
                        />
                        <!-- Slider Track -->
                        <div class="price-slider-track">
                          <div 
                            class="price-slider-range"
                            style="left: {((priceMinValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%; right: {100 - ((priceMaxValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%"
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Price Labels -->
                    <div class="flex justify-between text-xs text-gray-500">
                      <span>{formatPrice(priceRange.min)}</span>
                      <span>{formatPrice(priceRange.max)}</span>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
            
            <!-- Guests Filter -->
            <div class="relative dropdown-container">
              <button
                on:click={() => toggleDropdown('guests')}
                class="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors
                       {filters.persons ? 'bg-luxury-blue text-white hover:bg-blue-700' : ''}"
              >
                <span>Guests</span>
                {#if filters.persons}
                  <span class="text-xs">({filters.persons}+)</span>
                {/if}
                <ChevronDown class="h-3 w-3 ml-1" />
              </button>
              
              {#if openDropdown === 'guests'}
                <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border p-2 min-w-[160px]" style="z-index: 9999;">
                  {#each ['', '1', '2', '3', '4', '5', '6'] as num}
                    <button
                      on:click={() => { filters.persons = num; openDropdown = null; applyFiltersAndSort(); }}
                      class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm
                             {filters.persons === num ? 'bg-gray-100 font-semibold' : ''}"
                    >
                      {num ? `${num}+ guests` : 'Any'}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
            
            <!-- Sort Dropdown -->
            <select 
              bind:value={sortBy}
              on:change={applyFiltersAndSort}
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm cursor-pointer"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="size">Size: Largest First</option>
              <option value="guests">Most Guests</option>
            </select>
            
            <!-- Clear All -->
            {#if activeFilterCount > 0}
              <button
                on:click={() => { clearFilters(); applyFiltersAndSort(); }}
                class="px-3 py-2 text-sm text-gray-600 hover:text-red-600 underline"
              >
                Clear all
              </button>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Desktop Layout -->
      <div class="hidden lg:flex py-3 items-center gap-3">
        <h2 class="text-lg font-semibold text-slate-900 mr-4">Suites & Rooms</h2>
        
        <!-- Price Filter -->
        <div class="relative dropdown-container">
          <button
            on:click={() => toggleDropdown('price')}
            class="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm whitespace-nowrap transition-colors
                   {(filters.priceMin || filters.priceMax) ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-400 hover:to-amber-500' : ''}"
          >
            <span>Price</span>
            {#if filters.priceMin || filters.priceMax}
              <span class="text-xs">
                ({formatPrice(priceMinValue)}-{formatPrice(priceMaxValue)})
              </span>
            {/if}
            <ChevronDown class="h-3 w-3 ml-1" />
          </button>
          
          {#if openDropdown === 'price'}
            <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border p-4 min-w-[320px]" style="z-index: 9999;">
              <div class="space-y-4">
                <!-- Price Range Display -->
                <div class="flex justify-between items-center text-sm font-medium text-gray-700">
                  <span>{formatPrice(priceMinValue)}</span>
                  <span>–</span>
                  <span>{formatPrice(priceMaxValue)}</span>
                </div>
                
                <!-- Dual Range Slider -->
                <div class="relative">
                  <div class="price-slider-container">
                    <!-- Min Range Input -->
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      step={priceRange.step}
                      bind:value={priceMinValue}
                      on:input={handlePriceSliderChange}
                      class="price-slider price-slider-min"
                    />
                    <!-- Max Range Input -->
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      step={priceRange.step}
                      bind:value={priceMaxValue}
                      on:input={handlePriceSliderChange}
                      class="price-slider price-slider-max"
                    />
                    <!-- Slider Track -->
                    <div class="price-slider-track">
                      <div 
                        class="price-slider-range"
                        style="left: {((priceMinValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%; right: {100 - ((priceMaxValue - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%"
                      ></div>
                    </div>
                  </div>
                </div>
                
                <!-- Price Labels -->
                <div class="flex justify-between text-xs text-gray-500">
                  <span>{formatPrice(priceRange.min)}</span>
                  <span>{formatPrice(priceRange.max)}</span>
                </div>
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Guests Filter -->
        <div class="relative dropdown-container">
          <button
            on:click={() => toggleDropdown('guests')}
            class="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm whitespace-nowrap transition-colors
                   {filters.persons ? 'bg-luxury-blue text-white hover:bg-blue-700' : ''}"
          >
            <span>Guests</span>
            {#if filters.persons}
              <span class="text-xs">({filters.persons}+)</span>
            {/if}
            <ChevronDown class="h-3 w-3 ml-1" />
          </button>
          
          {#if openDropdown === 'guests'}
            <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border p-2 min-w-[160px]" style="z-index: 9999;">
              {#each ['', '1', '2', '3', '4', '5', '6'] as num}
                <button
                  on:click={() => { filters.persons = num; openDropdown = null; applyFiltersAndSort(); }}
                  class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm
                         {filters.persons === num ? 'bg-gray-100 font-semibold' : ''}"
                >
                  {num ? `${num}+ guests` : 'Any'}
                </button>
              {/each}
            </div>
          {/if}
        </div>
        
        <!-- Divider -->
        <div class="h-8 w-px bg-gray-300 mx-2"></div>
        
        <!-- Sort Dropdown -->
        <select 
          bind:value={sortBy}
          on:change={applyFiltersAndSort}
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm cursor-pointer"
        >
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="size">Size: Largest First</option>
          <option value="guests">Most Guests</option>
        </select>
        
        <!-- Clear All -->
        {#if activeFilterCount > 0}
          <button
            on:click={() => { clearFilters(); applyFiltersAndSort(); }}
            class="px-4 py-2 text-sm text-gray-600 hover:text-red-600 underline whitespace-nowrap"
          >
            Clear all
          </button>
        {/if}
        
        <!-- Results Count -->
        <div class="ml-auto text-sm text-gray-600 whitespace-nowrap">
          {filteredSuites.length} of {allSuites.length} suites
        </div>
      </div>
    </div>
  </section>
  
  <!-- Suites List Section -->
  <section class="py-8 bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {#if filteredSuites.length === 0}
        <div class="text-center py-12">
          <p class="text-gray-600">No suites match your filters.</p>
          {#if activeFilterCount > 0}
            <button
              on:click={() => { clearFilters(); applyFiltersAndSort(); }}
              class="mt-4 text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          {/if}
        </div>
      {:else}
        <div class="space-y-4">
          {#each filteredSuites as suite}
            <div 
              class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              on:click={() => handleSuiteClick(suite)}
            >
              <div class="flex flex-col md:flex-row">
                <!-- Room Image Carousel - Left side on desktop -->
                <div class="md:w-1/3 lg:w-2/5">
                  {#if suite.roomImages && suite.roomImages.length > 0}
                    <div class="relative h-64 md:h-80 lg:h-72 bg-gray-100 overflow-hidden">
                      <!-- Image track -->
                      <div 
                        class="flex h-full transition-transform duration-300"
                        style="transform: translateX(-{suiteImageIndexes[suite.id] * 100}%)"
                      >
                        {#each suite.roomImages as image}
                          <img 
                            src={image} 
                            alt={suite.roomType}
                            class="min-w-full h-full object-cover"
                          />
                        {/each}
                      </div>
                      
                      <!-- Navigation arrows -->
                      {#if suite.roomImages.length > 1}
                        <button
                          on:click={(e) => prevImage(e, suite.id, suite.roomImages.length)}
                          class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft class="h-4 w-4" />
                        </button>
                        <button
                          on:click={(e) => nextImage(e, suite.id, suite.roomImages.length)}
                          class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight class="h-4 w-4" />
                        </button>
                        
                        <!-- Image counter -->
                        <div class="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                          {suiteImageIndexes[suite.id] + 1} / {suite.roomImages.length}
                        </div>
                      {/if}
                      
                      <!-- Availability badge -->
                      {#if suite.roomsLeft && suite.roomsLeft <= 3}
                        <div class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Only {suite.roomsLeft} left!
                        </div>
                      {/if}
                    </div>
                  {:else}
                    <!-- Fallback image if no room images -->
                    <div class="h-64 md:h-80 lg:h-72 bg-gray-100">
                      <img 
                        src={suite.image} 
                        alt={suite.roomType}
                        class="w-full h-full object-cover"
                      />
                    </div>
                  {/if}
                </div>
                
                <!-- Content - Right side on desktop -->
                <div class="md:w-2/3 lg:w-3/5 p-6 flex flex-col">
                  <!-- Header -->
                  <div class="flex-grow">
                    <h3 class="text-xl font-semibold mb-3">{suite.roomType}</h3>
                    
                    <!-- Room Info -->
                    <div class="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div class="flex items-center">
                        <Users class="h-4 w-4 mr-1" />
                        <span>{suite.persons} guests</span>
                      </div>
                      
                      {#if suite.sqft}
                        <div class="font-semibold">
                          {suite.sqft} ft²
                        </div>
                      {/if}
                      
                      {#if suite.bedTypes && suite.bedTypes.length > 0 && suite.bedTypes[0].beds}
                        <div class="flex items-center">
                          <Bed class="h-4 w-4 mr-1" />
                          <span>{suite.bedTypes[0].beds[0]}</span>
                        </div>
                      {/if}
                    </div>
                    
                  </div>
                  
                  <!-- Pricing and Action - Bottom aligned -->
                  <div class="border-t pt-4 mt-auto">
                    {#if suite.guidelinePrice}
                      <div class="flex justify-between items-end">
                        <div>
                          <div class="flex items-baseline gap-2">
                            <p class="text-2xl font-bold">${suite.guidelinePrice.toLocaleString()}</p>
                            <p class="text-sm text-gray-500">per night</p>
                          </div>
                          <p class="text-xs text-gray-500">Includes taxes & fees</p>
                          {#if suite.options && suite.options.length > 0 && suite.options[0].freeCancellation}
                            <p class="text-sm text-green-600 flex items-center mt-1">
                              <Check class="h-3 w-3 mr-1" />
                              Free cancellation available
                            </p>
                          {/if}
                        </div>
                        <div class="flex flex-col gap-2 items-end">
                          {#if suite.available}
                            <button 
                              on:click|stopPropagation={() => handleSuiteClick(suite)}
                              class="bg-luxury-blue text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                            >
                              View Suite
                            </button>
                          {:else}
                            <span class="px-4 py-2 bg-gray-200 text-gray-500 rounded">
                              Not Available
                            </span>
                          {/if}
                        </div>
                      </div>
                    {:else if suite.options && suite.options.length > 0}
                      <div class="flex justify-between items-end">
                        <div>
                          <div class="flex items-baseline gap-2">
                            <p class="text-2xl font-bold">${Math.round(suite.options[0].price)}</p>
                            <p class="text-sm text-gray-500">per night</p>
                          </div>
                          {#if suite.options[0].excludedTaxesPrice}
                            <p class="text-xs text-gray-500">+${Math.round(suite.options[0].excludedTaxesPrice)} taxes & fees</p>
                          {/if}
                          {#if suite.options[0].freeCancellation}
                            <p class="text-sm text-green-600 flex items-center mt-1">
                              <Check class="h-3 w-3 mr-1" />
                              Free cancellation
                            </p>
                          {/if}
                          {#if suite.options.length > 1}
                            <p class="text-xs text-gray-600 mt-1">
                              {suite.options.length} pricing options available
                            </p>
                          {/if}
                        </div>
                        <div class="flex flex-col gap-2 items-end">
                          {#if suite.available}
                            <button 
                              on:click|stopPropagation={() => handleSuiteClick(suite)}
                              class="bg-luxury-blue text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                            >
                              View Suite
                            </button>
                          {:else}
                            <span class="px-4 py-2 bg-gray-200 text-gray-500 rounded">
                              Not Available
                            </span>
                          {/if}
                        </div>
                      </div>
                    {:else}
                      <div class="text-right">
                        <p class="text-gray-500">Contact for pricing</p>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>
{:else}
  <section class="py-16 bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <p class="text-gray-600">Hotel not found</p>
        <a href="/london" class="text-blue-600 hover:underline">Back to hotels</a>
      </div>
    </div>
  </section>
{/if}

<style>
  /* Price Slider Styles */
  .price-slider-container {
    position: relative;
    height: 20px;
    margin: 10px 0;
  }

  .price-slider {
    position: absolute;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: transparent;
    outline: none;
    pointer-events: none;
    -webkit-appearance: none;
  }

  .price-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #f59e0b;
    cursor: pointer;
    pointer-events: auto;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .price-slider::-moz-range-thumb {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: #f59e0b;
    cursor: pointer;
    pointer-events: auto;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .price-slider::-webkit-slider-thumb:hover {
    background: #d97706;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .price-slider::-moz-range-thumb:hover {
    background: #d97706;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .price-slider-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    transform: translateY(-50%);
  }

  .price-slider-range {
    position: absolute;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #d97706);
    border-radius: 3px;
  }

  .price-slider-min {
    z-index: 2;
  }

  .price-slider-max {
    z-index: 1;
  }
</style>