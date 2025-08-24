<script lang="ts">
  import { Building2, MapPin, Home, Calendar, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: allDevelopments = data.developments || [];
  $: serverError = data.error;
  
  // Search and filter state
  let searchQuery = '';
  let selectedNeighborhood = 'All';
  let selectedDeveloper = 'All';
  let sortBy = 'name'; // name, year, properties
  let showAvailableOnly = false;
  
  // Pagination state
  let currentPage = 1;
  const itemsPerPage = 12;
  
  // Get unique neighborhoods and developers for filters
  $: neighborhoods = ['All', ...new Set(allDevelopments.map(d => d.neighborhood).filter(Boolean))];
  $: developers = ['All', ...new Set(allDevelopments.map(d => d.developer_name).filter(Boolean))];
  
  // Filter and sort developments
  $: filteredDevelopments = allDevelopments.filter(dev => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        dev.name?.toLowerCase().includes(query) ||
        dev.display_name?.toLowerCase().includes(query) ||
        dev.neighborhood?.toLowerCase().includes(query) ||
        dev.developer_name?.toLowerCase().includes(query) ||
        dev.architect_name?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // Neighborhood filter
    if (selectedNeighborhood !== 'All' && dev.neighborhood !== selectedNeighborhood) {
      return false;
    }
    
    // Developer filter
    if (selectedDeveloper !== 'All' && dev.developer_name !== selectedDeveloper) {
      return false;
    }
    
    // Available properties filter
    if (showAvailableOnly && dev.available_properties_count === 0) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.display_name || a.name).localeCompare(b.display_name || b.name);
      case 'year':
        return (b.year_completed || 0) - (a.year_completed || 0);
      case 'properties':
        return b.available_properties_count - a.available_properties_count;
      default:
        return 0;
    }
  });
  
  // Pagination
  $: totalPages = Math.ceil(filteredDevelopments.length / itemsPerPage);
  $: paginatedDevelopments = filteredDevelopments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to page 1 when filters change
  $: if (searchQuery || selectedNeighborhood || selectedDeveloper || showAvailableOnly || sortBy) {
    currentPage = 1;
  }
  
  function handleDevelopmentClick(slug: string) {
    goto(`/developments/${slug}`);
  }
  
  function formatNeighborhood(neighborhood: string | null) {
    return neighborhood || 'London';
  }
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
</script>

