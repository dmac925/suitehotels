<script lang="ts">
  import { Building2, MapPin, Calendar, Users, Home, Bath, Bed, Maximize, ChevronLeft } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth';
  import PropertyCard from '$lib/components/PropertyCard.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: development = data.development;
  $: properties = data.properties || [];
  $: serverError = data.error;
  
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
  
  function handlePropertyClick(property: any) {
    if (property.slug) {
      goto(`/property/${property.slug}`);
    }
  }
  
  function formatPrice(price: number): string {
    if (price >= 1000000) {
      return `£${(price / 1000000).toFixed(1)}M`;
    }
    return `£${price.toLocaleString()}`;
  }
  
  function formatPropertyType(type: string): string {
    const types: Record<string, string> = {
      'flat': 'Apartment',
      'penthouse': 'Penthouse',
      'house': 'House',
      'townhouse': 'Townhouse',
      'mews': 'Mews House',
      'mansion': 'Mansion'
    };
    return types[type] || type;
  }
  
  function goBack() {
    goto('/developments');
  }
</script>

<svelte:head>
  <title>{development?.meta_title || `${development?.display_name || development?.name}`} For Sale | Off Market Prime</title>
  <meta name="description" content={development?.meta_description || `Explore available properties in ${development?.display_name || development?.name}, ${development?.neighborhood || 'London'}.`} />
</svelte:head>

