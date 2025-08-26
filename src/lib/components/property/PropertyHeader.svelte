<script lang="ts">
  import { ChevronLeft, Heart, Share2 } from 'lucide-svelte';
  import PropertyStats from './PropertyStats.svelte';
  
  export let title: string = '';
  export let location: string = '';
  export let price: string = '';
  export let bedrooms: number = 0;
  export let bathrooms: number = 0;
  export let sqft: number = 0;
  export let onBack: () => void = () => {};
  export let onRequestViewing: () => void = () => {};
</script>

<!-- Main Property Header Bar - Desktop only -->
<div class="hidden md:block sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
  <div class="px-4 lg:px-8 xl:px-12 py-3">
    <div class="flex justify-between items-center">
      <!-- Left side: Property info -->
      <div class="flex items-center gap-4">
        <button on:click={onBack} class="p-2 hover:bg-gray-100 rounded transition-colors">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-6">
          <PropertyStats {bedrooms} {bathrooms} {sqft} />
        </div>
      </div>
      
      <!-- Right side: Action buttons -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600 mr-2">{price}</span>
        <button on:click={onRequestViewing} class="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded transition-colors text-sm">
          Request viewing
        </button>
        <button class="p-2 border border-gray-300 hover:bg-gray-50 rounded transition-colors">
          <Heart class="w-5 h-5" />
        </button>
        <button class="p-2 border border-gray-300 hover:bg-gray-50 rounded transition-colors">
          <Share2 class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Mobile Property Info - Non-sticky, appears below header -->
<div class="md:hidden px-4 py-3 bg-white border-b border-gray-100">
  <div class="space-y-2">
    <div class="flex justify-between items-start">
      <!-- Property title -->
      <h1 class="text-lg font-semibold text-gray-900">{title}</h1>
    </div>
    <!-- Price and property details on one line -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-gray-900">{price}</span>
      <div class="flex items-center gap-3 text-sm text-gray-600">
        <PropertyStats {bedrooms} {bathrooms} {sqft} compact={true} />
      </div>
    </div>
  </div>
</div>