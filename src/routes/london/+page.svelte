<script lang="ts">
  import { MapPin, Filter, Eye, EyeOff, Home, Maximize, Bath, Bed, ArrowUpDown, Settings, Heart } from 'lucide-svelte';
  import PropertyCard from '$lib/components/PropertyCard.svelte';
  import neighborhoodContent from '$lib/content/neighborhood-content.json';
  
  // Mock data for demonstration - replace with real data later
  const properties = [
    {
      id: 1,
      address: 'South Audley Street, Mayfair, London',
      propertyType: 'Flat',
      price: '£13,750,000',
      bedrooms: 3,
      bathrooms: 4,
      sqft: 2910,
      image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop'
    },
    {
      id: 2,
      address: 'Mayfair Park Residence, Mayfair, London',
      propertyType: 'Flat',
      price: '£13,200,000',
      bedrooms: 3,
      bathrooms: 4,
      sqft: 2262,
      image: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=800&h=600&fit=crop'
    },
    {
      id: 3,
      address: 'Mount Row, Mayfair, London',
      propertyType: 'House',
      price: '£12,950,000',
      bedrooms: 3,
      bathrooms: 3,
      sqft: 3121,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
    },
    {
      id: 4,
      address: 'Hill Street, Mayfair, London',
      propertyType: 'Flat',
      price: '£8,500,000',
      bedrooms: 2,
      bathrooms: 3,
      sqft: 1875,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
    },
    {
      id: 5,
      address: 'Berkeley Square, Mayfair, London',
      propertyType: 'Flat',
      price: '£15,250,000',
      bedrooms: 4,
      bathrooms: 4,
      sqft: 3450,
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop'
    },
    {
      id: 6,
      address: 'Grosvenor Square, Mayfair, London',
      propertyType: 'House',
      price: '£22,000,000',
      bedrooms: 5,
      bathrooms: 5,
      sqft: 4200,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
    }
  ];

  const neighborhoods = [
    'All Areas', 'Mayfair', 'Chelsea', 'Kensington', 'Hampstead', 'Belgravia', 'Notting Hill'
  ];

  const popularNeighborhoods = [
    { name: 'Knightsbridge', slug: 'knightsbridge' },
    { name: 'Chelsea', slug: 'chelsea' },
    { name: 'Mayfair', slug: 'mayfair' },
    { name: 'Kensington', slug: 'kensington' },
    { name: 'Belgravia', slug: 'belgravia' },
    { name: 'Islington', slug: 'islington' },
    { name: 'Hampstead', slug: 'hampstead' },
    { name: 'Notting Hill', slug: 'notting-hill' },
    { name: 'Clapham', slug: 'clapham' },
    { name: 'Shoreditch', slug: 'shoreditch' }
  ];

  let selectedNeighborhood = 'All Areas';
  let activeFilters = 0;
  let showFilters = false;
  let showSort = false;
  let sortBy = 'newest';

  // Update active filters count when neighborhood changes
  $: activeFilters = selectedNeighborhood !== 'All Areas' ? 1 : 0;

  function handlePropertyClick(property: any) {
    // Navigate to signup page with property context
    const params = new URLSearchParams({
      propertyId: property.id.toString(),
      address: property.address,
      price: property.price,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      sqft: property.sqft.toString(),
      image: property.image
    });
    window.location.href = `/signup?${params.toString()}`;
  }
</script>

<svelte:head>
  <title>Off Market Properties London |  Houses and Flats for Sale</title>
  <meta name="description" content="Discover exclusive off market homes in London. Browse luxury homes for sale in Mayfair, Chelsea, Kensington, Hampstead and other prestigious areas." />
  <meta name="keywords" content="off market london, luxury properties london, london property investment, mayfair properties, chelsea properties, hampstead properties" />
</svelte:head>

<!-- Header Section -->
<section class="bg-gradient-to-r from-luxury-charcoal to-luxury-black text-white py-8">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="luxury-heading text-3xl lg:text-4xl mb-3 text-white">
        Off Market Properties in London
      </h1>
      <p class="max-w-2xl mx-auto text-lg text-gray-300 mb-4">
        Discover exclusive houses in London's most sought-after neighborhoods
      </p>
      <div class="flex items-center justify-center text-luxury-blue">
        <MapPin class="h-5 w-5 mr-2" />
        <span class="font-medium">London, United Kingdom</span>
      </div>
    </div>
  </div>
</section>

