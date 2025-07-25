<script lang="ts">
  import { MapPin, Filter, Eye, EyeOff } from 'lucide-svelte';
  
  // Mock data for demonstration - replace with real data later
  const properties = [
    {
      id: 1,
      title: 'Luxury Penthouse',
      neighborhood: 'Mayfair',
      price: '£4,500,000',
      bedrooms: 3,
      bathrooms: 3,
      sqft: 2400,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      blurred: true
    },
    {
      id: 2,
      title: 'Georgian Townhouse',
      neighborhood: 'Chelsea',
      price: '£6,200,000',
      bedrooms: 4,
      bathrooms: 4,
      sqft: 3200,
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      blurred: true
    },
    {
      id: 3,
      title: 'Modern Apartment',
      neighborhood: 'Kensington',
      price: '£2,800,000',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1800,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      blurred: true
    },
    {
      id: 4,
      title: 'Victorian Mansion',
      neighborhood: 'Hampstead',
      price: '£8,500,000',
      bedrooms: 6,
      bathrooms: 5,
      sqft: 4500,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      blurred: true
    }
  ];

  const neighborhoods = [
    'All Areas', 'Mayfair', 'Chelsea', 'Kensington', 'Hampstead', 'Belgravia', 'Notting Hill'
  ];

  let selectedNeighborhood = 'All Areas';
  let isAuthenticated = false; // Replace with real auth state
</script>

<svelte:head>
  <title>Off Market Properties London | Luxury Properties for Sale | OffMarketEdit</title>
  <meta name="description" content="Discover exclusive off market properties in London. Browse luxury homes for sale in Mayfair, Chelsea, Kensington, Hampstead and other prestigious areas." />
  <meta name="keywords" content="off market london, luxury properties london, london property investment, mayfair properties, chelsea properties, hampstead properties" />
</svelte:head>

<!-- Header Section -->
<section class="bg-gradient-to-r from-luxury-charcoal to-luxury-black text-white py-16">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="luxury-heading text-4xl lg:text-5xl mb-4 text-white">
        Off Market Properties in London
      </h1>
      <p class="max-w-3xl mx-auto text-xl text-gray-300 mb-8">
        Discover exclusive luxury properties for sale in London's most prestigious neighbourhoods. 
        Access off-market opportunities before they reach the public market.
      </p>
      <div class="flex items-center justify-center text-luxury-gold">
        <MapPin class="h-6 w-6 mr-2" />
        <span class="text-lg font-medium">London, United Kingdom</span>
      </div>
    </div>
  </div>
</section>

<!-- Filters Section -->
<section class="bg-white py-8 border-b border-gray-200">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex items-center space-x-4">
        <Filter class="h-5 w-5 text-gray-500" />
        <select 
          bind:value={selectedNeighborhood}
          class="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
        >
          {#each neighborhoods as neighborhood}
            <option value={neighborhood}>{neighborhood}</option>
          {/each}
        </select>
      </div>
      
      <div class="text-sm text-gray-600">
        Showing {properties.length} exclusive properties
      </div>
    </div>
  </div>
</section>

<!-- Properties Grid -->
<section class="py-12 bg-luxury-pearl">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {#if !isAuthenticated}
      <div class="bg-luxury-gold/10 border border-luxury-gold rounded-lg p-6 mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <EyeOff class="h-6 w-6 text-luxury-gold" />
            <div>
              <h3 class="font-semibold text-luxury-charcoal">Full Property Details Hidden</h3>
              <p class="text-sm text-gray-600">Sign up to view complete property information, photos, and contact details</p>
            </div>
          </div>
          <a href="/signup" class="luxury-button rounded-md">
            Sign Up Now
          </a>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each properties as property}
        <div class="luxury-card rounded-lg overflow-hidden">
          <div class="relative">
            <img 
              src={property.image} 
              alt={property.title}
              class="w-full h-64 object-cover"
              class:blur-sm={property.blurred && !isAuthenticated}
            />
            {#if property.blurred && !isAuthenticated}
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div class="text-white text-center">
                  <Eye class="h-8 w-8 mx-auto mb-2" />
                  <p class="text-sm font-medium">Sign up to view</p>
                </div>
              </div>
            {/if}
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-luxury-gold bg-luxury-champagne px-2 py-1 rounded">
                {property.neighborhood}
              </span>
              <span class="luxury-heading text-xl text-luxury-charcoal">
                {isAuthenticated ? property.price : '£•,•••,•••'}
              </span>
            </div>
            
            <h3 class="luxury-heading text-lg mb-4">
              {isAuthenticated ? property.title : 'Luxury Property'}
            </h3>
            
            <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>{property.bedrooms} bed</span>
              <span>{property.bathrooms} bath</span>
              <span>{property.sqft} sqft</span>
            </div>
            
            <button 
              class="w-full luxury-button rounded-md"
              disabled={!isAuthenticated}
            >
              {isAuthenticated ? 'View Details' : 'Sign Up to View'}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- SEO Content Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="prose prose-lg max-w-none">
      <h2 class="luxury-heading text-3xl mb-6">Off Market Properties in London</h2>
      
      <p class="luxury-text mb-6">
        London's off market property scene offers unparalleled opportunities for discerning buyers seeking exclusive access to luxury homes. Our curated selection of off market properties in London includes some of the city's most prestigious addresses across Mayfair, Chelsea, Kensington, and Hampstead.
      </p>
      
      <h3 class="luxury-heading text-2xl mb-4">Why Choose Off Market Properties?</h3>
      <p class="luxury-text mb-6">
        Off market properties offer several distinct advantages: exclusive access before public listing, reduced competition from other buyers, and often more favourable negotiation terms. In London's competitive luxury market, off market opportunities can provide the edge needed to secure your ideal property.
      </p>
      
      <h3 class="luxury-heading text-2xl mb-4">Premium London Neighbourhoods</h3>
      <p class="luxury-text">
        Our off market property portfolio spans London's most coveted postcodes. From the sophistication of Mayfair to the charm of Chelsea, from the elegance of Kensington to the village atmosphere of Hampstead, we provide exclusive access to luxury properties across the capital's prime locations.
      </p>
    </div>
  </div>
</section> 