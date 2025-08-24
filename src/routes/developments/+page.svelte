<script lang="ts">
  import { Building2, MapPin, Home, Calendar } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: developments = data.developments || [];
  $: serverError = data.error;
  
  function handleDevelopmentClick(slug: string) {
    goto(`/developments/${slug}`);
  }
  
  function formatNeighborhood(neighborhood: string | null) {
    return neighborhood || 'London';
  }
</script>

<svelte:head>
  <title>Luxury Developments in London | Off Market Prime</title>
  <meta name="description" content="Explore exclusive residential developments in London's most prestigious neighborhoods. Browse luxury apartments and penthouses in iconic buildings." />
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

  <!-- Developments Grid -->
  <div class="max-w-7xl mx-auto px-6 py-12">
    {#if serverError}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p class="text-red-600">{serverError}</p>
      </div>
    {/if}
    
    {#if developments.length === 0}
      <div class="text-center py-20">
        <Building2 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-medium text-gray-600 mb-2">No developments available</h2>
        <p class="text-gray-500">Check back soon for new luxury developments.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each developments as development}
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