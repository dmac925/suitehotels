<script lang="ts">
  import { Settings, ArrowUpDown, X, ChevronDown } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let activeFilters = 0;
  export let selectedNeighborhood = 'All Areas';
  export let sortBy = 'newest';
  export let resultCount = 0;
  export let properties = [];
  
  // Store for real-time filtered count
  let previewCount = 0;
  
  // Filter states
  let showFilters = false;
  let showSort = false;
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
    'Belgravia', 'Notting Hill', 'Marylebone', 'Knightsbridge'
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
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'size', label: 'Size: Largest First' },
    { value: 'bedrooms', label: 'Bedrooms: Most First' }
  ];
  
  // Calculate active filters
  $: {
    let count = 0;
    if (filters.neighborhood !== 'All Areas') count++;
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
    if (filters.neighborhood !== 'All Areas') {
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
    showFilters = false;
    showMobileFilters = false;
  }
  
  function clearFilters() {
    filters = {
      neighborhood: 'All Areas',
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
    showSort = false;
  }
</script>

<!-- Desktop Filter Bar -->
<div class="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
    <!-- Filter and Sort Buttons -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <!-- Filters Button -->
        <button 
          class="flex items-center gap-2 px-4 py-2 border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors font-medium"
          on:click={() => showFilters = !showFilters}
        >
          <Settings class="h-4 w-4" />
          <span>Filters</span>
          {#if activeFilters > 0}
            <span class="bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilters}
            </span>
          {/if}
        </button>
        
        <!-- Sort Button -->
        <button 
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          on:click={() => showSort = !showSort}
        >
          <ArrowUpDown class="h-4 w-4" />
          <span>Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
        </button>
      </div>
      
      <!-- Results Count -->
      <div class="text-sm text-gray-600">
        Showing <span class="font-medium">{resultCount}</span> properties
      </div>
    </div>
    
    <!-- Desktop Filters Dropdown -->
    {#if showFilters}
      <div class="bg-gray-50 rounded-lg p-6 mb-4">
        <div class="grid grid-cols-4 gap-4">
          <!-- Area Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Area</label>
            <select 
              bind:value={filters.neighborhood}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each neighborhoods as neighborhood}
                <option value={neighborhood}>{neighborhood}</option>
              {/each}
            </select>
          </div>
          
          <!-- Property Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select 
              bind:value={filters.propertyType}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each propertyTypes as type}
                <option value={type.value}>{type.label}</option>
              {/each}
            </select>
          </div>
          
          <!-- Bedrooms -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
            <select 
              bind:value={filters.bedrooms}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each bedroomOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
          
          <!-- Bathrooms -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
            <select 
              bind:value={filters.bathrooms}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each bathroomOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
          
          <!-- Price Range -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div class="flex gap-2 items-center">
              <select 
                bind:value={filters.priceMin}
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                {#each priceMinOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
              <span class="text-gray-500">-</span>
              <select 
                bind:value={filters.priceMax}
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                {#each priceMaxOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>
          </div>
          
          <!-- Square Footage -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Square Footage</label>
            <div class="flex gap-2 items-center">
              <select 
                bind:value={filters.sqftMin}
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                {#each sqftMinOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
              <span class="text-gray-500">-</span>
              <select 
                bind:value={filters.sqftMax}
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                {#each sqftMaxOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
        
        <!-- Filter Actions -->
        <div class="flex justify-between mt-6">
          <button 
            on:click={clearFilters}
            class="text-gray-600 hover:text-gray-900 font-medium"
          >
            Clear All
          </button>
          <button 
            on:click={applyFilters}
            class="bg-luxury-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    {/if}
    
    <!-- Sort Dropdown -->
    {#if showSort}
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-5 gap-2">
          {#each sortOptions as option}
            <button 
              class="px-3 py-2 text-left rounded transition-colors {sortBy === option.value ? 'bg-luxury-blue text-white' : 'hover:bg-gray-200'}"
              on:click={() => handleSort(option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Mobile Filter Bar -->
<div class="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="px-4 py-3">
    <!-- Mobile Filter Controls -->
    <div class="flex items-center justify-between mb-2">
      <button 
        class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium"
        on:click={() => showMobileFilters = true}
      >
        <Settings class="h-4 w-4" />
        <span>Filters</span>
        {#if activeFilters > 0}
          <span class="bg-luxury-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilters}
          </span>
        {/if}
      </button>
      
      <button 
        class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium"
        on:click={() => showSort = !showSort}
      >
        <ArrowUpDown class="h-4 w-4" />
        <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
        <ChevronDown class="h-3 w-3" />
      </button>
    </div>
    
    <!-- Results Count -->
    <div class="text-xs text-gray-600 text-center">
      {resultCount} properties found
    </div>
    
    <!-- Mobile Sort Dropdown -->
    {#if showSort}
      <div class="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
        <div class="space-y-2">
          {#each sortOptions as option}
            <button 
              class="w-full px-3 py-2 text-left rounded text-sm {sortBy === option.value ? 'bg-luxury-blue text-white' : 'hover:bg-gray-100'}"
              on:click={() => handleSort(option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

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
          <div class="grid grid-cols-6 gap-2">
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
          <div class="grid grid-cols-5 gap-2">
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
  /* Custom scrollbar for mobile filter modal */
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