<svelte:head>
  <title>Luxury Developments in London | Off Market Prime</title>
  <meta name="description" content="Explore exclusive residential developments in London's most prestigious neighborhoods. Browse luxury apartments and penthouses in iconic buildings." />
  
  <!-- Schema.org structured data for ItemList -->
  {@html `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Luxury Developments in London",
      "description": "Exclusive residential developments in London's most prestigious neighborhoods",
      "numberOfItems": ${filteredDevelopments.length},
      "itemListElement": ${JSON.stringify(
        paginatedDevelopments.map((dev, index) => ({
          "@type": "ListItem",
          "position": index + 1 + (currentPage - 1) * itemsPerPage,
          "item": {
            "@type": "ApartmentComplex",
            "@id": `https://offmarketprime.com/developments/${dev.slug}`,
            "name": dev.display_name || dev.name,
            "description": dev.description,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": dev.neighborhood || dev.city,
              "addressRegion": "London",
              "addressCountry": "GB",
              "postalCode": dev.postcode
            },
            "geo": dev.latitude && dev.longitude ? {
              "@type": "GeoCoordinates",
              "latitude": dev.latitude,
              "longitude": dev.longitude
            } : undefined,
            "numberOfAccommodationUnits": dev.available_properties_count > 0 ? dev.available_properties_count : undefined,
            "yearBuilt": dev.year_completed,
            "architect": dev.architect_name ? {
              "@type": "Organization",
              "name": dev.architect_name
            } : undefined,
            "developer": dev.developer_name ? {
              "@type": "Organization", 
              "name": dev.developer_name
            } : undefined,
            "amenityFeature": dev.amenities?.map(amenity => ({
              "@type": "LocationFeatureSpecification",
              "name": amenity
            }))
          }
        }))
      )}
    }
    </script>
  `}
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <div class="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
    <div class="max-w-7xl mx-auto px-6">
      <h1 class="text-4xl md:text-5xl font-light mb-4">
        Luxury Developments
      </h1>
      <p class="text-xl text-gray-300 max-w-3xl">
        Discover London's most prestigious residential developments, from iconic Knightsbridge addresses to contemporary riverside towers.
      </p>
    </div>
  </div>

  <!-- Search and Filters -->
  <div class="max-w-7xl mx-auto px-6 py-8">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search developments, neighborhoods, developers..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d7a] focus:border-transparent"
          />
        </div>
      </div>
      
      <!-- Filters Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Neighborhood Filter -->
        <div>
          <label for="neighborhood" class="block text-sm font-medium text-gray-700 mb-1">
            Neighborhood
          </label>
          <select
            id="neighborhood"
            bind:value={selectedNeighborhood}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d7a] focus:border-transparent"
          >
            {#each neighborhoods as neighborhood}
              <option value={neighborhood}>{neighborhood}</option>
            {/each}
          </select>
        </div>
        
        <!-- Developer Filter -->
        <div>
          <label for="developer" class="block text-sm font-medium text-gray-700 mb-1">
            Developer
          </label>
          <select
            id="developer"
            bind:value={selectedDeveloper}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d7a] focus:border-transparent"
          >
            {#each developers as developer}
              <option value={developer}>{developer}</option>
            {/each}
          </select>
        </div>
        
        <!-- Sort By -->
        <div>
          <label for="sort" class="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            bind:value={sortBy}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003d7a] focus:border-transparent"
          >
            <option value="name">Name</option>
            <option value="year">Year (Newest)</option>
            <option value="properties">Available Properties</option>
          </select>
        </div>
        
        <!-- Available Only Toggle -->
        <div class="flex items-end">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={showAvailableOnly}
              class="mr-2 w-4 h-4 text-[#003d7a] border-gray-300 rounded focus:ring-[#003d7a]"
            />
            <span class="text-sm font-medium text-gray-700">Available Only</span>
          </label>
        </div>
        
        <!-- Results Count -->
        <div class="flex items-end">
          <p class="text-sm text-gray-600">
            {filteredDevelopments.length} {filteredDevelopments.length === 1 ? 'development' : 'developments'} found
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Developments Grid -->
  <div class="max-w-7xl mx-auto px-6 pb-12">
    {#if serverError}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p class="text-red-600">{serverError}</p>
      </div>
    {/if}
    
    {#if filteredDevelopments.length === 0}
      <div class="text-center py-20">
        <Building2 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-medium text-gray-600 mb-2">No developments found</h2>
        <p class="text-gray-500">Try adjusting your search or filters.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each paginatedDevelopments as development}
          <div 
            class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
            on:click={() => handleDevelopmentClick(development.slug)}
            on:keydown={(e) => e.key === 'Enter' && handleDevelopmentClick(development.slug)}
            role="button"
            tabindex="0"
          >
            {#if development.hero_image}
              <div class="relative h-64">
                <img 
                  src={development.hero_image} 
                  alt={development.display_name || development.name}
                  class="w-full h-full object-cover"
                />
                {#if development.available_properties_count > 0}
                  <div class="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {development.available_properties_count} Available
                  </div>
                {/if}
              </div>
            {:else}
              <div class="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <Building2 class="w-24 h-24 text-gray-400" />
                {#if development.available_properties_count > 0}
                  <div class="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {development.available_properties_count} Available
                  </div>
                {/if}
              </div>
            {/if}
            
            <div class="p-6">
              <h2 class="text-2xl font-light mb-2">
                {development.display_name || development.name}
              </h2>
              
              <div class="flex items-center text-gray-600 mb-4">
                <MapPin class="w-4 h-4 mr-2" />
                <span>{formatNeighborhood(development.neighborhood)}, {development.city}</span>
              </div>
              
              {#if development.description}
                <p class="text-gray-600 line-clamp-3 mb-4">
                  {development.description}
                </p>
              {/if}
              
              <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                {#if development.year_completed}
                  <div class="flex items-center">
                    <Calendar class="w-4 h-4 mr-1" />
                    <span>Est. {development.year_completed}</span>
                  </div>
                {/if}
                
                {#if development.available_properties_count > 0}
                  <div class="flex items-center">
                    <Home class="w-4 h-4 mr-1" />
                    <span>{development.available_properties_count} {development.available_properties_count === 1 ? 'Property' : 'Properties'}</span>
                  </div>
                {/if}
              </div>
              
              {#if development.developer_name || development.architect_name}
                <div class="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  {#if development.developer_name}
                    <div>Developer: {development.developer_name}</div>
                  {/if}
                  {#if development.architect_name}
                    <div>Architect: {development.architect_name}</div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="mt-12 flex items-center justify-center">
          <nav class="flex items-center space-x-2">
            <!-- Previous Button -->
            <button
              on:click={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            
            <!-- Page Numbers -->
            {#if totalPages <= 7}
              {#each Array(totalPages) as _, i}
                <button
                  on:click={() => goToPage(i + 1)}
                  class="px-4 py-2 text-sm font-medium rounded-lg {currentPage === i + 1 
                    ? 'bg-[#003d7a] text-white' 
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}"
                >
                  {i + 1}
                </button>
              {/each}
            {:else}
              <!-- First page -->
              <button
                on:click={() => goToPage(1)}
                class="px-4 py-2 text-sm font-medium rounded-lg {currentPage === 1 
                  ? 'bg-[#003d7a] text-white' 
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}"
              >
                1
              </button>
              
              <!-- Ellipsis or pages around current -->
              {#if currentPage > 3}
                <span class="px-2 text-gray-500">...</span>
              {/if}
              
              {#each Array(Math.min(5, totalPages - 2)) as _, i}
                {@const pageNum = Math.max(2, Math.min(currentPage - 2 + i, totalPages - 1))}
                {#if pageNum > 1 && pageNum < totalPages}
                  <button
                    on:click={() => goToPage(pageNum)}
                    class="px-4 py-2 text-sm font-medium rounded-lg {currentPage === pageNum 
                      ? 'bg-[#003d7a] text-white' 
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}"
                  >
                    {pageNum}
                  </button>
                {/if}
              {/each}
              
              {#if currentPage < totalPages - 2}
                <span class="px-2 text-gray-500">...</span>
              {/if}
              
              <!-- Last page -->
              <button
                on:click={() => goToPage(totalPages)}
                class="px-4 py-2 text-sm font-medium rounded-lg {currentPage === totalPages 
                  ? 'bg-[#003d7a] text-white' 
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}"
              >
                {totalPages}
              </button>
            {/if}
            
            <!-- Next Button -->
            <button
              on:click={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </nav>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>