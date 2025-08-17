<script lang="ts">
  import { Heart, Bath, Bed } from 'lucide-svelte';
  
  export let property: {
    id: number;
    address: string;
    price: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    propertyType: string;
    image: string;
  };
  
  export let location: string = '';
  export let saleType: string = 'Sale';
  export let onClick: (property: any) => void = () => {};
</script>

<div class="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer" 
     on:click={() => onClick(property)}
     on:keydown={(e) => e.key === 'Enter' && onClick(property)}
     role="button"
     tabindex="0">
  <!-- Property Image -->
  <div class="relative aspect-[4/3]">
    <img 
      src={property.image} 
      alt={property.address}
      class="w-full h-full object-cover"
    />
    
    <!-- Property Type Badge -->
    <div class="absolute top-4 left-4 flex gap-2">
      <span class="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium">
        {property.propertyType}
      </span>
      <span class="px-3 py-1.5 bg-[#003d7a] text-white text-xs font-medium">
        {saleType}
      </span>
    </div>
    
    <!-- Heart Icon -->
    <button 
      class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
      on:click|stopPropagation={() => {}}
      aria-label="Add {property.address} to favorites"
      title="Add to favorites"
    >
      <Heart class="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
    </button>
  </div>
  
  <!-- Property Details -->
  <div class="p-5">
    <!-- Address -->
    <div class="text-sm font-medium text-gray-900 mb-3">
      {#if location}
        {property.address}, {location}
      {:else}
        {property.address}
      {/if}
    </div>
    
    <!-- Price and Stats Row -->
    <div class="flex items-center justify-between">
      <!-- Price -->
      <div class="text-lg font-normal text-gray-900">
        {property.price}
      </div>
      
      <!-- Property Stats -->
      <div class="flex items-center gap-3 text-xs text-gray-600">
        <!-- Bedrooms - always show if available -->
        {#if property.bedrooms && property.bedrooms > 0}
          <div class="flex items-center gap-1.5">
            <span>{property.bedrooms}</span>
            <Bed class="w-3.5 h-3.5" />
          </div>
        {/if}
        
        <!-- Bathrooms - only show if available -->
        {#if property.bathrooms && property.bathrooms > 0}
          <div class="flex items-center gap-1.5">
            <span>{property.bathrooms}</span>
            <Bath class="w-3.5 h-3.5" />
          </div>
        {/if}
        
        <!-- Square footage - only show if available -->
        {#if property.sqft && property.sqft > 0}
          <div class="flex items-center gap-1.5">
            <span>{property.sqft.toLocaleString()} SQ.FT.</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
