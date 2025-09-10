<script lang="ts">
  import { Filter, X, Search, ChevronDown, Check, Hotel, Bed } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  
  // Hotel-level filters
  export let hotelFilters: {
    hotelSearch: string;
    wellness: string[];
    dining: string[];
    services: string[];
    unique: string[];
  };
  
  // Room-level filters
  export let roomFilters: {
    persons: string;
    priceMin: string;
    priceMax: string;
    minSize: string;
  };

  export let currency: string = 'USD';
  
  export let sortBy: string = 'price-low';
  export let activeFilterCount: number = 0;
  
  const dispatch = createEventDispatcher();

  const currencies = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' }
  ];
  
  let showMobileFilters = false;
  let openDropdown: string | null = null;
  
  // Track expanded categories in mobile view
  let expandedMobileCategories: Record<string, boolean> = {
    wellness: false,
    dining: false,
    services: false,
    unique: false
  };
  
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
    const currentFilters = hotelFilters[category];
    const index = currentFilters.indexOf(amenity);
    
    if (index > -1) {
      currentFilters.splice(index, 1);
    } else {
      currentFilters.push(amenity);
    }
    
    hotelFilters[category] = [...currentFilters];
    dispatch('hotelFilterChange');
  }
  
  function toggleMobileCategory(category: string) {
    expandedMobileCategories[category] = !expandedMobileCategories[category];
  }
  
  function handleHotelSearchInput() {
    dispatch('hotelSearchChange', hotelFilters.hotelSearch);
  }
  
  function handleRoomFilterChange() {
    dispatch('roomFilterChange');
  }
  
  function handleSortChange() {
    dispatch('sortChange', sortBy);
  }

  function handleCurrencyChange() {
    dispatch('currencyChange', currency);
  }
  
  function clearAllFilters() {
    hotelFilters = {
      hotelSearch: '',
      wellness: [],
      dining: [],
      services: [],
      unique: []
    };
    roomFilters = {
      persons: '',
      priceMin: '',
      priceMax: '',
      minSize: ''
    };
    sortBy = 'price-low';
    dispatch('clearFilters');
  }
  
  function applyMobileFilters() {
    showMobileFilters = false;
    dispatch('hotelFilterChange');
    dispatch('roomFilterChange');
  }
</script>

<svelte:window on:click={closeDropdowns} />