<!-- Popular Neighborhoods Section -->
<section class="bg-white py-6 border-b border-gray-200">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-4">
      <h2 class="text-lg font-medium text-gray-900 mb-3 text-center">Popular Neighborhoods</h2>
      
      <!-- Mobile: Horizontal scroll -->
      <div class="md:hidden">
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {#each popularNeighborhoods as neighborhood}
            <a 
              href="/london/{neighborhood.slug}" 
              class="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-luxury-blue hover:text-white text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {neighborhood.name}
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Desktop: Wrapped grid -->
      <div class="hidden md:flex md:flex-wrap md:justify-center gap-2">
        {#each popularNeighborhoods as neighborhood}
          <a 
            href="/london/{neighborhood.slug}" 
            class="px-3 py-2 bg-gray-100 hover:bg-luxury-blue hover:text-white text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
          >
            {neighborhood.name}
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- Filters and Sort Section -->
<section class="bg-white py-6">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Filter and Sort Buttons -->
    <div class="flex items-center gap-3 mb-3">
      <!-- Filters Button -->
      <button 
        class="flex items-center gap-3 px-6 py-3 border-2 border-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors font-medium text-base"
        on:click={() => showFilters = !showFilters}
      >
        <Settings class="h-5 w-5" />
        <span>Filters</span>
        {#if activeFilters > 0}
          <span class="bg-gray-900 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
            {activeFilters}
          </span>
        {/if}
      </button>
      
      <!-- Sort Button -->
      <button 
        class="flex items-center gap-3 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-base"
        on:click={() => showSort = !showSort}
      >
        <ArrowUpDown class="h-5 w-5" />
        <span>Sort</span>
      </button>
    </div>
    
    <!-- Results Count -->
    <div class="text-sm text-gray-600 mb-6">
      Showing <span class="font-medium">{properties.length}</span> off-market properties
    </div>
    
    <!-- Filters Dropdown -->
    {#if showFilters}
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Area Filter -->
          <div>
            <label for="area-select" class="block text-sm font-medium text-gray-700 mb-2">Area</label>
            <select 
              id="area-select" 
              bind:value={selectedNeighborhood}
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
            >
              {#each neighborhoods as neighborhood}
                <option value={neighborhood}>{neighborhood}</option>
              {/each}
            </select>
          </div>
          
          <!-- Property Type Filter -->
          <div>
            <label for="property-type-select" class="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select id="property-type-select" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue">
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="penthouse">Penthouse</option>
              <option value="mews">Mews House</option>
            </select>
          </div>
          
          <!-- Price Range Filter -->
          <div>
            <label for="price-range-select" class="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <select id="price-range-select" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue">
              <option value="">Any Price</option>
              <option value="0-500000">Under £500k</option>
              <option value="500000-1000000">£500k - £1M</option>
              <option value="1000000-2000000">£1M - £2M</option>
              <option value="2000000-">£2M+</option>
            </select>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Sort Dropdown -->
    {#if showSort}
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button 
            class="px-3 py-2 text-left rounded {sortBy === 'newest' ? 'bg-luxury-blue text-white' : 'hover:bg-gray-200'}"
            on:click={() => { sortBy = 'newest'; showSort = false; }}
          >
            Newest First
          </button>
          <button 
            class="px-3 py-2 text-left rounded {sortBy === 'price-low' ? 'bg-luxury-blue text-white' : 'hover:bg-gray-200'}"
            on:click={() => { sortBy = 'price-low'; showSort = false; }}
          >
            Price: Low to High
          </button>
          <button 
            class="px-3 py-2 text-left rounded {sortBy === 'price-high' ? 'bg-luxury-blue text-white' : 'hover:bg-gray-200'}"
            on:click={() => { sortBy = 'price-high'; showSort = false; }}
          >
            Price: High to Low
          </button>
          <button 
            class="px-3 py-2 text-left rounded {sortBy === 'size' ? 'bg-luxury-blue text-white' : 'hover:bg-gray-200'}"
            on:click={() => { sortBy = 'size'; showSort = false; }}
          >
            Size
          </button>
        </div>
      </div>
    {/if}
  </div>
</section>

<!-- Properties Grid -->
<section class="py-16 bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each properties as property}
        <PropertyCard {property} onClick={handlePropertyClick} />
      {/each}
    </div>
  </div>
</section>


<!-- SEO Content Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="prose prose-lg max-w-none">
      {#each neighborhoodContent.london.content as section}
        <div class="mb-8">
          <h2 class="luxury-heading text-2xl mb-4">{section.heading}</h2>
          <p class="luxury-text text-lg leading-relaxed">{section.text}</p>
        </div>
      {/each}
      
      <!-- Features Section -->
      <div class="mt-12 mb-8">
        <h2 class="luxury-heading text-2xl mb-6">What We Offer</h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each neighborhoodContent.london.features as feature}
            <li class="flex items-start">
              <span class="text-luxury-blue mr-3 mt-1">•</span>
              <span class="luxury-text">{feature}</span>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Stats Section -->
      <div class="mt-12 border-t border-gray-200 pt-8">
        <h2 class="luxury-heading text-2xl mb-6">London Property Market Overview</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{neighborhoodContent.london.stats.averagePrice}</div>
            <div class="text-sm text-gray-600">Average Price</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{neighborhoodContent.london.stats.priceRange}</div>
            <div class="text-sm text-gray-600">Price Range</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{neighborhoodContent.london.stats.neighborhoods}</div>
            <div class="text-sm text-gray-600">Coverage</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{neighborhoodContent.london.stats.properties}</div>
            <div class="text-sm text-gray-600">Available</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section> 