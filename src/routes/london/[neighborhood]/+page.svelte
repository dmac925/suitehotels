<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { MapPin, TrendingUp, Home, Users } from 'lucide-svelte';
  import PropertyCard from '$lib/components/PropertyCard.svelte';
  import FilterBarV2 from '$lib/components/FilterBarV2.svelte';
  import neighborhoodContent from '$lib/content/neighborhood-content.json';
  import { AuthService } from '$lib/auth';
  import { getPriceRange } from '$lib/utils/priceRange';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  // Get neighborhood from URL parameter
  $: neighborhood = $page.params.neighborhood;
  $: formattedNeighborhood = neighborhood?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  
  // Get content for current neighborhood
  $: currentContent = neighborhood && (neighborhoodContent as any)[neighborhood] ? (neighborhoodContent as any)[neighborhood] : null;
  
  // Properties data from server-side loading
  $: properties = data.properties || [];
  $: serverError = data.error;
  
  // Authentication state
  let isAuthenticated = false;
  let isLoadingAuth = true;
  
  onMount(async () => {
    try {
      const { user } = await AuthService.getCurrentUser();
      isAuthenticated = !!(user && user.email_confirmed_at);
    } catch (error) {
      console.error('Auth check error:', error);
      isAuthenticated = false;
    } finally {
      isLoadingAuth = false;
    }
  });
  
  // Filter and sort state
  let activeFilters = 0;
  let sortBy = 'newest';
  let filteredProperties: any[] = [];
  let filters = {
    neighborhood: '',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    sqftMin: '',
    sqftMax: ''
  };
  
  // Initialize filters and sort from URL on mount
  $: {
    const params = $page.url.searchParams;
    const urlFilters = {
      neighborhood: '', // Keep empty for neighborhood page
      propertyType: params.get('type') || '',
      priceMin: params.get('minPrice') || '',
      priceMax: params.get('maxPrice') || '',
      bedrooms: params.get('beds') || '',
      bathrooms: params.get('baths') || '',
      sqftMin: params.get('minSqft') || '',
      sqftMax: params.get('maxSqft') || ''
    };
    
    const urlSort = params.get('sort') || 'newest';
    
    // Only update if different to avoid infinite loops
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
      filters = urlFilters;
    }
    if (urlSort !== sortBy) {
      sortBy = urlSort;
    }
  }
  
  // Pagination state - initialize from URL params
  let currentPage = 1;
  const itemsPerPage = 12;
  let paginatedProperties: any[] = [];
  let totalPages = 1;
  
  // Initialize current page from URL on mount
  $: {
    const urlPage = parseInt($page.url.searchParams.get('page') || '1');
    if (urlPage > 0 && urlPage !== currentPage) {
      currentPage = urlPage;
    }
  }
  
  // Popular neighborhoods for navigation
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
  
  // Mock neighborhood data for default stats
  const neighborhoodData = {
    'mayfair': {
      name: 'Mayfair',
      description: 'The epitome of London luxury, Mayfair offers unparalleled sophistication with its Georgian architecture, world-class shopping, and proximity to Hyde Park.',
      avgPrice: '£4.2M',
      highlights: ['Bond Street Shopping', 'Michelin Star Restaurants', 'Private Members Clubs', 'Hyde Park Access']
    },
    'chelsea': {
      name: 'Chelsea',
      description: 'Known for its trendy boutiques, renowned restaurants, and beautiful garden squares, Chelsea combines village charm with urban sophistication.',
      avgPrice: '£3.8M',
      highlights: ['Kings Road Shopping', 'Chelsea Flower Show', 'River Thames Views', 'Victorian Architecture']
    },
    'hampstead': {
      name: 'Hampstead',
      description: 'This historic village offers a unique blend of intellectual heritage, stunning parkland, and some of London\'s most characterful properties.',
      avgPrice: '£3.2M',
      highlights: ['Hampstead Heath', 'Village Atmosphere', 'Historic Pubs', 'Intellectual Heritage']
    },
    'marylebone': {
      name: 'Marylebone',
      description: 'Marylebone is a vibrant and cosmopolitan area known for its mix of historic architecture, modern amenities, and a thriving community.',
      avgPrice: '£3.5M',
      highlights: ['Marylebone High Street', 'Regent\'s Park', 'Prime Location', 'Historic Architecture']
    },
    'st-johns-wood': {
      name: 'St John\'s Wood',
      description: 'St John\'s Wood is a charming and affluent area known for its beautiful tree-lined streets, elegant properties, and proximity to Regent\'s Park.',
      avgPrice: '£3.7M',
      highlights: ['Regent\'s Park', 'Prime Location', 'Historic Architecture', 'Excellent Schools']
    },
  };
  
  $: currentData = (neighborhood && neighborhoodData[neighborhood as keyof typeof neighborhoodData]) || {
    name: formattedNeighborhood,
    description: `Discover exclusive off-market properties in ${formattedNeighborhood}, one of London's most prestigious areas.`,
    avgPrice: '£3.5M',
    highlights: ['Prime Location', 'Luxury Properties', 'Excellent Transport', 'Premium Amenities']
  };

  // Add property count from real data
  $: currentDataWithCount = {
    ...currentData,
    properties: properties.length
  };
  
  // Apply filters to properties
  $: {
    let filtered = [...properties];
    
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
    
    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'size') {
      filtered.sort((a, b) => (b.sqft || 0) - (a.sqft || 0));
    } else if (sortBy === 'bedrooms') {
      filtered.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
    }
    // 'newest' is default order from database
    
    filteredProperties = filtered;
  }
  
  // Calculate pagination based on filtered properties
  $: totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  
  // Reset to page 1 when filters or neighborhood changes
  $: if (filters || neighborhood) {
    currentPage = 1;
  }
  
  // Get current page items from filtered properties
  $: {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedProperties = filteredProperties.slice(startIndex, endIndex);
  }
  
  // Pagination handlers
  function goToPage(pageNum: number) {
    if (pageNum >= 1 && pageNum <= totalPages) {
      currentPage = pageNum;
      
      // Update URL with page parameter
      const url = new URL($page.url);
      if (pageNum === 1) {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', pageNum.toString());
      }
      goto(url.toString(), { replaceState: false, keepFocus: true });
      
      // Scroll to top of properties section
      document.querySelector('.properties-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }

  // Function to parse and get the first image URL from the property images JSON
  function getPropertyImage(property: any): string {
    // If images is already an array (might happen if Supabase returns it parsed)
    if (Array.isArray(property.images) && property.images.length > 0) {
      const firstImage = property.images[0];
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url;
      }
      if (typeof firstImage === 'string') {
        return firstImage;
      }
    }
    
    // If images is a JSON string, parse it
    if (property.images && typeof property.images === 'string') {
      try {
        const parsedImages = JSON.parse(property.images);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          const firstImage = parsedImages[0];
          if (typeof firstImage === 'object' && firstImage.url) {
            return firstImage.url;
          }
          if (typeof firstImage === 'string') {
            return firstImage;
          }
        }
      } catch (e) {
        console.warn('Error parsing property images:', e, property.images);
      }
    }
    
    // Fallback to placeholder
    return 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop';
  }

  // Transform Supabase property data to match PropertyCard expected format
  function transformProperty(property: any) {
    // Build address fallback if no address provided
    let displayAddress = property.address;
    if (!displayAddress && property.neighborhood && property.city && property.postcode) {
      const postcodePrefix = property.postcode.split(' ')[0]; // Get first part of postcode
      displayAddress = `${property.neighborhood}, ${property.city}, ${postcodePrefix}`;
    }
    
    return {
      id: property.id, // Keep for any other uses
      slug: property.slug, // Add slug for navigation
      address: displayAddress || 'London',
      location: `${property.neighborhood || formattedNeighborhood}, London`,
      propertyType: property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) || 'Property',
      price: property.price_display,
      priceRange: getPriceRange(property.price_display || property.price || 0),
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      sqft: property.sqft || 0,
      saleType: 'Sale',
      image: getPropertyImage(property)
    };
  }

  function handlePropertyClick(property: any) {
    // Navigate directly to property page with the clicked property's slug
    window.location.href = `/property/${property.slug}`;
  }
  
  function updateUrlParams() {
    const url = new URL($page.url);
    
    // Clear all filter params first
    url.searchParams.delete('type');
    url.searchParams.delete('minPrice');
    url.searchParams.delete('maxPrice');
    url.searchParams.delete('beds');
    url.searchParams.delete('baths');
    url.searchParams.delete('minSqft');
    url.searchParams.delete('maxSqft');
    url.searchParams.delete('sort');
    
    // Add non-default filter values
    if (filters.propertyType) url.searchParams.set('type', filters.propertyType);
    if (filters.priceMin) url.searchParams.set('minPrice', filters.priceMin);
    if (filters.priceMax) url.searchParams.set('maxPrice', filters.priceMax);
    if (filters.bedrooms) url.searchParams.set('beds', filters.bedrooms);
    if (filters.bathrooms) url.searchParams.set('baths', filters.bathrooms);
    if (filters.sqftMin) url.searchParams.set('minSqft', filters.sqftMin);
    if (filters.sqftMax) url.searchParams.set('maxSqft', filters.sqftMax);
    if (sortBy !== 'newest') url.searchParams.set('sort', sortBy);
    
    // Keep page param if it exists and is not 1
    const currentPageParam = $page.url.searchParams.get('page');
    if (currentPageParam && currentPageParam !== '1') {
      url.searchParams.set('page', currentPageParam);
    }
    
    goto(url.toString(), { replaceState: true, keepFocus: true });
  }
  
  function handleFilterChange(event: CustomEvent) {
    filters = { ...event.detail, neighborhood: '' }; // Keep neighborhood empty for this page
    currentPage = 1; // Reset to first page when filters change
    updateUrlParams();
  }
  
  function handleSortChange(event: CustomEvent) {
    sortBy = event.detail;
    updateUrlParams();
  }