<!-- Desktop Filter Bars -->
<div class="hidden lg:block">
  <!-- Hotel Filters Row -->
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 py-3">
    <div class="flex items-center gap-3 px-4">
      <div class="flex items-center gap-2 text-blue-700 font-medium">
        <Hotel class="w-4 h-4" />
        <span class="text-sm">Hotel Filters:</span>
      </div>
      
      <!-- Hotel Search -->
      <div class="relative flex-1 max-w-xs">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          bind:value={hotelFilters.hotelSearch}
          on:input={handleHotelSearchInput}
          placeholder="Search hotels..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>
      
      <!-- Hotel Amenity Filters -->
      {#each Object.entries(amenityCategories) as [key, category]}
        <div class="dropdown-container relative">
          <button
            on:click={() => toggleDropdown(`hotel-${key}`)}
            class="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-white/50 transition-colors text-sm
                   {hotelFilters[key].length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white'}"
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
            {#if hotelFilters[key].length > 0}
              <span class="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{hotelFilters[key].length}</span>
            {/if}
            <ChevronDown class="w-3 h-3" />
          </button>
          
          {#if openDropdown === `hotel-${key}`}
            <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[9999] min-w-[320px] max-h-[400px] overflow-y-auto">
              <div class="space-y-2">
                {#each category.options as amenity}
                  <label class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hotelFilters[key].includes(amenity)}
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
    </div>
  </div>
  
  <!-- Room Filters Row -->
  <div class="bg-white border-b border-gray-200 py-3">
    <div class="flex items-center gap-3 px-4">
      <div class="flex items-center gap-2 text-gray-700 font-medium">
        <Bed class="w-4 h-4" />
        <span class="text-sm">Room Filters:</span>
      </div>
      
      <!-- Guests Filter -->
      <div class="dropdown-container relative">
        <button
          on:click={() => toggleDropdown('guests')}
          class="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition-colors text-sm
                 {roomFilters.persons ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
        >
          <span>Guests</span>
          {#if roomFilters.persons}
            <span class="font-medium">{roomFilters.persons}+</span>
          {/if}
          <ChevronDown class="w-3 h-3" />
        </button>
        
        {#if openDropdown === 'guests'}
          <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-[9999] min-w-[160px]">
            {#each ['', '1', '2', '3', '4', '5', '6'] as num}
              <button
                on:click={() => { roomFilters.persons = num; openDropdown = null; handleRoomFilterChange(); }}
                class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between text-sm
                       {roomFilters.persons === num ? 'bg-blue-50 text-blue-700' : ''}"
              >
                <span>{num ? `${num}+ guests` : 'Any'}</span>
                {#if roomFilters.persons === num}
                  <Check class="w-3 h-3" />
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
      
      <!-- Price Range -->
      <div class="dropdown-container relative">
        <button
          on:click={() => toggleDropdown('price')}
          class="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition-colors text-sm
                 {(roomFilters.priceMin || roomFilters.priceMax) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
        >
          <span>Price</span>
          {#if roomFilters.priceMin || roomFilters.priceMax}
            <span class="font-medium">
              ${roomFilters.priceMin || '0'}-${roomFilters.priceMax || '∞'}
            </span>
          {/if}
          <ChevronDown class="w-3 h-3" />
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
                  bind:value={roomFilters.priceMin}
                  on:change={handleRoomFilterChange}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label for="maxPrice" class="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  id="maxPrice"
                  type="number"
                  placeholder="No limit"
                  bind:value={roomFilters.priceMax}
                  on:change={handleRoomFilterChange}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Room Size Filter -->
      <div class="dropdown-container relative">
        <button
          on:click={() => toggleDropdown('size')}
          class="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition-colors text-sm
                 {roomFilters.minSize ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
        >
          <span>Size</span>
          {#if roomFilters.minSize}
            <span class="font-medium">{roomFilters.minSize}+ ft²</span>
          {/if}
          <ChevronDown class="w-3 h-3" />
        </button>
        
        {#if openDropdown === 'size'}
          <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-[9999] min-w-[200px]">
            {#each ['', '200', '400', '600', '800', '1000', '1500'] as size}
              <button
                on:click={() => { roomFilters.minSize = size; openDropdown = null; handleRoomFilterChange(); }}
                class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between text-sm
                       {roomFilters.minSize === size ? 'bg-blue-50 text-blue-700' : ''}"
              >
                <span>{size ? `${size}+ ft²` : 'Any size'}</span>
                {#if roomFilters.minSize === size}
                  <Check class="w-3 h-3" />
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
      
      <div class="h-6 w-px bg-gray-300 mx-2"></div>
      
      <!-- Currency -->
      <div class="dropdown-container relative">
        <button
          on:click={() => toggleDropdown('currency')}
          class="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <span>{currencies.find(c => c.code === currency)?.symbol || '$'}</span>
          <span>{currency}</span>
          <ChevronDown class="w-3 h-3" />
        </button>
        
        {#if openDropdown === 'currency'}
          <div class="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-[9999] min-w-[200px]">
            {#each currencies as curr}
              <button
                on:click={() => { currency = curr.code; openDropdown = null; handleCurrencyChange(); }}
                class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors flex items-center justify-between text-sm
                       {currency === curr.code ? 'bg-blue-50 text-blue-700' : ''}"
              >
                <div class="flex items-center gap-2">
                  <span>{curr.symbol}</span>
                  <span>{curr.label}</span>
                </div>
                {#if currency === curr.code}
                  <Check class="w-3 h-3" />
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
      
      <!-- Sort -->
      <select 
        bind:value={sortBy}
        on:change={handleSortChange}
        class="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="size">Size: Largest First</option>
        <option value="rating">Hotel Rating</option>
        <option value="refurbished">Recently Refurbished</option>
      </select>
      
      <!-- Clear All -->
      {#if activeFilterCount > 0}
        <button
          on:click={clearAllFilters}
          class="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear all ({activeFilterCount})
        </button>
      {/if}
    </div>
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
        bind:value={hotelFilters.hotelSearch}
        on:input={handleHotelSearchInput}
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
  
  <!-- Sort & Currency (Mobile) -->
  <div class="mt-3 grid grid-cols-2 gap-3">
    <select 
      bind:value={sortBy}
      on:change={handleSortChange}
      class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="size">Size: Largest First</option>
      <option value="rating">Hotel Rating</option>
      <option value="refurbished">Recently Refurbished</option>
    </select>
    
    <select 
      bind:value={currency}
      on:change={handleCurrencyChange}
      class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {#each currencies as curr}
        <option value={curr.code}>{curr.symbol} {curr.code}</option>
      {/each}
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
          <h3 class="font-medium text-blue-700 flex items-center gap-2">
            <Hotel class="w-4 h-4" />
            Hotel Filters
          </h3>
          
          <!-- Hotel Amenities with Collapsible Sections -->
          {#each Object.entries(amenityCategories) as [key, category]}
            {@const isExpanded = expandedMobileCategories[key]}
            <div class="border border-gray-200 rounded-lg">
              <button
                on:click={() => toggleMobileCategory(key)}
                class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span class="font-medium">{category.label}</span>
                  {#if hotelFilters[key].length > 0}
                    <span class="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{hotelFilters[key].length}</span>
                  {/if}
                </div>
                <ChevronDown class="w-4 h-4 transition-transform {isExpanded ? 'rotate-180' : ''}" />
              </button>
              {#if isExpanded}
                <div class="px-4 pb-3 space-y-2 border-t border-gray-100">
                  {#each category.options as amenity}
                    <label class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hotelFilters[key].includes(amenity)}
                        on:change={() => toggleAmenity(key, amenity)}
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span class="text-sm text-gray-700">{amenity}</span>
                    </label>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
          
          <hr />
          
          <h3 class="font-medium text-gray-700 flex items-center gap-2">
            <Bed class="w-4 h-4" />
            Room Filters
          </h3>
          
          <!-- Guests -->
          <div>
            <h4 class="font-medium mb-3">Number of Guests</h4>
            <div class="grid grid-cols-4 gap-2">
              {#each ['', '1', '2', '3', '4', '5', '6'] as num}
                <button
                  on:click={() => { roomFilters.persons = num; }}
                  class="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors text-sm
                         {roomFilters.persons === num ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
                >
                  {num || 'Any'}
                </button>
              {/each}
            </div>
          </div>
          
          <!-- Price Range -->
          <div>
            <h4 class="font-medium mb-3">Price Range</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  bind:value={roomFilters.priceMin}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="No limit"
                  bind:value={roomFilters.priceMax}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <!-- Room Size -->
          <div>
            <h4 class="font-medium mb-3">Minimum Room Size</h4>
            <div class="grid grid-cols-3 gap-2">
              {#each ['', '200', '400', '600', '800', '1000'] as size}
                <button
                  on:click={() => { roomFilters.minSize = size; }}
                  class="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors text-sm
                         {roomFilters.minSize === size ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}"
                >
                  {size ? `${size}+ ft²` : 'Any'}
                </button>
              {/each}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-gray-200 space-y-3">
          <button
            on:click={clearAllFilters}
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
  .dropdown-container {
    position: relative;
  }
</style>