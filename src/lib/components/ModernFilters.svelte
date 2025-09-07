<script lang="ts">
  import { Filter, X, Search, ChevronDown, Check } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  
  export let filters: {
    priceMin: string;
    priceMax: string;
    persons: string;
    wellness: string[];
    dining: string[];
    services: string[];
    unique: string[];
  };
  
  export let hotelSearch: string = '';
  export let sortBy: string = 'price-low';
  export let activeFilterCount: number = 0;
  
  const dispatch = createEventDispatcher();
  
  let showMobileFilters = false;
  let openDropdown: string | null = null;
  
  // Categorized amenity options
  const amenityCategories = {
    wellness: {
      label: 'Wellness',
      icon: '💆',
      options: [
        'Hot Tub / Spa',
        'Sauna',
        'Steam Room',
        'Indoor pool',
        'Outdoor pool',
        'Fitness centre',
        'Personal trainer service',
        'Yoga / Pilates studio',
        'Wellness treatments',
        'Poolside cabanas / daybeds'
      ]
    },
    dining: {
      label: 'Dining',
      icon: '🍽️',
      options: [
        'Fine dining restaurant(s)',
        'Casual restaurant / café',
        'Bar / lounge',
        'Rooftop bar / terrace dining',
        'Executive lounge refreshments',
        'Afternoon tea service',
        'Private dining room'
      ]
    },
    services: {
      label: 'Services',
      icon: '🛎️',
      options: [
        '24-hour room service',
        'Valet parking',
        'Airport / limousine transfer',
        'Complimentary Town Car',
        'Butler service',
        'Business centre',
        'Meeting / event facilities',
        'Digital check-in / mobile key',
        'Dry cleaning / laundry service',
        'Childcare / babysitting service',
        'Pet services / pet-friendly amenities',
        'Bicycle storage / rental',
        'Turndown service',
        'Executive lounge access'
      ]
    },
    unique: {
      label: 'Unique',
      icon: '✨',
      options: [
        'Panoramic or landmark views',
        'Historical building / heritage architecture',
        'Art or curated design collection',
        'Prime location',
        'Sustainability / eco-certified operations',
        'Bespoke scent branding',
        'Exclusive access',
        'Technologically advanced rooms',
        'Wellness-focused design'
      ]
    }
  };
  
  function toggleDropdown(dropdown: string) {
    openDropdown = openDropdown === dropdown ? null : dropdown;
  }
  
  function closeDropdowns(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      openDropdown = null;
    }
  }
  
  function toggleAmenity(category: 'wellness' | 'dining' | 'services' | 'unique', amenity: string) {
    const currentFilters = filters[category];
    const index = currentFilters.indexOf(amenity);
    
    if (index > -1) {
      currentFilters.splice(index, 1);
    } else {
      currentFilters.push(amenity);
    }
    
    filters[category] = [...currentFilters];
    dispatch('filterChange');
  }
  
  function handleSearchInput() {
    dispatch('searchChange', hotelSearch);
  }
  
  function handleSortChange() {
    dispatch('sortChange', sortBy);
  }
  
  function handleFilterChange() {
    dispatch('filterChange');
  }
  
  function clearFilters() {
    hotelSearch = '';
    filters = {
      priceMin: '',
      priceMax: '',
      persons: '',
      wellness: [],
      dining: [],
      services: [],
      unique: []
    };
    sortBy = 'price-low';
    dispatch('clearFilters');
  }
  
  function applyMobileFilters() {
    showMobileFilters = false;
    dispatch('filterChange');
  }
</script>

<svelte:window on:click={closeDropdowns} />

