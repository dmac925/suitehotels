<script lang="ts">
  import { page } from '$app/stores';
  import { MapPin, TrendingUp, Home, Users, Heart, Bath, Bed } from 'lucide-svelte';
  import PropertyCard from '$lib/components/PropertyCard.svelte';
  import neighborhoodContent from '$lib/content/neighborhood-content.json';
  
  // Get neighborhood from URL parameter
  $: neighborhood = $page.params.neighborhood;
  $: formattedNeighborhood = neighborhood?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  
  // Get content for current neighborhood
  $: currentContent = neighborhood && neighborhoodContent[neighborhood] ? neighborhoodContent[neighborhood] : null;
  
  // Popular neighborhoods for navigation
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
    { name: 'Shoreditch', slug: 'shoreditch' }
  ];
  
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

  // Sample properties for the neighborhood
  $: sampleProperties = currentData ? [
    {
      id: 1,
      address: `${currentData.name} Residence`,
      location: `${currentData.name}, London`,
      price: '£13,750,000',
      bedrooms: 3,
      bathrooms: 4,
      sqft: 2910,
      propertyType: 'Flat',
      saleType: 'Sale',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
    },
    {
      id: 2,
      address: `${currentData.name} Park Residence`,
      location: `${currentData.name}, London`,
      price: '£13,200,000',
      bedrooms: 3,
      bathrooms: 4,
      sqft: 2262,
      propertyType: 'Flat',
      saleType: 'Sale',
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop'
    },
    {
      id: 3,
      address: `Mount Row`,
      location: `${currentData.name}, London`,
      price: '£12,950,000',
      bedrooms: 3,
      bathrooms: 3,
      sqft: 3121,
      propertyType: 'House',
      saleType: 'Sale',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
    }
  ] : [];

  function handlePropertyClick(property: any) {
    // Navigate directly to property page - using default property ID for now
    window.location.href = `/property/1`;
  }
</script>

<svelte:head>
  <title>Houses for sale in {currentData.name} | Off Market Properties</title>  
  <meta name="description" content="Houses for sale in {currentData.name}, London. Browse {currentData.name} properties for sale, exclusive off market {currentData.name} houses and flats." />
  <meta name="keywords" content="property for sale {currentData.name}, {currentData.name} houses for sale, off market {currentData.name}, {currentData.name} properties for sale, {currentData.name} homes for sale, {currentData.name} property, {currentData.name} real estate, luxury properties {currentData.name}, {currentData.name} apartments for sale, {currentData.name} flats for sale" />
</svelte:head>

<!-- Header Section -->
<section class="bg-gradient-to-r from-luxury-charcoal to-luxury-black text-white py-8">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="luxury-heading text-3xl lg:text-4xl mb-3 text-white">
        Houses for Sale in {currentData.name} - Off Market Properties
      </h1>
      <p class="max-w-2xl mx-auto text-lg text-gray-300 mb-4">
        Discover exclusive properties for sale in {currentData.name}. Browse {currentData.name} houses for sale, luxury homes, and off market properties in this prestigious London neighbourhood.
      </p>
      <div class="flex items-center justify-center text-luxury-blue">
        <MapPin class="h-5 w-5 mr-2" />
        <span class="font-medium">{currentData.name}, London</span>
      </div>
    </div>
  </div>
</section>

