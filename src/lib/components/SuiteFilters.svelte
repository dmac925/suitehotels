<script lang="ts">
  import { ChevronDown, Search } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  
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
  
  let openDropdown: string | null = null;
  
  // Categorized amenity options based on fetchHotelAmenities.js taxonomy
  const amenityCategories = {
    wellness: {
      label: 'Wellness',
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
      label: 'Unique Features',
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
</script>

<svelte:window on:click={closeDropdowns} />

<div class="filter-bar">
  <div class="filter-container">
    <!-- Hotel Search -->
    <div class="search-container">
      <Search class="search-icon" />
      <input
        type="text"
        bind:value={hotelSearch}
        on:input={handleSearchInput}
        placeholder="Search hotels..."
        class="search-input"
      />
    </div>
    
    <div class="divider"></div>
    
    <!-- Price Filter -->
    <div class="dropdown-container">
      <button
        on:click={() => toggleDropdown('price')}
        class="filter-button {(filters.priceMin || filters.priceMax) ? 'active' : ''}"
      >
        <span>Price</span>
        {#if filters.priceMin || filters.priceMax}
          <span class="filter-value">
            (${filters.priceMin || '0'}-${filters.priceMax || '∞'})
          </span>
        {/if}
        <ChevronDown class="chevron" />
      </button>
      
      {#if openDropdown === 'price'}
        <div class="dropdown-menu price-dropdown">
          <div class="price-inputs">
            <div>
              <label>Min Price</label>
              <input
                type="number"
                placeholder="$0"
                bind:value={filters.priceMin}
                on:change={handleFilterChange}
                class="price-input"
              />
            </div>
            <div>
              <label>Max Price</label>
              <input
                type="number"
                placeholder="No limit"
                bind:value={filters.priceMax}
                on:change={handleFilterChange}
                class="price-input"
              />
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Guests Filter -->
    <div class="dropdown-container">
      <button
        on:click={() => toggleDropdown('guests')}
        class="filter-button {filters.persons ? 'active' : ''}"
      >
        <span>Guests</span>
        {#if filters.persons}
          <span class="filter-value">({filters.persons}+)</span>
        {/if}
        <ChevronDown class="chevron" />
      </button>
      
      {#if openDropdown === 'guests'}
        <div class="dropdown-menu guests-dropdown">
          {#each ['', '1', '2', '3', '4', '5', '6'] as num}
            <button
              on:click={() => { filters.persons = num; openDropdown = null; handleFilterChange(); }}
              class="guest-option {filters.persons === num ? 'selected' : ''}"
            >
              {num ? `${num}+ guests` : 'Any'}
            </button>
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Wellness Amenities -->
    <div class="dropdown-container">
      <button
        on:click={() => toggleDropdown('wellness')}
        class="filter-button {filters.wellness.length > 0 ? 'active' : ''}"
      >
        <span>{amenityCategories.wellness.label}</span>
        {#if filters.wellness.length > 0}
          <span class="filter-count">({filters.wellness.length})</span>
        {/if}
        <ChevronDown class="chevron" />
      </button>
      
      {#if openDropdown === 'wellness'}
        <div class="dropdown-menu amenity-dropdown">
          <div class="amenity-grid">
            {#each amenityCategories.wellness.options as amenity}
              <label class="amenity-option">
                <input
                  type="checkbox"
                  checked={filters.wellness.includes(amenity)}
                  on:change={() => toggleAmenity('wellness', amenity)}
                  class="amenity-checkbox"
                />
                <span class="amenity-label">{amenity}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Dining Amenities -->
    <div class="dropdown-container">
      <button
        on:click={() => toggleDropdown('dining')}
        class="filter-button {filters.dining.length > 0 ? 'active' : ''}"
      >
        <span>{amenityCategories.dining.label}</span>
        {#if filters.dining.length > 0}
          <span class="filter-count">({filters.dining.length})</span>
        {/if}
        <ChevronDown class="chevron" />
      </button>
      
      {#if openDropdown === 'dining'}
        <div class="dropdown-menu amenity-dropdown">
          <div class="amenity-grid">
            {#each amenityCategories.dining.options as amenity}
              <label class="amenity-option">
                <input
                  type="checkbox"
                  checked={filters.dining.includes(amenity)}
                  on:change={() => toggleAmenity('dining', amenity)}
                  class="amenity-checkbox"
                />
                <span class="amenity-label">{amenity}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Services Amenities -->
    <div class="dropdown-container">
      <button
        on:click={() => toggleDropdown('services')}
        class="filter-button {filters.services.length > 0 ? 'active' : ''}"
      >
        <span>{amenityCategories.services.label}</span>
        {#if filters.services.length > 0}
          <span class="filter-count">({filters.services.length})</span>
        {/if}
        <ChevronDown class="chevron" />
      </button>
      
      {#if openDropdown === 'services'}
        <div class="dropdown-menu amenity-dropdown services-dropdown">
          <div class="amenity-grid">
            {#each amenityCategories.services.options as amenity}
              <label class="amenity-option">
                <input
                  type="checkbox"
                  checked={filters.services.includes(amenity)}
                  on:change={() => toggleAmenity('services', amenity)}
                  class="amenity-checkbox"
                />
                <span class="amenity-label">{amenity}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Unique Features -->
    <div class="dropdown-container">
      <button
        on:click={() => toggleDropdown('unique')}
        class="filter-button {filters.unique.length > 0 ? 'active' : ''}"
      >
        <span>{amenityCategories.unique.label}</span>
        {#if filters.unique.length > 0}
          <span class="filter-count">({filters.unique.length})</span>
        {/if}
        <ChevronDown class="chevron" />
      </button>
      
      {#if openDropdown === 'unique'}
        <div class="dropdown-menu amenity-dropdown">
          <div class="amenity-grid">
            {#each amenityCategories.unique.options as amenity}
              <label class="amenity-option">
                <input
                  type="checkbox"
                  checked={filters.unique.includes(amenity)}
                  on:change={() => toggleAmenity('unique', amenity)}
                  class="amenity-checkbox"
                />
                <span class="amenity-label">{amenity}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <div class="divider"></div>
    
    <!-- Sort Dropdown -->
    <select 
      bind:value={sortBy}
      on:change={handleSortChange}
      class="sort-select"
    >
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="size">Size: Largest First</option>
      <option value="rating">Hotel Rating</option>
    </select>
    
    <!-- Clear All -->
    {#if activeFilterCount > 0}
      <button
        on:click={clearFilters}
        class="clear-button"
      >
        Clear all
      </button>
    {/if}
  </div>
</div>

<style>
  .filter-bar {
    background: white;
    padding: 0.75rem 0;
    position: relative;
    overflow: visible;
  }
  
  .filter-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    overflow-x: auto;
    overflow-y: visible;
    padding: 0 1rem;
    position: relative;
  }
  
  .search-container {
    position: relative;
    min-width: 12rem;
  }
  
  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1rem;
    height: 1rem;
    color: #9ca3af;
  }
  
  .search-input {
    padding-left: 2.25rem;
    padding-right: 0.75rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    background: #f3f4f6;
    border-radius: 9999px;
    font-size: 0.875rem;
    width: 12rem;
    border: none;
    outline: none;
    transition: all 0.2s;
  }
  
  .search-input:hover {
    background: #e5e7eb;
  }
  
  .search-input:focus {
    background: white;
    box-shadow: 0 0 0 2px #3b82f6;
  }
  
  .divider {
    height: 2rem;
    width: 1px;
    background: #d1d5db;
  }
  
  .dropdown-container {
    position: relative;
  }
  
  .filter-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border-radius: 9999px;
    font-size: 0.875rem;
    white-space: nowrap;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }
  
  .filter-button:hover {
    background: #e5e7eb;
  }
  
  .filter-button.active {
    background: #3b82f6;
    color: white;
  }
  
  .filter-button.active:hover {
    background: #2563eb;
  }
  
  .filter-value, .filter-count {
    font-size: 0.75rem;
  }
  
  .chevron {
    width: 0.75rem;
    height: 0.75rem;
    margin-left: 0.25rem;
  }
  
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e5e7eb;
    z-index: 9999;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .price-dropdown {
    padding: 1rem;
    min-width: 15rem;
  }
  
  .price-inputs {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .price-inputs label {
    font-size: 0.75rem;
    color: #6b7280;
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .price-input {
    width: 100%;
    padding: 0.375rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }
  
  .guests-dropdown {
    padding: 0.5rem;
    min-width: 10rem;
  }
  
  .guest-option {
    width: 100%;
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .guest-option:hover {
    background: #f3f4f6;
  }
  
  .guest-option.selected {
    background: #f3f4f6;
    font-weight: 600;
  }
  
  .amenity-dropdown {
    padding: 0.75rem;
    min-width: 20rem;
  }
  
  .services-dropdown {
    min-width: 22rem;
  }
  
  .amenity-grid {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .amenity-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .amenity-option:hover {
    background: #f9fafb;
  }
  
  .amenity-checkbox {
    border-radius: 0.25rem;
    accent-color: #3b82f6;
  }
  
  .amenity-label {
    font-size: 0.875rem;
  }
  
  .sort-select {
    padding: 0.5rem 0.75rem;
    background: #f3f4f6;
    border-radius: 9999px;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    outline: none;
    transition: background 0.2s;
  }
  
  .sort-select:hover {
    background: #e5e7eb;
  }
  
  .clear-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #4b5563;
    text-decoration: underline;
    white-space: nowrap;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .clear-button:hover {
    color: #dc2626;
  }
</style>