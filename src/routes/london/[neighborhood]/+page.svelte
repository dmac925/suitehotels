<script lang="ts">
  import { page } from '$app/stores';
  import { MapPin, TrendingUp, Home, Users } from 'lucide-svelte';
  
  // Get neighborhood from URL parameter
  $: neighborhood = $page.params.neighborhood;
  $: formattedNeighborhood = neighborhood?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  
  // Mock neighborhood data - replace with real data
  const neighborhoodData = {
    'mayfair': {
      name: 'Mayfair',
      description: 'The epitome of London luxury, Mayfair offers unparalleled sophistication with its Georgian architecture, world-class shopping, and proximity to Hyde Park.',
      avgPrice: '£4.2M',
      properties: 23,
      highlights: ['Bond Street Shopping', 'Michelin Star Restaurants', 'Private Members Clubs', 'Hyde Park Access']
    },
    'chelsea': {
      name: 'Chelsea',
      description: 'Known for its trendy boutiques, renowned restaurants, and beautiful garden squares, Chelsea combines village charm with urban sophistication.',
      avgPrice: '£3.8M',
      properties: 18,
      highlights: ['Kings Road Shopping', 'Chelsea Flower Show', 'River Thames Views', 'Victorian Architecture']
    },
    'hampstead': {
      name: 'Hampstead',
      description: 'This historic village offers a unique blend of intellectual heritage, stunning parkland, and some of London\'s most characterful properties.',
      avgPrice: '£3.2M',
      properties: 15,
      highlights: ['Hampstead Heath', 'Village Atmosphere', 'Historic Pubs', 'Intellectual Heritage']
    }
  };
  
  $: currentData = (neighborhood && neighborhoodData[neighborhood as keyof typeof neighborhoodData]) || {
    name: formattedNeighborhood,
    description: `Discover exclusive off-market properties in ${formattedNeighborhood}, one of London's most prestigious areas.`,
    avgPrice: '£3.5M',
    properties: 12,
    highlights: ['Prime Location', 'Luxury Properties', 'Excellent Transport', 'Premium Amenities']
  };
</script>

<svelte:head>
  <title>Off Market {currentData.name} Properties | Luxury Homes for Sale | OffMarketEdit</title>
  <meta name="description" content="Exclusive off market properties in {currentData.name}, London. Browse luxury homes and apartments for sale in this prestigious neighbourhood." />
  <meta name="keywords" content="off market {neighborhood}, {currentData.name} properties, luxury homes {currentData.name}, {currentData.name} real estate" />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-luxury-charcoal to-luxury-black text-white py-20">
  <div class="absolute inset-0 bg-black/30"></div>
  <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl">
      <h1 class="luxury-heading text-4xl lg:text-6xl mb-6 text-white">
        Off Market Properties in
        <span class="text-luxury-gold block">{currentData.name}</span>
      </h1>
      <p class="text-xl text-gray-300 mb-8">
        {currentData.description}
      </p>
      <div class="flex flex-col sm:flex-row gap-4">
        <a href="/signup" class="bg-luxury-gold text-luxury-black px-8 py-3 rounded-md font-semibold hover:bg-luxury-champagne transition-colors">
          View Properties
        </a>
        <a href="/london" class="border border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-luxury-black transition-colors">
          All London Areas
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Stats Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-champagne rounded-full mb-4">
          <Home class="h-8 w-8 text-luxury-gold" />
        </div>
        <div class="luxury-heading text-2xl mb-1">{currentData.properties}</div>
        <div class="text-sm text-gray-600">Exclusive Properties</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-champagne rounded-full mb-4">
          <TrendingUp class="h-8 w-8 text-luxury-gold" />
        </div>
        <div class="luxury-heading text-2xl mb-1">{currentData.avgPrice}</div>
        <div class="text-sm text-gray-600">Average Price</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-champagne rounded-full mb-4">
          <Users class="h-8 w-8 text-luxury-gold" />
        </div>
        <div class="luxury-heading text-2xl mb-1">48hrs</div>
        <div class="text-sm text-gray-600">Average Response</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-champagne rounded-full mb-4">
          <MapPin class="h-8 w-8 text-luxury-gold" />
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
      Why Choose {currentData.name}?
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each currentData.highlights as highlight}
        <div class="luxury-card rounded-lg p-6 text-center">
          <h3 class="luxury-heading text-lg mb-2">{highlight}</h3>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="py-16 bg-luxury-charcoal text-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="luxury-heading text-3xl mb-4 text-white">
      Ready to Explore {currentData.name}?
    </h2>
    <p class="text-lg text-gray-300 mb-8">
      Join our exclusive community to access off-market properties in {currentData.name} before they reach the public market.
    </p>
    <a href="/signup" class="bg-luxury-gold text-luxury-black px-10 py-4 rounded-full font-semibold hover:bg-luxury-champagne transition-colors">
      Get Exclusive Access
    </a>
  </div>
</section> 