</script>

<svelte:head>
  <title>Houses for sale in {currentData.name} | Off Market Properties</title>  
  <meta name="description" content="Houses for sale in {currentData.name}, London. Browse {currentData.name} properties for sale, exclusive off market {currentData.name} houses and flats." />
  <meta name="keywords" content="property for sale {currentData.name}, {currentData.name} houses for sale, off market {currentData.name}, {currentData.name} properties for sale, {currentData.name} homes for sale, {currentData.name} property, {currentData.name} real estate, luxury properties {currentData.name}, {currentData.name} apartments for sale, {currentData.name} flats for sale" />
</svelte:head>

<!-- Header Section -->
<section class="bg-gradient-to-r from-luxury-charcoal to-luxury-black text-white py-8">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="luxury-heading text-3xl lg:text-4xl mb-3 text-white">
        Houses for Sale in {currentData.name} - Off Market Properties
      </h1>
      <p class="max-w-2xl mx-auto text-lg text-gray-300 mb-4">
        Discover exclusive properties for sale in {currentData.name}. Browse {currentData.name} houses for sale, luxury homes, and off market properties in this prestigious London neighbourhood.
      </p>
      <div class="flex items-center justify-center text-luxury-blue">
        <MapPin class="h-5 w-5 mr-2" />
        <span class="font-medium">{currentData.name}, London</span>
      </div>
    </div>
  </div>
