<script lang="ts">
  import { MapPin, Star, Users, Bed, Check, Grid3x3, Map } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import TwoTierFilters from '$lib/components/TwoTierFilters.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import ImageCarousel from '$lib/components/ImageCarousel.svelte';
  
  export let data: PageData;
  
  // Suites data from server-side loading
  let suites = data.suites || [];
  let cityName = data.city || 'London';
  let serverError = data.error;
  let isPartialLoad = data.isPartialLoad || false;
  let isLoadingMore = false;
  let allDataLoaded = !isPartialLoad;
  
  // Update suites and city when data changes
  $: if (data.suites && data.suites !== suites) {
    suites = data.suites;
  }
  $: if (data.error !== serverError) {
    serverError = data.error;
  }
  $: if (data.city && data.city !== cityName) {
    cityName = data.city;
  }
  


  // Popular cities
  const popularCities = [
    { name: 'London', slug: 'london' },
    { name: 'Paris', slug: 'paris' },
    { name: 'New York', slug: 'new-york' },
    { name: 'Dubai', slug: 'dubai' },
  ];

  // Currency conversion rates (for demo purposes - in production, use live rates)
  const currencyRates = {
    USD: 1,
    GBP: 0.79,
    EUR: 0.92,
    CNY: 7.24
  };

  const currencySymbols = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    CNY: '¥'
  };

  function formatPrice(price: number, currencyCode: string) {
    if (!price) return null;
    
    const rate = currencyRates[currencyCode as keyof typeof currencyRates] || 1;
    const convertedPrice = Math.round(price * rate);
    const symbol = currencySymbols[currencyCode as keyof typeof currencySymbols] || '$';
    
    return {
      amount: convertedPrice,
      symbol,
      formatted: `${symbol}${convertedPrice.toLocaleString()}`
    };
  }

  let sortBy = 'price-low';
  let currency = 'USD';
  let filteredSuites: any[] = []; // This will be populated by reactive statement
  
  // Separate hotel and room filters
  let hotelFilters = {
    hotelSearch: '',
    wellness: [] as string[],
    dining: [] as string[],
    services: [] as string[],
    unique: [] as string[]
  };
  
  let roomFilters = {
    persons: '',
    priceMin: '',
    priceMax: '',
    minSize: ''
  };
  
  let activeFilterCount = 0;
  let viewMode: 'list' | 'map' = 'list';
  
  // Track if component is mounted
  let mounted = false;
  let isUpdatingURL = false;
  let lastURLString = '';
  
  // Function to sync filters from URL
  function syncFromURL() {
    if (isUpdatingURL) return; // Prevent feedback loop
    
    const params = $page.url.searchParams;
    hotelFilters = {
      hotelSearch: params.get('search') || '',
      wellness: params.get('wellness')?.split(',').filter(Boolean) || [],
      dining: params.get('dining')?.split(',').filter(Boolean) || [],
      services: params.get('services')?.split(',').filter(Boolean) || [],
      unique: params.get('unique')?.split(',').filter(Boolean) || []
    };
    roomFilters = {
      persons: params.get('persons') || '',
      priceMin: params.get('minPrice') || '',
      priceMax: params.get('maxPrice') || '',
      minSize: params.get('minSize') || ''
    };
    sortBy = params.get('sort') || 'price-low';
    currency = params.get('currency') || 'USD';
    currentPage = parseInt(params.get('page') || '1');
    updateActiveFilterCount();
  }
  
  // Progressive loading function
  async function loadMoreSuites() {
    if (isLoadingMore || allDataLoaded) return;
    
    isLoadingMore = true;
    try {
      const response = await fetch(`/api/suites/${$page.params.city}?offset=${suites.length}&limit=500`);
      const data = await response.json();
      
      if (data.suites && data.suites.length > 0) {
        // Merge new suites with existing ones
        suites = [...suites, ...data.suites];
        console.log(`Loaded ${data.suites.length} additional suites. Total: ${suites.length}`);
      }
      
      // Check if we've loaded all available data
      if (!data.hasMore || data.suites.length === 0) {
        allDataLoaded = true;
      }
    } catch (error) {
      console.error('Error loading additional suites:', error);
      allDataLoaded = true; // Stop trying on error
    } finally {
      isLoadingMore = false;
    }
  }

  // Initialize filters from URL on mount
  onMount(() => {
    syncFromURL();
    lastURLString = $page.url.toString();
    mounted = true;
    
    // Start background loading if this was a partial initial load
    if (isPartialLoad && !allDataLoaded) {
      // Load more data in the background after a short delay
      setTimeout(() => {
        loadMoreSuites();
      }, 1000); // 1 second delay to let initial render complete
    }
    
    // Listen for popstate events (browser back/forward)
    const handlePopState = () => {
      if (!isUpdatingURL) {
        syncFromURL();
        lastURLString = window.location.href;
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  })
  
  // Update URL when filters change
  function updateURL() {
    if (isUpdatingURL) return; // Already updating, skip
    
    isUpdatingURL = true;
    const url = new URL($page.url);
    const oldURLString = url.toString();
    
    // Hotel search
    if (hotelFilters.hotelSearch) {
      url.searchParams.set('search', hotelFilters.hotelSearch);
    } else {
      url.searchParams.delete('search');
    }
    
    // Hotel amenity filters
    if (hotelFilters.wellness.length > 0) {
      url.searchParams.set('wellness', hotelFilters.wellness.join(','));
    } else {
      url.searchParams.delete('wellness');
    }
    
    if (hotelFilters.dining.length > 0) {
      url.searchParams.set('dining', hotelFilters.dining.join(','));
    } else {
      url.searchParams.delete('dining');
    }
    
    if (hotelFilters.services.length > 0) {
      url.searchParams.set('services', hotelFilters.services.join(','));
    } else {
      url.searchParams.delete('services');
    }
    
    if (hotelFilters.unique.length > 0) {
      url.searchParams.set('unique', hotelFilters.unique.join(','));
    } else {
      url.searchParams.delete('unique');
    }
    
    // Room filters
    if (roomFilters.priceMin) {
      url.searchParams.set('minPrice', roomFilters.priceMin);
    } else {
      url.searchParams.delete('minPrice');
    }
    
    if (roomFilters.priceMax) {
      url.searchParams.set('maxPrice', roomFilters.priceMax);
    } else {
      url.searchParams.delete('maxPrice');
    }
    
    if (roomFilters.persons) {
      url.searchParams.set('persons', roomFilters.persons);
    } else {
      url.searchParams.delete('persons');
    }
    
    if (roomFilters.minSize) {
      url.searchParams.set('minSize', roomFilters.minSize);
    } else {
      url.searchParams.delete('minSize');
    }
    
    // Sort
    if (sortBy && sortBy !== 'price-low') {
      url.searchParams.set('sort', sortBy);
    } else {
      url.searchParams.delete('sort');
    }
    
    // Currency
    if (currency && currency !== 'USD') {
      url.searchParams.set('currency', currency);
    } else {
      url.searchParams.delete('currency');
    }
    
    // Reset page to 1 when filters change
    url.searchParams.delete('page');
    currentPage = 1;
    
    const newURLString = url.toString();
    
    // Only update if URL actually changed
    if (newURLString === oldURLString) {
      isUpdatingURL = false;
      return;
    }
    
    lastURLString = newURLString;
    goto(newURLString, { replaceState: true, keepFocus: true, noScroll: true }).then(() => {
      isUpdatingURL = false;
    });
  }
  
  function updateActiveFilterCount() {
    activeFilterCount = 0;
    if (hotelFilters.hotelSearch) activeFilterCount++;
    if (hotelFilters.wellness.length > 0) activeFilterCount += hotelFilters.wellness.length;
    if (hotelFilters.dining.length > 0) activeFilterCount += hotelFilters.dining.length;
    if (hotelFilters.services.length > 0) activeFilterCount += hotelFilters.services.length;
    if (hotelFilters.unique.length > 0) activeFilterCount += hotelFilters.unique.length;
    if (roomFilters.priceMin || roomFilters.priceMax) activeFilterCount++;
    if (roomFilters.persons) activeFilterCount++;
    if (roomFilters.minSize) activeFilterCount++;
  }
  
  
  function clearFilters() {
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
    currency = 'USD';
    updateActiveFilterCount();
    if (mounted) {
      updateURL();
    }
  }
  
  // Pagination state
  let currentPage = 1;
  const itemsPerPage = 12;
  let paginatedSuites: any[] = [];
  let totalPages = 1;

  // Filter and sort suites
  function applyFiltersAndSort(suites: any[], hotelFilters: any, roomFilters: any, sortBy: string) {
    if (!suites || suites.length === 0) return [];
    
    let filtered = suites;
    
    // Filter by hotel search
    if (hotelFilters.hotelSearch) {
      filtered = filtered.filter(suite => {
        // Check both 'name' and 'hotelName' properties for compatibility
        const hotelName = suite.name || suite.hotelName || '';
        return hotelName.toLowerCase().includes(hotelFilters.hotelSearch.toLowerCase());
      });
    }
    
    // Filter by price (room filter)
    if (roomFilters.priceMin || roomFilters.priceMax) {
      const minPrice = roomFilters.priceMin ? parseInt(roomFilters.priceMin) : 0;
      const maxPrice = roomFilters.priceMax ? parseInt(roomFilters.priceMax) : Infinity;
      filtered = filtered.filter(suite => {
        const price = suite.price || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }
    
    // Filter by persons (room filter)
    if (roomFilters.persons) {
      const minPersons = parseInt(roomFilters.persons);
      filtered = filtered.filter(suite => 
        (suite.persons || 0) >= minPersons
      );
    }
    
    // Filter by room size (room filter)
    if (roomFilters.minSize) {
      const minSize = parseInt(roomFilters.minSize);
      filtered = filtered.filter(suite => 
        (suite.sqft || 0) >= minSize
      );
    }
    
    // Filter by wellness amenities (hotel filter)
    if (hotelFilters.wellness.length > 0) {
      filtered = filtered.filter(suite => {
        // Use camelCase property name
        const wellnessAmenities = suite.wellnessAmenities;
        
        // Skip if no amenities or empty array
        if (!wellnessAmenities || !Array.isArray(wellnessAmenities) || wellnessAmenities.length === 0) {
          return false;
        }
        
        // Check if ALL of the selected amenities match (AND logic)
        return hotelFilters.wellness.every((amenity: string) => 
          wellnessAmenities.some((wa: any) => {
            if (!wa || !wa.name) return false;
            // More flexible matching: remove special characters and do partial match
            const cleanAmenity = amenity.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const cleanWaName = wa.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            return cleanWaName.includes(cleanAmenity) || cleanAmenity.includes(cleanWaName);
          })
        );
      });
    }
    
    // Filter by dining amenities (hotel filter)
    if (hotelFilters.dining.length > 0) {
      filtered = filtered.filter(suite => {
        // Use camelCase property name
        const diningAmenities = suite.diningAmenities;
        
        // Skip if no amenities or empty array
        if (!diningAmenities || !Array.isArray(diningAmenities) || diningAmenities.length === 0) {
          return false;
        }
        
        // Check if ALL of the selected amenities match (AND logic)
        return hotelFilters.dining.every((amenity: string) => 
          diningAmenities.some((da: any) => {
            if (!da || !da.name) return false;
            // More flexible matching: remove special characters and do partial match
            const cleanAmenity = amenity.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const cleanDaName = da.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            return cleanDaName.includes(cleanAmenity) || cleanAmenity.includes(cleanDaName);
          })
        );
      });
    }
    
    // Filter by services amenities (hotel filter)
    if (hotelFilters.services.length > 0) {
      filtered = filtered.filter(suite => {
        // Use camelCase property name
        const servicesAmenities = suite.servicesAmenities;
        
        // Skip if no amenities or empty array
        if (!servicesAmenities || !Array.isArray(servicesAmenities) || servicesAmenities.length === 0) {
          return false;
        }
        
        // Check if ALL of the selected amenities match (AND logic)
        return hotelFilters.services.every((amenity: string) => 
          servicesAmenities.some((sa: any) => {
            if (!sa || !sa.name) return false;
            // More flexible matching: remove special characters and do partial match
            const cleanAmenity = amenity.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const cleanSaName = sa.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            return cleanSaName.includes(cleanAmenity) || cleanAmenity.includes(cleanSaName);
          })
        );
      });
    }
    
    // Filter by unique features (hotel filter)
    if (hotelFilters.unique.length > 0) {
      filtered = filtered.filter(suite => {
        // Use camelCase property name
        const uniquePoints = suite.uniquePoints;
        
        // Skip if no amenities or empty array
        if (!uniquePoints || !Array.isArray(uniquePoints) || uniquePoints.length === 0) {
          return false;
        }
        
        // Check if ALL of the selected amenities match (AND logic)
        return hotelFilters.unique.every((amenity: string) => 
          uniquePoints.some((up: any) => {
            if (!up || !up.name) return false;
            // More flexible matching: remove special characters and do partial match
            const cleanAmenity = amenity.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const cleanUpName = up.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            return cleanUpName.includes(cleanAmenity) || cleanAmenity.includes(cleanUpName);
          })
        );
      });
    }
    
    // Create a new array for sorting
    filtered = [...filtered];
    
    // Apply sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'size') {
      filtered.sort((a, b) => (b.sqft || 0) - (a.sqft || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.hotelRating || 0) - (a.hotelRating || 0));
    } else if (sortBy === 'refurbished') {
      filtered.sort((a, b) => (b.last_refurbished || 0) - (a.last_refurbished || 0));
    }
    
    return filtered;
  }
  
  // Apply filters and sorting - ensure this happens first
  $: {
    const filtered = applyFiltersAndSort(suites, hotelFilters, roomFilters, sortBy);
    filteredSuites = filtered;
    
    // Calculate pagination immediately after filtering
    const newTotalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    totalPages = newTotalPages;
    
    // Reset to page 1 if current page is out of bounds
    if (currentPage > newTotalPages && newTotalPages > 0) {
      currentPage = 1;
    }
    
    // Get current page items
    paginatedSuites = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    // Update active filter count
    updateActiveFilterCount();
    
    // Debug logging
    if (mounted) {
      console.log('Filter Debug:', {
        suitesCount: suites.length,
        filteredCount: filtered.length,
        totalPages: newTotalPages,
        currentPage,
        itemsPerPage,
        hotelFilters,
        roomFilters
      });
    }
  }
  
  // Debounce function for search input
  let searchTimer: any;
  let lastSearchValue = '';
  
  function debounceSearch(value: string) {
    if (value === lastSearchValue) return; // Don't update if value hasn't changed
    lastSearchValue = value;
    
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (mounted && !isUpdatingURL) {
        updateURL();
      }
    }, 300);
  }
  
  // Watch for hotel search changes and update URL with debounce
  let previousHotelSearch = '';
  $: if (mounted && hotelFilters.hotelSearch !== previousHotelSearch && !isUpdatingURL) {
    previousHotelSearch = hotelFilters.hotelSearch;
    debounceSearch(hotelFilters.hotelSearch);
  }
  
  // Update URL immediately when other filters change
  function handleFilterChange() {
    if (mounted && !isUpdatingURL) {
      updateURL();
    }
  }
  
  // Pagination handlers
  function goToPage(pageNum: number) {
    if (pageNum >= 1 && pageNum <= totalPages) {
      currentPage = pageNum;
      
      // Update URL with page parameter
      isUpdatingURL = true;
      const url = new URL($page.url);
      if (pageNum === 1) {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', pageNum.toString());
      }
      const newURLString = url.toString();
      lastURLString = newURLString;
      goto(newURLString, { replaceState: false, keepFocus: true, noScroll: false }).then(() => {
        isUpdatingURL = false;
        // Scroll to top of suites section after navigation completes - only for pagination
        setTimeout(() => {
          document.querySelector('.suites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      });
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

  function handleSuiteClick(suite: any) {
    // Navigate to suite detail page
    const citySlug = $page.params.city;
    window.location.href = `/${citySlug}/${suite.hotelSlug}/${suite.roomSlug}`;
  }

  // Handle city navigation with filter preservation
  function handleCityClick(event: MouseEvent, citySlug: string) {
    event.preventDefault();
    
    // Build URL with current filters
    const currentParams = new URLSearchParams($page.url.searchParams);
    currentParams.delete('page'); // Reset pagination
    
    const queryString = currentParams.toString();
    const newUrl = `/${citySlug}${queryString ? '?' + queryString : ''}`;
    
    goto(newUrl);
  }
  
</script>

<svelte:head>
  <title>Luxury Suites in {cityName} | Premium Hotel Rooms</title>
  <meta name="description" content="Browse luxury suites and rooms in {cityName}. Find the perfect accommodation from top hotels." />
  <meta name="keywords" content="luxury suites {cityName}, hotel rooms, premium accommodation, {cityName} hotels" />
</svelte:head>

<!-- Header Section -->
<section class="bg-gradient-to-r from-luxury-charcoal to-luxury-black text-white py-8">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="luxury-heading text-3xl lg:text-4xl mb-3 text-white">
        Luxury Suites in {cityName}
      </h1>
      <p class="max-w-2xl mx-auto text-lg text-gray-300 mb-4">
        Browse premium hotel rooms and suites
      </p>
      <div class="flex items-center justify-center text-luxury-blue">
        <MapPin class="h-5 w-5 mr-2" />
        <span class="font-medium">{cityName}</span>
      </div>
    </div>
  </div>
</section>

<!-- Popular Cities Section -->
<section class="bg-white py-6 border-b border-gray-200">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-4">
      <h2 class="text-lg font-medium text-gray-900 mb-3 text-center">Popular Cities</h2>
      
      <!-- Mobile: Horizontal scroll -->
      <div class="md:hidden">
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {#each popularCities as city}
            <a 
              href="/{city.slug}" 
              on:click={(e) => handleCityClick(e, city.slug)}
              class="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-luxury-blue hover:text-white text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {city.name}
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Desktop: Wrapped grid -->
      <div class="hidden md:flex md:flex-wrap md:justify-center gap-2">
        {#each popularCities as city}
          <a 
            href="/{city.slug}" 
            on:click={(e) => handleCityClick(e, city.slug)}
            class="px-3 py-2 bg-gray-100 hover:bg-luxury-blue hover:text-white text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
          >
            {city.name}
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- Filter/Sort Bar -->
<section class="bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <TwoTierFilters 
      bind:hotelFilters
      bind:roomFilters
      bind:sortBy
      bind:currency
      bind:activeFilterCount
      on:hotelFilterChange={handleFilterChange}
      on:roomFilterChange={handleFilterChange}
      on:hotelSearchChange={() => debounceSearch(hotelFilters.hotelSearch)}
      on:sortChange={handleFilterChange}
      on:currencyChange={handleFilterChange}
      on:clearFilters={clearFilters}
    />
    
    <!-- Results Count and View Toggle -->
    <div class="flex justify-between items-center py-2 border-b border-gray-200">
      <div class="text-sm text-gray-600 flex items-center gap-2">
        <span>{filteredSuites.length} results</span>
        {#if isLoadingMore}
          <span class="text-xs text-blue-600 flex items-center gap-1">
            <div class="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Loading more...
          </span>
        {:else if isPartialLoad && !allDataLoaded}
          <span class="text-xs text-gray-500">More available</span>
        {/if}
      </div>
      <div class="flex gap-2">
        <button
          on:click={() => viewMode = 'list'}
          class="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors
                 {viewMode === 'list' 
                   ? 'bg-luxury-blue text-white' 
                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          <Grid3x3 class="h-4 w-4" />
          List
        </button>
        <button
          on:click={() => viewMode = 'map'}
          class="flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors
                 {viewMode === 'map' 
                   ? 'bg-luxury-blue text-white' 
                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        >
          <Map class="h-4 w-4" />
          Map
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Suites Display -->
<section class="py-16 bg-gray-50 suites-grid">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {#if serverError}
      <div class="text-center py-12">
        <p class="text-red-600 mb-4">{serverError}</p>
        <a 
          href="/{$page.params.city}"
          class="bg-luxury-blue text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </a>
      </div>
    {:else if filteredSuites.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 mb-4">No suites found in {cityName}</p>
      </div>
    {:else if viewMode === 'map'}
      <!-- Map View -->
      <MapView 
        suites={filteredSuites} 
        {cityName}
        onSuiteClick={handleSuiteClick}
      />
    {:else}
      <!-- List View -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each paginatedSuites as suite}
          <div 
            class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            on:click={() => handleSuiteClick(suite)}
          >
            <div class="aspect-w-16 aspect-h-12 relative">
              <ImageCarousel 
                images={suite.images && Array.isArray(suite.images) && suite.images.length > 0 
                  ? suite.images.slice(0, 4)
                  : [suite.image]} 
                alt={suite.roomType}
              />
            </div>
            <div class="p-6">
              <!-- Room Name -->
              <h3 class="text-xl font-semibold mb-2">{suite.roomType}</h3>
              
              <!-- Hotel Name -->
              <div class="mb-3">
                <p class="text-sm text-gray-600">{suite.hotelName}</p>
                <div class="flex items-center">
                  {#each Array(suite.hotelStars || 0) as _}
                    <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {/each}
                  <span class="ml-1 text-xs text-gray-500">
                    {suite.hotelRating}/10
                  </span>
                </div>
              </div>
              
              <!-- Room Details -->
              <div class="flex items-center gap-3 mb-3 text-sm text-gray-600">
                <div class="flex items-center">
                  <Users class="h-4 w-4 mr-1" />
                  <span>{suite.persons} guests</span>
                </div>
                {#if suite.sqft}
                  <div class="flex items-center">
                    <span class="font-semibold">{suite.sqft} ft²</span>
                  </div>
                {/if}
                {#if suite.freeCancellation}
                  <div class="flex items-center text-green-600">
                    <Check class="h-4 w-4 mr-1" />
                    <span>Free cancel</span>
                  </div>
                {/if}
              </div>
              
              <!-- Bed Types -->
              {#if suite.bedTypes && suite.bedTypes.length > 0 && suite.bedTypes[0].beds}
                <div class="mb-3">
                  <div class="flex items-center text-sm text-gray-600">
                    <Bed class="h-4 w-4 mr-1" />
                    <span>{suite.bedTypes[0].beds[0]}</span>
                  </div>
                </div>
              {/if}
              
              
              <!-- Location -->
              <p class="text-xs text-gray-500 mb-3">
                {suite.neighbourhood || suite.address?.neighbourhood || ''}{suite.neighbourhood || suite.address?.neighbourhood ? ', ' : ''}{suite.region || suite.address?.city || 'London'}
              </p>
              
              <!-- Price -->
              <div class="flex items-center justify-between border-t pt-3">
                <div>
                  {#if suite.price}
                    {@const formattedPrice = formatPrice(suite.price, currency)}
                    <span class="text-2xl font-bold text-gray-900">
                      {formattedPrice?.formatted || `$${suite.price.toLocaleString()}`}
                    </span>
                    <span class="text-sm text-gray-500"> /night</span>
                  {:else}
                    <span class="text-gray-500">Price on request</span>
                  {/if}
                </div>
                <button class="bg-luxury-blue text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Pagination Controls -->
      {#if totalPages > 1}
        {#key totalPages}
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
        {/key}
      {/if}
    {/if}
  </div>
</section>


 