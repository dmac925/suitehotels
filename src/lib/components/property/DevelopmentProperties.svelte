<script lang="ts">
  import { goto } from '$app/navigation';
  import PropertyCard from '../PropertyCard.svelte';
  
  export let properties: any[] = [];
  export let currentPropertyId: string;
  export let developmentName: string = '';
  export let isAuthenticated: boolean = false;
  
  // Filter out current property and parse images
  $: relatedProperties = properties
    .filter(p => p.id !== currentPropertyId)
    .map(property => {
      // Parse images array
      let propertyImages = [];
      try {
        if (typeof property.images === 'string') {
          const parsed = JSON.parse(property.images);
          if (Array.isArray(parsed)) {
            propertyImages = parsed.map((img: any) => 
              typeof img === 'object' ? img.url : img
            ).filter(Boolean);
          }
        } else if (Array.isArray(property.images)) {
          propertyImages = property.images.map((img: any) => 
            typeof img === 'object' ? img.url : img
          ).filter(Boolean);
        }
      } catch (e) {
        console.warn('Error parsing property images:', e);
      }
      
      const firstImage = propertyImages[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800';
      
      return {
        id: property.id,
        address: property.address || property.title || 'Property',
        price: property.price_display || (property.price ? `£${property.price.toLocaleString()}` : 'Price on request'),
        priceRange: getPriceRange(property.price || 0),
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        sqft: property.sqft || 0,
        propertyType: property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) || 'Property',
        image: firstImage,
        slug: property.slug
      };
    });
  
  // Helper function to get price range
  function getPriceRange(price: number): string {
    if (price === 0) {
      return 'Price on application';
    }
    
    if (price < 750000) {
      return '£500k - £750k';
    } else if (price < 1000000) {
      return '£750k - £1m';
    } else if (price < 1500000) {
      return '£1m - £1.5m';
    } else if (price < 2000000) {
      return '£1.5m - £2m';
    } else if (price < 3000000) {
      return '£2m - £3m';
    } else if (price < 5000000) {
      return '£3m - £5m';
    } else if (price < 7500000) {
      return '£5m - £7.5m';
    } else if (price < 10000000) {
      return '£7.5m - £10m';
    } else if (price < 15000000) {
      return '£10m - £15m';
    } else if (price < 20000000) {
      return '£15m - £20m';
    } else {
      return '£20m+';
    }
  }
  
  function handlePropertyClick(property: any) {
    if (property.slug) {
      goto(`/property/${property.slug}`);
    }
  }
</script>

{#if relatedProperties.length > 0}
  <div class="bg-gray-50 py-16 mt-16 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-light text-gray-900 mb-4" style="font-family: 'Georgia', 'Times New Roman', serif; letter-spacing: 0.02em;">
          {#if developmentName}
            Other Properties in {developmentName}
          {:else}
            Other Properties in This Development
          {/if}
        </h2>
        <p class="text-gray-600" style="font-family: 'Helvetica Neue', 'Arial', sans-serif; font-weight: 300;">
          Explore {relatedProperties.length} more {relatedProperties.length === 1 ? 'property' : 'properties'} in the same development
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each relatedProperties as property}
          <PropertyCard 
            {property}
            onClick={handlePropertyClick}
            {isAuthenticated}
          />
        {/each}
      </div>
      
      {#if relatedProperties.length >= 6}
        <div class="text-center mt-12">
          <button 
            on:click={() => goto('/london')}
            class="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300; letter-spacing: 0.1em;"
          >
            VIEW ALL PROPERTIES
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}