</section>

<!-- Popular Neighborhoods Section -->
<section class="bg-white py-6 border-b border-gray-200">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-4">
      <h2 class="text-lg font-medium text-gray-900 mb-3 text-center">Other London Neighborhoods</h2>
      
      <!-- Mobile: Horizontal scroll -->
      <div class="md:hidden">
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <a 
            href="/london" 
            class="flex-shrink-0 px-4 py-2 bg-luxury-blue text-white rounded-md text-sm font-medium transition-colors duration-200"
          >
            All Areas
          </a>
          {#each popularNeighborhoods as neighb}
            <a 
              href="/london/{neighb.slug}" 
              class="flex-shrink-0 px-4 py-2 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
              class:bg-luxury-lightblue={neighb.slug === neighborhood}
              class:text-luxury-blue={neighb.slug === neighborhood}
              class:bg-gray-100={neighb.slug !== neighborhood}
              class:hover:bg-luxury-blue={neighb.slug !== neighborhood}
              class:hover:text-white={neighb.slug !== neighborhood}
            >
              {neighb.name}
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Desktop: Wrapped grid -->
      <div class="hidden md:flex md:flex-wrap md:justify-center gap-2">
        <a 
          href="/london" 
          class="px-3 py-2 bg-luxury-blue text-white rounded-md text-sm font-medium transition-colors duration-200"
        >
          All Areas
        </a>
        {#each popularNeighborhoods as neighb}
          <a 
            href="/london/{neighb.slug}" 
            class="px-3 py-2 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
            class:bg-luxury-lightblue={neighb.slug === neighborhood}
            class:text-luxury-blue={neighb.slug === neighborhood}
            class:bg-gray-100={neighb.slug !== neighborhood}
            class:hover:bg-luxury-blue={neighb.slug !== neighborhood}
            class:hover:text-white={neighb.slug !== neighborhood}
          >
            {neighb.name}
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- Filter Bar -->
<FilterBarV2 
  bind:activeFilters
  selectedNeighborhood={formattedNeighborhood}
  bind:sortBy
  properties={properties}
  hideNeighborhoodFilter={true}
  resultCount={`${Math.min((currentPage - 1) * itemsPerPage + 1, filteredProperties.length)}-${Math.min(currentPage * itemsPerPage, filteredProperties.length)} of ${filteredProperties.length}`}
  on:filterChange={handleFilterChange}
  on:sortChange={handleSortChange}
/>

<!-- Featured Properties Section -->
<section class="py-16 bg-gray-50 properties-grid">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="luxury-heading text-3xl mb-4">
        Featured {currentDataWithCount.name} Properties for Sale
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Discover our exclusive collection of luxury properties currently available in {currentDataWithCount.name}
      </p>
    </div>
    
    {#if serverError}
      <div class="text-center py-12">
        <p class="text-red-600 mb-4">{serverError}</p>
        <a 
          href="/london/{neighborhood}"
          class="bg-luxury-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </a>
      </div>
    {:else if properties.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 mb-4">No properties found in {currentDataWithCount.name}</p>
        <a 
          href="/london"
          class="bg-luxury-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View All London Properties
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each paginatedProperties as property}
          <PropertyCard 
            property={transformProperty(property)}
            location={transformProperty(property).location}
            saleType={transformProperty(property).saleType}
            onClick={handlePropertyClick}
            isAuthenticated={isAuthenticated}
          />
        {/each}
      </div>
      
      <!-- Pagination Controls -->
      {#if totalPages > 1}
        <div class="mt-12 flex justify-center">
          <nav class="flex items-center space-x-2">
            <!-- Previous Button -->
            <button
              on:click={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors
                     {currentPage === 1 
                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                       : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}"
            >
              Previous
            </button>
            
            <!-- Page Numbers -->
            {#each getPageNumbers() as page}
              {#if page === '...'}
                <span class="px-3 py-2 text-gray-500">...</span>
              {:else}
                <button
                  on:click={() => goToPage(page as number)}
                  class="px-3 py-2 text-sm font-medium rounded-md transition-colors
                         {currentPage === page 
                           ? 'bg-luxury-blue text-white' 
                           : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}"
                >
                  {page}
                </button>
              {/if}
            {/each}
            
            <!-- Next Button -->
            <button
              on:click={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              class="px-3 py-2 text-sm font-medium rounded-md transition-colors
                     {currentPage === totalPages 
                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                       : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}"
            >
              Next
            </button>
          </nav>
        </div>
      {/if}
    {/if}
    
    <!-- View More Button -->
    {#if properties.length > 0}
      <div class="text-center mt-12">
        <a href="/london" class="bg-luxury-blue text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
          View All London Properties
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Stats Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-lightblue rounded-full mb-4">
          <Home class="h-8 w-8 text-luxury-blue" />
        </div>
        <div class="luxury-heading text-2xl mb-1">{currentDataWithCount.properties}</div>
        <div class="text-sm text-gray-600">{currentDataWithCount.name} Properties for Sale</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-lightblue rounded-full mb-4">
          <TrendingUp class="h-8 w-8 text-luxury-blue" />
        </div>
        <div class="luxury-heading text-2xl mb-1">{currentDataWithCount.avgPrice}</div>
        <div class="text-sm text-gray-600">Average Price</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-lightblue rounded-full mb-4">
          <Users class="h-8 w-8 text-luxury-blue" />
        </div>
        <div class="luxury-heading text-2xl mb-1">48hrs</div>
        <div class="text-sm text-gray-600">Average Response</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-lightblue rounded-full mb-4">
          <MapPin class="h-8 w-8 text-luxury-blue" />
        </div>
        <div class="luxury-heading text-2xl mb-1">Zone 1</div>
        <div class="text-sm text-gray-600">Prime Location</div>
      </div>
    </div>
  </div>
</section>

<!-- Highlights Section -->
<section class="py-16 bg-luxury-pearl">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <h2 class="luxury-heading text-3xl text-center mb-12">
      Why Buy Properties in {currentDataWithCount.name}?
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each currentDataWithCount.highlights as highlight}
        <div class="luxury-card rounded-lg p-6 text-center">
          <h3 class="luxury-heading text-lg mb-2">{highlight}</h3>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- SEO Content Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="prose max-w-none">
      <h2 class="luxury-heading text-2xl mb-6">
        {currentDataWithCount.name} Properties for Sale - Your Complete Guide
      </h2>
      <div class="text-gray-700 space-y-4">
        <p>
          Looking for <strong>property for sale in {currentDataWithCount.name}</strong>? Our exclusive portfolio of <strong>{currentDataWithCount.name} houses for sale</strong> and <strong>{currentDataWithCount.name} homes for sale</strong> offers the finest selection of luxury properties in this prestigious London neighbourhood.
        </p>
        <p>
          We specialise in <strong>off market {currentDataWithCount.name}</strong> properties, giving you access to exclusive <strong>{currentDataWithCount.name} properties for sale</strong> before they reach the public market. Whether you're searching for {currentDataWithCount.name} apartments, townhouses, or luxury family homes, our curated collection represents the best of {currentDataWithCount.name} real estate.
        </p>
        <p>
          Our <strong>{currentDataWithCount.name} property</strong> portfolio includes both period properties and contemporary developments, each carefully selected for their exceptional quality, prime location, and investment potential. From charming {currentDataWithCount.name} mews houses to grand {currentDataWithCount.name} mansions, we have properties to suit every discerning buyer.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- SEO Content Section -->
{#if currentContent}
<section class="py-16 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="prose prose-lg max-w-none">
      {#each currentContent.content as section}
        <div class="mb-8">
          <h2 class="luxury-heading text-2xl mb-4">{section.heading}</h2>
          <p class="luxury-text text-lg leading-relaxed">{section.text}</p>
        </div>
      {/each}
      
      <!-- Features Section -->
      <div class="mt-12 mb-8">
        <h2 class="luxury-heading text-2xl mb-6">Why Choose {formattedNeighborhood}?</h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each currentContent.features as feature}
            <li class="flex items-start">
              <span class="text-luxury-blue mr-3 mt-1">•</span>
              <span class="luxury-text">{feature}</span>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Stats Section -->
      <div class="mt-12 border-t border-gray-200 pt-8">
        <h2 class="luxury-heading text-2xl mb-6">{formattedNeighborhood} Property Market</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{currentContent.stats.averagePrice}</div>
            <div class="text-sm text-gray-600">Average Price</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{currentContent.stats.priceRange}</div>
            <div class="text-sm text-gray-600">Price Range</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{currentContent.stats.pricePerSqFt}</div>
            <div class="text-sm text-gray-600">Price per Sq Ft</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{currentContent.stats.rentalYield}</div>
            <div class="text-sm text-gray-600">Rental Yield</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
{/if}

<!-- CTA Section -->
<section class="py-16 bg-luxury-charcoal text-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="luxury-heading text-3xl mb-4 text-white">
      Find Your Perfect {currentDataWithCount.name} Property for Sale
    </h2>
    <p class="text-lg text-gray-300 mb-8">
      Access exclusive {currentDataWithCount.name} houses for sale, {currentDataWithCount.name} homes for sale, and off market {currentDataWithCount.name} properties before they reach the public market. Browse luxury {currentDataWithCount.name} properties for sale from our exclusive portfolio.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/signup" class="bg-luxury-blue text-luxury-black px-10 py-4 rounded-full font-semibold hover:bg-luxury-lightblue transition-colors">
        Get Exclusive Access
      </a>
      <a href="/london" class="border border-white text-white px-10 py-4 rounded-full font-semibold hover:bg-white hover:text-luxury-black transition-colors">
        View All London Areas
      </a>
    </div>
  </div>
</section> 