<script lang="ts">
  import { Settings, X, ChevronDown, MapPin, Home, Bed, Bath } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  const dispatch = createEventDispatcher();
  
  export let activeFilters = 0;
  export let selectedNeighborhood = 'All Areas';
  export let sortBy = 'newest';
  export let resultCount: string | number = 0;
  export let properties: any[] = [];
  export let hideNeighborhoodFilter = false; // For neighborhood-specific pages
  
  // Store for real-time filtered count
  let previewCount = 0;
  
  // Filter states
  let showFilterDrawer = false;
  let showMobileFilters = false;
  
  // Filter values
  let filters = {
    neighborhood: selectedNeighborhood,
    propertyType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    sqftMin: '',
    sqftMax: ''
  };
  
  // Options
  const neighborhoods = [
    'All Areas', 'Mayfair', 'Chelsea', 'Kensington', 'Hampstead', 
    'Belgravia', 'Notting Hill', 'Marylebone', 'Knightsbridge',
    'Islington', 'Clapham', 'Shoreditch', 'Battersea', 'Fulham',
    'Wimbledon', 'Richmond', 'Putney', "St John's Wood"
  ];
  
  const propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'mews', label: 'Mews House' },
    { value: 'flat', label: 'Flat' }
  ];
  
  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' }
  ];
  
  const bathroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' }
  ];
  
  const priceMinOptions = [
    { value: '', label: 'No min' },
    { value: '500000', label: '£500k' },
    { value: '750000', label: '£750k' },
    { value: '1000000', label: '£1M' },
    { value: '1500000', label: '£1.5M' },
    { value: '2000000', label: '£2M' },
    { value: '3000000', label: '£3M' },
    { value: '4000000', label: '£4M' },
    { value: '5000000', label: '£5M' },
    { value: '7500000', label: '£7.5M' },
    { value: '10000000', label: '£10M' }
  ];
  
  const priceMaxOptions = [
    { value: '', label: 'No max' },
    { value: '750000', label: '£750k' },
    { value: '1000000', label: '£1M' },
    { value: '1500000', label: '£1.5M' },
    { value: '2000000', label: '£2M' },
    { value: '3000000', label: '£3M' },
    { value: '4000000', label: '£4M' },
    { value: '5000000', label: '£5M' },
    { value: '7500000', label: '£7.5M' },
    { value: '10000000', label: '£10M' },
    { value: '15000000', label: '£15M' },
    { value: '20000000', label: '£20M' }
  ];
  
  const sqftMinOptions = [
    { value: '', label: 'No min' },
    { value: '500', label: '500' },
    { value: '750', label: '750' },
    { value: '1000', label: '1,000' },
    { value: '1500', label: '1,500' },
    { value: '2000', label: '2,000' },
    { value: '2500', label: '2,500' },
    { value: '3000', label: '3,000' },
    { value: '4000', label: '4,000' },
    { value: '5000', label: '5,000' },
    { value: '6000', label: '6,000' },
    { value: '7500', label: '7,500' },
    { value: '10000', label: '10,000' },
    { value: '12500', label: '12,500' }
  ];
  
  const sqftMaxOptions = [
    { value: '', label: 'No max' },
    { value: '750', label: '750' },
    { value: '1000', label: '1,000' },
    { value: '1500', label: '1,500' },
    { value: '2000', label: '2,000' },
    { value: '2500', label: '2,500' },
    { value: '3000', label: '3,000' },
    { value: '4000', label: '4,000' },
    { value: '5000', label: '5,000' },
    { value: '6000', label: '6,000' },
    { value: '7500', label: '7,500' },
    { value: '10000', label: '10,000' },
    { value: '12500', label: '12,500' },
    { value: '15000', label: '15,000' }
  ];
  
  const sortOptions = [
    { value: 'newest', label: 'Newest', fullLabel: 'Newest First' },
    { value: 'price-low', label: 'Price ↑', fullLabel: 'Price: Low to High' },
    { value: 'price-high', label: 'Price ↓', fullLabel: 'Price: High to Low' },
    { value: 'size', label: 'Size ↓', fullLabel: 'Size: Largest First' },
    { value: 'bedrooms', label: 'Beds ↓', fullLabel: 'Bedrooms: Most First' }
  ];
  
  // Calculate active filters
  $: {
    let count = 0;
    if (filters.neighborhood !== 'All Areas' && !hideNeighborhoodFilter) count++;
    if (filters.propertyType) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.sqftMin || filters.sqftMax) count++;
    activeFilters = count;
  }
  
  // Calculate preview count in real-time as filters change
  $: {
    let filtered = [...properties];
    
    // Filter by neighborhood
    if (!hideNeighborhoodFilter && filters.neighborhood !== 'All Areas') {
      filtered = filtered.filter(property => 
        property.neighborhood?.toLowerCase() === filters.neighborhood.toLowerCase()
      );
    }
    
    // Filter by property type
    if (filters.propertyType) {
      filtered = filtered.filter(property => 
        property.property_type === filters.propertyType
      );
    }
    
    // Filter by price
    if (filters.priceMin || filters.priceMax) {
      const minPrice = filters.priceMin ? parseInt(filters.priceMin) : 0;
      const maxPrice = filters.priceMax ? parseInt(filters.priceMax) : Infinity;
      filtered = filtered.filter(property => {
        const price = property.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }
    
    // Filter by bedrooms
    if (filters.bedrooms) {
      const minBedrooms = parseInt(filters.bedrooms);
      filtered = filtered.filter(property => 
        (property.bedrooms || 0) >= minBedrooms
      );
    }
    
    // Filter by bathrooms
    if (filters.bathrooms) {
      const minBathrooms = parseInt(filters.bathrooms);
      filtered = filtered.filter(property => 
        (property.bathrooms || 0) >= minBathrooms
      );
    }
    
    // Filter by square footage
    if (filters.sqftMin || filters.sqftMax) {
      const minSqft = filters.sqftMin ? parseInt(filters.sqftMin) : 0;
      const maxSqft = filters.sqftMax ? parseInt(filters.sqftMax) : Infinity;
      filtered = filtered.filter(property => {
        const sqft = property.sqft || 0;
        return sqft >= minSqft && sqft <= maxSqft;
      });
    }
    
    previewCount = filtered.length;
  }
  
  function applyFilters() {
    dispatch('filterChange', filters);
    showFilterDrawer = false;
    showMobileFilters = false;
  }
  
  function clearFilters() {
    filters = {
      neighborhood: hideNeighborhoodFilter ? '' : 'All Areas',
      propertyType: '',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      sqftMin: '',
      sqftMax: ''
    };
    applyFilters();
  }
  
  function handleSort(value: string) {
    sortBy = value;
    dispatch('sortChange', value);
  }
  
  // Quick filter functions
  function quickFilterChange() {
    dispatch('filterChange', filters);
  }
  
  // Format price for display
  function formatPrice(value: string): string {
    if (!value) return '';
    const num = parseInt(value);
    if (num >= 1000000) {
      return `£${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `£${(num / 1000).toFixed(0)}k`;
    }
    return `£${num}`;
  }
  
  // Get price range display
  $: priceRangeDisplay = (() => {
    if (!filters.priceMin && !filters.priceMax) return 'Price';
    if (filters.priceMin && !filters.priceMax) return `${formatPrice(filters.priceMin)}+`;
    if (!filters.priceMin && filters.priceMax) return `Up to ${formatPrice(filters.priceMax)}`;
    return `${formatPrice(filters.priceMin)} - ${formatPrice(filters.priceMax)}`;
  })();
</script>

<!-- Desktop Filter Bar -->
<div class="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
    <!-- Quick Filters Row -->
    <div class="flex items-center gap-3 mb-3">
      <!-- Location Filter (if not hidden) -->
      {#if !hideNeighborhoodFilter}
        <div class="relative">
          <select 
            bind:value={filters.neighborhood}
            on:change={quickFilterChange}
            class="appearance-none pl-9 pr-10 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue cursor-pointer bg-white"
          >
            {#each neighborhoods as neighborhood}
              <option value={neighborhood}>{neighborhood}</option>
            {/each}
          </select>
          <MapPin class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          <ChevronDown class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
      {/if}
      
      <!-- Property Type Filter -->
      <div class="relative">
        <select 
          bind:value={filters.propertyType}
          on:change={quickFilterChange}
          class="appearance-none pl-9 pr-10 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue cursor-pointer bg-white"
        >
          {#each propertyTypes as type}
            <option value={type.value}>{type.label}</option>
          {/each}
        </select>
        <Home class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <ChevronDown class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
      
      <!-- Price Range Quick Select -->
      <button 
        class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 bg-white"
        on:click={() => showFilterDrawer = true}
      >
        <span class="text-gray-700">{priceRangeDisplay}</span>
        <ChevronDown class="h-4 w-4 text-gray-500" />
      </button>
      
      <!-- Bedrooms Filter -->
      <div class="relative">
        <select 
          bind:value={filters.bedrooms}
          on:change={quickFilterChange}
          class="appearance-none pl-9 pr-10 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue cursor-pointer bg-white"
        >
          {#each bedroomOptions as option}
            <option value={option.value}>{option.label} Beds</option>
          {/each}
        </select>
        <Bed class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        <ChevronDown class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
      
      <!-- Filters Button -->
      <button 
        class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        on:click={() => showFilterDrawer = true}
      >
        <Settings class="h-4 w-4" />
        <span>Filters</span>
        {#if activeFilters > 0}
          <span class="bg-white text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {activeFilters}
          </span>
        {/if}
      </button>
      
      <div class="flex-1"></div>
      
      <!-- Sort Dropdown -->
      <div class="relative">
        <select 
          bind:value={sortBy}
          on:change={(e) => handleSort(e.currentTarget.value)}
          class="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue cursor-pointer bg-white text-sm text-gray-700 font-medium"
        >
          {#each sortOptions as option}
            <option value={option.value}>{option.fullLabel}</option>
          {/each}
        </select>
        <ChevronDown class="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
      
      <!-- Results Count -->
      <div class="text-sm text-gray-600 px-2">
        Showing <span class="font-semibold text-gray-900">{resultCount}</span> properties
      </div>
    </div>
  </div>
</div>

<!-- Mobile Filter Bar -->
<div class="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="px-4 py-3">
    <!-- Mobile Quick Filters -->
    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button 
        class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0"
        on:click={() => showMobileFilters = true}
      >
        <Settings class="h-3.5 w-3.5" />
        <span>Filters</span>
        {#if activeFilters > 0}
          <span class="bg-white text-gray-900 text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
            {activeFilters}
          </span>
        {/if}
      </button>
      
      <div class="relative flex-shrink-0">
        <select 
          bind:value={sortBy}
          on:change={(e) => handleSort(e.currentTarget.value)}
          class="appearance-none pl-3 pr-8 py-1.5 bg-gray-100 rounded-full text-sm font-medium cursor-pointer"
        >
          {#each sortOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <ChevronDown class="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-600 pointer-events-none" />
      </div>
      
      {#if filters.propertyType}
        <span class="px-3 py-1.5 bg-luxury-blue text-white rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0">
          {propertyTypes.find(t => t.value === filters.propertyType)?.label}
        </span>
      {/if}
      
      {#if filters.bedrooms}
        <span class="px-3 py-1.5 bg-luxury-blue text-white rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0">
          {filters.bedrooms}+ Beds
        </span>
      {/if}
      
      {#if filters.priceMin || filters.priceMax}
        <span class="px-3 py-1.5 bg-luxury-blue text-white rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0">
          {priceRangeDisplay}
        </span>
      {/if}
    </div>
    
    <!-- Results Count -->
    <div class="text-xs text-gray-600 text-center mt-1">
      {resultCount} properties
    </div>
  </div>
</div>

<!-- Desktop Filter Drawer -->
{#if showFilterDrawer}
  <div class="fixed inset-0 z-50 hidden md:block">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black bg-opacity-50"
      on:click={() => showFilterDrawer = false}
      transition:fade
    ></div>
    
    <!-- Drawer -->
    <div 
      class="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl"
      transition:fly={{ x: 400, duration: 300 }}
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">All Filters</h2>
        <button 
          on:click={() => showFilterDrawer = false}
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Filter Content -->
      <div class="p-6 space-y-6 overflow-y-auto" style="max-height: calc(100vh - 180px);">
        {#if !hideNeighborhoodFilter}
          <!-- Area Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Area</label>
            <select 
              bind:value={filters.neighborhood}
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each neighborhoods as neighborhood}
                <option value={neighborhood}>{neighborhood}</option>
              {/each}
            </select>
          </div>
        {/if}
        
        <!-- Property Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Property Type</label>
          <div class="grid grid-cols-2 gap-2">
            {#each propertyTypes as type}
              <button
                class="py-2 px-3 rounded-lg border text-sm font-medium transition-colors
                       {filters.propertyType === type.value 
                         ? 'bg-luxury-blue text-white border-luxury-blue' 
                         : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
                on:click={() => filters.propertyType = type.value}
              >
                {type.label}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Price Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
          <div class="flex gap-2 items-center">
            <select 
              bind:value={filters.priceMin}
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each priceMinOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-gray-500">-</span>
            <select 
              bind:value={filters.priceMax}
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each priceMaxOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
        
        <!-- Bedrooms -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Bedrooms</label>
          <div class="grid grid-cols-3 gap-2">
            {#each bedroomOptions as option}
              <button
                class="py-2 px-3 rounded-lg border text-sm font-medium transition-colors
                       {filters.bedrooms === option.value 
                         ? 'bg-luxury-blue text-white border-luxury-blue' 
                         : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
                on:click={() => filters.bedrooms = option.value}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Bathrooms -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Bathrooms</label>
          <div class="grid grid-cols-3 gap-2">
            {#each bathroomOptions as option}
              <button
                class="py-2 px-3 rounded-lg border text-sm font-medium transition-colors
                       {filters.bathrooms === option.value 
                         ? 'bg-luxury-blue text-white border-luxury-blue' 
                         : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
                on:click={() => filters.bathrooms = option.value}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Square Footage -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Square Footage</label>
          <div class="flex gap-2 items-center">
            <select 
              bind:value={filters.sqftMin}
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each sqftMinOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-gray-500">-</span>
            <select 
              bind:value={filters.sqftMax}
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each sqftMaxOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 flex gap-3">
        <button 
          on:click={clearFilters}
          class="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
        <button 
          on:click={applyFilters}
          class="flex-1 py-2.5 bg-luxury-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Show {previewCount} Results
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Mobile Filters Modal -->
{#if showMobileFilters}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
    <div class="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">Filters</h3>
        <button 
          on:click={() => showMobileFilters = false}
          class="p-2 hover:bg-gray-100 rounded-full"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Filter Content -->
      <div class="px-4 py-4 space-y-6">
        {#if !hideNeighborhoodFilter}
          <!-- Area -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Area</label>
            <select 
              bind:value={filters.neighborhood}
              class="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each neighborhoods as neighborhood}
                <option value={neighborhood}>{neighborhood}</option>
              {/each}
            </select>
          </div>
        {/if}
        
        <!-- Property Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Property Type</label>
          <select 
            bind:value={filters.propertyType}
            class="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
          >
            {#each propertyTypes as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
        </div>
        
        <!-- Price Range -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
          <div class="flex gap-2 items-center">
            <select 
              bind:value={filters.priceMin}
              class="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each priceMinOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-gray-500">-</span>
            <select 
              bind:value={filters.priceMax}
              class="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each priceMaxOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
        
        <!-- Bedrooms -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Bedrooms</label>
          <div class="grid grid-cols-3 gap-2">
            {#each bedroomOptions as option}
              <button
                class="py-2 px-3 rounded-lg border text-sm font-medium transition-colors
                       {filters.bedrooms === option.value 
                         ? 'bg-luxury-blue text-white border-luxury-blue' 
                         : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
                on:click={() => filters.bedrooms = option.value}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Bathrooms -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Bathrooms</label>
          <div class="grid grid-cols-3 gap-2">
            {#each bathroomOptions as option}
              <button
                class="py-2 px-3 rounded-lg border text-sm font-medium transition-colors
                       {filters.bathrooms === option.value 
                         ? 'bg-luxury-blue text-white border-luxury-blue' 
                         : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
                on:click={() => filters.bathrooms = option.value}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Square Footage -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Square Footage</label>
          <div class="flex gap-2 items-center">
            <select 
              bind:value={filters.sqftMin}
              class="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each sqftMinOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <span class="text-gray-500">-</span>
            <select 
              bind:value={filters.sqftMax}
              class="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each sqftMaxOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 flex gap-3">
        <button 
          on:click={clearFilters}
          class="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
        >
          Clear All
        </button>
        <button 
          on:click={applyFilters}
          class="flex-1 py-3 bg-luxury-blue text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Show {previewCount} {previewCount === 1 ? 'Result' : 'Results'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom scrollbar for mobile horizontal scroll */
  @media (max-width: 768px) {
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  }
</style>