<!-- Popular Neighborhoods Section -->
<section class="bg-white py-6 border-b border-gray-200">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mb-4">
      <h2 class="text-lg font-medium text-gray-900 mb-3 text-center">Other London Neighborhoods</h2>
      
      <!-- Mobile: Horizontal scroll -->
      <div class="md:hidden">
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <a 
            href="/london" 
            class="flex-shrink-0 px-4 py-2 bg-luxury-blue text-white rounded-md text-sm font-medium transition-colors duration-200"
          >
            All Areas
          </a>
          {#each popularNeighborhoods as neighb}
            <a 
              href="/london/{neighb.slug}" 
              class="flex-shrink-0 px-4 py-2 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
              class:bg-luxury-lightblue={neighb.slug === neighborhood}
              class:text-luxury-blue={neighb.slug === neighborhood}
              class:bg-gray-100={neighb.slug !== neighborhood}
              class:hover:bg-luxury-blue={neighb.slug !== neighborhood}
              class:hover:text-white={neighb.slug !== neighborhood}
            >
              {neighb.name}
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Desktop: Wrapped grid -->
      <div class="hidden md:flex md:flex-wrap md:justify-center gap-2">
        <a 
          href="/london" 
          class="px-3 py-2 bg-luxury-blue text-white rounded-md text-sm font-medium transition-colors duration-200"
        >
          All Areas
        </a>
        {#each popularNeighborhoods as neighb}
          <a 
            href="/london/{neighb.slug}" 
            class="px-3 py-2 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
            class:bg-luxury-lightblue={neighb.slug === neighborhood}
            class:text-luxury-blue={neighb.slug === neighborhood}
            class:bg-gray-100={neighb.slug !== neighborhood}
            class:hover:bg-luxury-blue={neighb.slug !== neighborhood}
            class:hover:text-white={neighb.slug !== neighborhood}
          >
            {neighb.name}
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- Stats Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-lightblue rounded-full mb-4">
          <Home class="h-8 w-8 text-luxury-blue" />
        </div>
        <div class="luxury-heading text-2xl mb-1">{currentData.properties}</div>
        <div class="text-sm text-gray-600">{currentData.name} Properties for Sale</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-lightblue rounded-full mb-4">
          <TrendingUp class="h-8 w-8 text-luxury-blue" />
        </div>
        <div class="luxury-heading text-2xl mb-1">{currentData.avgPrice}</div>
        <div class="text-sm text-gray-600">Average Price</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-lightblue rounded-full mb-4">
          <Users class="h-8 w-8 text-luxury-blue" />
        </div>
        <div class="luxury-heading text-2xl mb-1">48hrs</div>
        <div class="text-sm text-gray-600">Average Response</div>
      </div>
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-lightblue rounded-full mb-4">
          <MapPin class="h-8 w-8 text-luxury-blue" />
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
      Why Buy Properties in {currentData.name}?
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

<!-- Featured Properties Section -->
<section class="py-16 bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="luxury-heading text-3xl mb-4">
        Featured {currentData.name} Properties for Sale
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Discover our exclusive collection of luxury properties currently available in {currentData.name}
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each sampleProperties as property}
        <PropertyCard 
          {property} 
          location={property.location}
          saleType={property.saleType}
          onClick={handlePropertyClick} 
        />
      {/each}
    </div>
    
    <!-- View More Button -->
    <div class="text-center mt-12">
      <a href="/property/1" class="bg-luxury-blue text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
        View All {formattedNeighborhood} Properties
      </a>
    </div>
  </div>
</section>

<!-- SEO Content Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="prose max-w-none">
      <h2 class="luxury-heading text-2xl mb-6">
        {currentData.name} Properties for Sale - Your Complete Guide
      </h2>
      <div class="text-gray-700 space-y-4">
        <p>
          Looking for <strong>property for sale in {currentData.name}</strong>? Our exclusive portfolio of <strong>{currentData.name} houses for sale</strong> and <strong>{currentData.name} homes for sale</strong> offers the finest selection of luxury properties in this prestigious London neighbourhood.
        </p>
        <p>
          We specialise in <strong>off market {currentData.name}</strong> properties, giving you access to exclusive <strong>{currentData.name} properties for sale</strong> before they reach the public market. Whether you're searching for {currentData.name} apartments, townhouses, or luxury family homes, our curated collection represents the best of {currentData.name} real estate.
        </p>
        <p>
          Our <strong>{currentData.name} property</strong> portfolio includes both period properties and contemporary developments, each carefully selected for their exceptional quality, prime location, and investment potential. From charming {currentData.name} mews houses to grand {currentData.name} mansions, we have properties to suit every discerning buyer.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- SEO Content Section -->
{#if currentContent}
<section class="py-16 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="prose prose-lg max-w-none">
      {#each currentContent.content as section}
        <div class="mb-8">
          <h2 class="luxury-heading text-2xl mb-4">{section.heading}</h2>
          <p class="luxury-text text-lg leading-relaxed">{section.text}</p>
        </div>
      {/each}
      
      <!-- Features Section -->
      <div class="mt-12 mb-8">
        <h2 class="luxury-heading text-2xl mb-6">Why Choose {formattedNeighborhood}?</h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each currentContent.features as feature}
            <li class="flex items-start">
              <span class="text-luxury-blue mr-3 mt-1">•</span>
              <span class="luxury-text">{feature}</span>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Stats Section -->
      <div class="mt-12 border-t border-gray-200 pt-8">
        <h2 class="luxury-heading text-2xl mb-6">{formattedNeighborhood} Property Market</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{currentContent.stats.averagePrice}</div>
            <div class="text-sm text-gray-600">Average Price</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{currentContent.stats.priceRange}</div>
            <div class="text-sm text-gray-600">Price Range</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{currentContent.stats.pricePerSqFt}</div>
            <div class="text-sm text-gray-600">Price per Sq Ft</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-luxury-blue mb-1">{currentContent.stats.rentalYield}</div>
            <div class="text-sm text-gray-600">Rental Yield</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
{/if}

<!-- CTA Section -->
<section class="py-16 bg-luxury-charcoal text-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="luxury-heading text-3xl mb-4 text-white">
      Find Your Perfect {currentData.name} Property for Sale
    </h2>
    <p class="text-lg text-gray-300 mb-8">
      Access exclusive {currentData.name} houses for sale, {currentData.name} homes for sale, and off market {currentData.name} properties before they reach the public market. Browse luxury {currentData.name} properties for sale from our exclusive portfolio.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/signup" class="bg-luxury-blue text-luxury-black px-10 py-4 rounded-full font-semibold hover:bg-luxury-lightblue transition-colors">
        Get Exclusive Access
      </a>
      <a href="/london" class="border border-white text-white px-10 py-4 rounded-full font-semibold hover:bg-white hover:text-luxury-black transition-colors">
        View All London Areas
      </a>
    </div>
  </div>
</section> 