{#if development}
<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <div class="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white">
    {#if development.hero_image}
      <div class="absolute inset-0">
        <img 
          src={development.hero_image} 
          alt={development.display_name || development.name}
          class="w-full h-full object-cover opacity-30"
        />
      </div>
    {/if}
    
    <div class="relative z-10 max-w-7xl mx-auto px-6 py-20">
      <button 
        on:click={goBack}
        class="flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft class="w-5 h-5 mr-1" />
        Back to Developments
      </button>
      
      <h1 class="text-4xl md:text-5xl font-light mb-4">
        {development.display_name || development.name}
      </h1>
      
      <div class="flex flex-wrap items-center gap-6 text-lg text-gray-300">
        <div class="flex items-center">
          <MapPin class="w-5 h-5 mr-2" />
          <span>{development.neighborhood || ''}{development.neighborhood ? ', ' : ''}{development.city}</span>
        </div>
        
        {#if development.year_completed}
          <div class="flex items-center">
            <Calendar class="w-5 h-5 mr-2" />
            <span>Established {development.year_completed}</span>
          </div>
        {/if}
        
        {#if properties.length > 0}
          <div class="flex items-center">
            <Home class="w-5 h-5 mr-2" />
            <span>{properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Available</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Development Info -->
  <div class="max-w-7xl mx-auto px-6 py-12">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- Main Content -->
      <div class="lg:col-span-2">
        {#if development.description}
          <div class="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 class="text-2xl font-light mb-4">About {development.display_name || development.name}</h2>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">
              {development.description}
            </p>
          </div>
        {/if}
        
        {#if development.amenities && development.amenities.length > 0}
          <div class="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 class="text-2xl font-light mb-4">Building Amenities</h2>
            <div class="grid grid-cols-2 gap-3">
              {#each development.amenities as amenity}
                <div class="flex items-center text-gray-600">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>{amenity}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-md p-6 sticky top-6">
          <h3 class="text-lg font-medium mb-4">Development Details</h3>
          
          <div class="space-y-4">
            {#if development.address}
              <div>
                <p class="text-sm text-gray-500">Address</p>
                <p class="text-gray-800">{development.address}</p>
                {#if development.postcode}
                  <p class="text-gray-600">{development.postcode}</p>
                {/if}
              </div>
            {/if}
            
            {#if development.developer_name}
              <div>
                <p class="text-sm text-gray-500">Developer</p>
                <p class="text-gray-800">{development.developer_name}</p>
              </div>
            {/if}
            
            {#if development.architect_name}
              <div>
                <p class="text-sm text-gray-500">Architect</p>
                <p class="text-gray-800">{development.architect_name}</p>
              </div>
            {/if}
            
            {#if properties.length > 0}
              <div class="pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-500 mb-2">Price Range</p>
                <p class="text-xl font-light text-gray-800">
                  {formatPrice(Math.min(...properties.map(p => p.price)))} - 
                  {formatPrice(Math.max(...properties.map(p => p.price)))}
                </p>
              </div>
            {/if}
          </div>
          
          <button 
            class="w-full mt-6 bg-[#003d7a] text-white py-3 px-6 hover:bg-[#002a55] transition-colors"
            on:click={() => window.location.href = '/contact'}
          >
            Register Interest for This Development
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Available Properties -->
  {#if properties.length > 0}
    <div class="max-w-7xl mx-auto px-6 py-12">
      <h2 class="text-3xl font-light mb-8">Available Properties</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each properties as property}
          <div 
            class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
            on:click={() => handlePropertyClick(property)}
            on:keydown={(e) => e.key === 'Enter' && handlePropertyClick(property)}
            role="button"
            tabindex="0"
          >
            {#if property.images && property.images.length > 0}
              {@const firstImage = typeof property.images === 'string' ? JSON.parse(property.images)[0] : property.images[0]}
              <div class="relative h-64">
                <img 
                  src={firstImage.url || firstImage} 
                  alt={property.title}
                  class="w-full h-full object-cover"
                />
                <div class="absolute top-4 left-4">
                  <span class="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium">
                    {formatPropertyType(property.property_type)}
                  </span>
                </div>
              </div>
            {:else}
              <div class="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <Home class="w-24 h-24 text-gray-400" />
                <div class="absolute top-4 left-4">
                  <span class="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium">
                    {formatPropertyType(property.property_type)}
                  </span>
                </div>
              </div>
            {/if}
            
            <div class="p-6">
              <h3 class="text-xl font-light mb-2 line-clamp-2">
                {property.title}
              </h3>
              
              <p class="text-2xl font-light text-[#003d7a] mb-4">
                {property.price_display || formatPrice(property.price)}
              </p>
              
              <div class="flex items-center gap-4 text-gray-600">
                {#if property.bedrooms}
                  <div class="flex items-center">
                    <Bed class="w-4 h-4 mr-1" />
                    <span>{property.bedrooms}</span>
                  </div>
                {/if}
                
                {#if property.bathrooms}
                  <div class="flex items-center">
                    <Bath class="w-4 h-4 mr-1" />
                    <span>{property.bathrooms}</span>
                  </div>
                {/if}
                
                {#if property.sqft}
                  <div class="flex items-center">
                    <Maximize class="w-4 h-4 mr-1" />
                    <span>{property.sqft.toLocaleString()} sq ft</span>
                  </div>
                {/if}
              </div>
              
              {#if !isAuthenticated && !isLoadingAuth}
                <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  <a href="/login" class="underline">Sign in</a> to view full details
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <Home class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-medium text-gray-600 mb-2">No Properties Currently Available</h2>
        <p class="text-gray-500 mb-6">
          There are no properties available in {development.display_name || development.name} at the moment.
        </p>
        <button 
          class="bg-[#003d7a] text-white py-3 px-6 hover:bg-[#002a55] transition-colors"
          on:click={() => window.location.href = '/contact'}
        >
          Register Your Interest
        </button>
      </div>
    </div>
  {/if}
</div>
{:else}
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <Building2 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h1 class="text-2xl font-light text-gray-600 mb-2">Development Not Found</h1>
      <p class="text-gray-500 mb-6">The development you're looking for doesn't exist.</p>
      <button 
        class="bg-[#003d7a] text-white py-3 px-6 hover:bg-[#002a55] transition-colors"
        on:click={() => goto('/developments')}
      >
        View All Developments
      </button>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>