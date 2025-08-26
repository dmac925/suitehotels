<script lang="ts">
  import { MapPin } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import PropertyCard from '$lib/components/PropertyCard.svelte';
  import FilterBarV2 from '$lib/components/FilterBarV2.svelte';
  import neighborhoodContent from '$lib/content/neighborhood-content.json';
  import { AuthService } from '$lib/auth';
  import { getPriceRange } from '$lib/utils/priceRange';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
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
    { name: 'Shoreditch', slug: 'shoreditch' },
    { name: 'Battersea', slug: 'battersea' },
    { name: 'Fulham', slug: 'fulham' },
    { name: 'Wimbledon', slug: 'wimbledon' },
    { name: 'Richmond', slug: 'richmond' },
    { name: 'Putney', slug: 'putney' },
    { name: 'St John\'s Wood', slug: 'st-johns-wood' },
    { name: 'Marylebone', slug: 'marylebone' },
  ];

  let selectedNeighborhood = 'All Areas';
  let activeFilters = 0;
  let sortBy = 'newest';
  let filteredProperties: any[] = [];
  let filters = {
    neighborhood: 'All Areas',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    sqftMin: '',
    sqftMax: ''
  };
  
  // Track if we're programmatically updating the URL to avoid circular updates
  let updatingUrl = false;
  
  // Initialize filters and sort from URL on mount
  $: {
    if (!updatingUrl) {
      const params = $page.url.searchParams;
      const urlFilters = {
        neighborhood: params.get('area') || 'All Areas',
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
        filters = { ...urlFilters }; // Create new object to ensure reactivity
        selectedNeighborhood = urlFilters.neighborhood;
      }
      if (urlSort !== sortBy) {
        sortBy = urlSort;
      }
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

  // Function to filter properties
  function filterProperties(properties: any[], filters: any, sortBy: string) {
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
    
    return filtered;
  }
  
  // Apply all filters to properties - explicitly recalculate when dependencies change
  $: filteredProperties = filterProperties(properties, filters, sortBy);
  
  // Calculate pagination - explicitly depend on filteredProperties and itemsPerPage
  $: totalPages = (() => {
    const count = filteredProperties?.length || 0;
    const pages = Math.ceil(count / itemsPerPage) || 1;
    console.log('📊 Pagination calculation:', {
      filteredCount: count,
      itemsPerPage,
      totalPages: pages,
      filters: JSON.stringify(filters)
    });
    return pages;
  })();
  
  // Reset to page 1 when filters change (but not on initial load)
  let previousFilters = JSON.stringify(filters);
  $: {
    const currentFiltersString = JSON.stringify(filters);
    if (previousFilters !== currentFiltersString && previousFilters !== '{}') {
      currentPage = 1;
      previousFilters = currentFiltersString;
    }
  }
  
  // Get current page items - depend on filteredProperties, currentPage, and itemsPerPage
  $: paginatedProperties = filteredProperties && filteredProperties.length
    ? filteredProperties.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];
  
  // Calculate page numbers reactively based on totalPages
  $: pageNumbers = (() => {
    console.log('📄 Calculating page numbers for totalPages:', totalPages);
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
  })();
  
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
      propertyType: property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) || 'Property',
      price: property.price_display,
      priceRange: getPriceRange(property.price_display || property.price || 0),
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      sqft: property.sqft || 0,
      image: getPropertyImage(property)
    };
  }

  function handlePropertyClick(clickedProperty: any) {
    // Navigate directly to property page with the clicked property's slug
    window.location.href = `/property/${clickedProperty.slug}`;
  }
  
  function updateUrlParams() {
    updatingUrl = true;
    const url = new URL($page.url);
    
    // Clear all filter params first
    url.searchParams.delete('area');
    url.searchParams.delete('type');
    url.searchParams.delete('minPrice');
    url.searchParams.delete('maxPrice');
    url.searchParams.delete('beds');
    url.searchParams.delete('baths');
    url.searchParams.delete('minSqft');
    url.searchParams.delete('maxSqft');
    url.searchParams.delete('sort');
    
    // Add non-default filter values
    if (filters.neighborhood !== 'All Areas') url.searchParams.set('area', filters.neighborhood);
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
    
    goto(url.toString(), { replaceState: true, keepFocus: true }).then(() => {
      updatingUrl = false;
    });
  }
  
  function handleFilterChange(event: CustomEvent) {
    console.log('🔄 Filter change event received:', event.detail);
    const oldFilters = { ...filters };
    filters = { ...event.detail }; // Create a new object to ensure reactivity
    selectedNeighborhood = filters.neighborhood;
    currentPage = 1; // Reset to first page when filters change
    
    // Force recalculation of filtered properties
    const newFiltered = filterProperties(properties, filters, sortBy);
    console.log('🔍 Filter change results:', {
      oldFilters,
      newFilters: filters,
      oldCount: filteredProperties?.length,
      newCount: newFiltered.length,
      expectedPages: Math.ceil(newFiltered.length / itemsPerPage)
    });
    
    updateUrlParams();
  }
  
  function handleSortChange(event: CustomEvent) {
    sortBy = event.detail;
    updateUrlParams();
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

<!-- Filter Bar -->
<FilterBarV2 
  bind:activeFilters
  bind:selectedNeighborhood
  bind:sortBy
  properties={properties}
  resultCount={`${Math.min((currentPage - 1) * itemsPerPage + 1, filteredProperties.length)}-${Math.min(currentPage * itemsPerPage, filteredProperties.length)} of ${filteredProperties.length}`}
  on:filterChange={handleFilterChange}
  on:sortChange={handleSortChange}
/>

<!-- Properties Grid -->
<section class="py-16 bg-gray-50 properties-grid">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {#if serverError}
      <div class="text-center py-12">
        <p class="text-red-600 mb-4">{serverError}</p>
        <a 
          href="/london"
          class="bg-luxury-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </a>
      </div>
    {:else if filteredProperties.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 mb-4">No properties found {selectedNeighborhood !== 'All Areas' ? `in ${selectedNeighborhood}` : ''}</p>
        {#if selectedNeighborhood !== 'All Areas'}
          <button 
            on:click={() => selectedNeighborhood = 'All Areas'}
            class="bg-luxury-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Areas
          </button>
        {/if}
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each paginatedProperties as property}
          <PropertyCard 
            property={transformProperty(property)} 
            onClick={handlePropertyClick}
            isAuthenticated={isAuthenticated}
          />
        {/each}
      </div>
      
      <!-- Pagination Controls -->
      <!-- Debug: totalPages = {totalPages}, filteredProperties.length = {filteredProperties.length} -->
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
            {#each pageNumbers as page}
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