<!-- Desktop Filter Bar -->
<div class="hidden lg:block bg-white border-b border-gray-200 py-3 relative">
  <div class="flex items-center gap-4 relative">
    <!-- Search Box -->
    <div class="relative flex-1 max-w-sm">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        bind:value={hotelSearch}
        on:input={handleSearchInput}
        placeholder="Search hotels..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    
    <!-- Price Range -->
    <div class="dropdown-container relative">
      <button
        on:click={() => toggleDropdown('price')}
        class="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors
               {(filters.priceMin || filters.priceMax) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
      >
        <span>Price</span>
        {#if filters.priceMin || filters.priceMax}
          <span class="text-sm font-medium">
            ${filters.priceMin || '0'}-${filters.priceMax || '∞'}
          </span>
        {/if}
        <ChevronDown class="w-4 h-4" />
      </button>
      
      {#if openDropdown === 'price'}
        <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[9999] min-w-[280px]">
          <div class="space-y-4">
            <div>
              <label for="minPrice" class="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                id="minPrice"
                type="number"
                placeholder="$0"
                bind:value={filters.priceMin}
                on:change={handleFilterChange}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label for="maxPrice" class="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                id="maxPrice"
                type="number"
                placeholder="No limit"
                bind:value={filters.priceMax}
                on:change={handleFilterChange}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Guests -->
    <div class="dropdown-container relative">
      <button
        on:click={() => toggleDropdown('guests')}
        class="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors
               {filters.persons ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
      >
        <span>Guests</span>
        {#if filters.persons}
          <span class="text-sm font-medium">{filters.persons}+</span>
        {/if}
        <ChevronDown class="w-4 h-4" />
      </button>
      
      {#if openDropdown === 'guests'}
        <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-[9999] min-w-[160px]">
          {#each ['', '1', '2', '3', '4', '5', '6'] as num}
            <button
              on:click={() => { filters.persons = num; openDropdown = null; handleFilterChange(); }}
              class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between
                     {filters.persons === num ? 'bg-blue-50 text-blue-700' : ''}"
            >
              <span>{num ? `${num}+ guests` : 'Any'}</span>
              {#if filters.persons === num}
                <Check class="w-4 h-4" />
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Amenity Filters -->
    {#each Object.entries(amenityCategories) as [key, category]}
      <div class="dropdown-container relative">
        <button
          on:click={() => toggleDropdown(key)}
          class="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors
                 {filters[key].length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
        >
          <span>{category.icon}</span>
          <span>{category.label}</span>
          {#if filters[key].length > 0}
            <span class="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{filters[key].length}</span>
          {/if}
          <ChevronDown class="w-4 h-4" />
        </button>
        
        {#if openDropdown === key}
          <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[9999] min-w-[320px] max-h-[400px] overflow-y-auto">
            <div class="space-y-2">
              {#each category.options as amenity}
                <label class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[key].includes(amenity)}
                    on:change={() => toggleAmenity(key, amenity)}
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">{amenity}</span>
                </label>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/each}
    
    <!-- Sort -->
    <select 
      bind:value={sortBy}
      on:change={handleSortChange}
      class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="size">Size: Largest First</option>
      <option value="rating">Hotel Rating</option>
    </select>
    
    <!-- Clear Filters -->
    {#if activeFilterCount > 0}
      <button
        on:click={clearFilters}
        class="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
      >
        Clear all ({activeFilterCount})
      </button>
    {/if}
  </div>
</div>

<!-- Mobile Filter Bar -->
<div class="lg:hidden bg-white border-b border-gray-200 p-4">
  <div class="flex items-center gap-3">
    <!-- Search Box -->
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        bind:value={hotelSearch}
        on:input={handleSearchInput}
        placeholder="Search hotels..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <!-- Filter Button -->
    <button
      on:click={() => showMobileFilters = true}
      class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Filter class="w-4 h-4" />
      <span>Filters</span>
      {#if activeFilterCount > 0}
        <span class="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-medium">{activeFilterCount}</span>
      {/if}
    </button>
  </div>
  
  <!-- Sort (Mobile) -->
  <div class="mt-3">
    <select 
      bind:value={sortBy}
      on:change={handleSortChange}
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="size">Size: Largest First</option>
      <option value="rating">Hotel Rating</option>
    </select>
  </div>
</div>

<!-- Mobile Filter Panel -->
{#if showMobileFilters}
  <div class="fixed inset-0 z-50 lg:hidden" transition:fade={{ duration: 200 }}>
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50" on:click={() => showMobileFilters = false}></div>
    
    <!-- Panel -->
    <div class="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl" transition:fly={{ x: 400, duration: 300 }}>
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold">Filters</h2>
          <button on:click={() => showMobileFilters = false} class="p-2 hover:bg-gray-100 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- Filter Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <!-- Price Range -->
          <div>
            <h3 class="font-medium mb-3">Price Range</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  bind:value={filters.priceMin}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="No limit"
                  bind:value={filters.priceMax}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <!-- Guests -->
          <div>
            <h3 class="font-medium mb-3">Number of Guests</h3>
            <div class="grid grid-cols-4 gap-2">
              {#each ['', '1', '2', '3', '4', '5', '6'] as num}
                <button
                  on:click={() => { filters.persons = num; }}
                  class="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors
                         {filters.persons === num ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
                >
                  {num || 'Any'}
                </button>
              {/each}
            </div>
          </div>
          
          <!-- Amenities -->
          {#each Object.entries(amenityCategories) as [key, category]}
            <div>
              <h3 class="font-medium mb-3 flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.label}</span>
                {#if filters[key].length > 0}
                  <span class="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{filters[key].length}</span>
                {/if}
              </h3>
              <div class="space-y-2">
                {#each category.options as amenity}
                  <label class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[key].includes(amenity)}
                      on:change={() => toggleAmenity(key, amenity)}
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">{amenity}</span>
                  </label>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 space-y-3">
          <button
            on:click={clearFilters}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            on:click={applyMobileFilters}
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Simple dropdown styling without complex positioning */
  .dropdown-container {
    position: relative;
  }
</style>