<script lang="ts">
  import { Building2, MapPin, Home, Bath, Bed, Maximize, ChevronLeft, 
           Calculator, Train, AlertCircle, CheckCircle, 
           ExternalLink, Shield } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  $: development = data.development;
  $: properties = data.properties || [];
  
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
      'penthouse': 'Penthouse',
      'flat': 'Flat',
      'house': 'House',
      'duplex': 'Duplex',
      'mews': 'Mews House',
      'masionette': 'Maisonette'
    };
    return types[type] || type;
  }
  
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
    } else if (price < 30000000) {
      return '£20m - £30m';
    } else if (price < 50000000) {
      return '£30m - £50m';
    } else if (price < 75000000) {
      return '£50m - £75m';
    } else if (price < 100000000) {
      return '£75m - £100m';
    } else {
      return '£100m+';
    }
  }
  
  function goBack() {
    goto('/developments');
  }
  
  function formatSqmToSqft(sqm: number): string {
    const sqft = Math.round(sqm * 10.764);
    return sqft.toLocaleString();
  }
  
  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Account for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
</script>

<svelte:head>
  <title>{development?.meta_title || `${development?.display_name || development?.name}`} For Sale</title>
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
        
        {#if development.units_total}
          <div class="flex items-center">
            <Building2 class="w-5 h-5 mr-2" />
            <span>{development.units_total} Total Units</span>
          </div>
        {/if}
        
        {#if development.completion_status}
          <div class="flex items-center">
            <CheckCircle class="w-5 h-5 mr-2" />
            <span class="capitalize">{development.completion_status}</span>
          </div>
        {/if}
        
        {#if development.tenure}
          <div class="flex items-center">
            <Shield class="w-5 h-5 mr-2" />
            <span class="capitalize">{development.tenure}</span>
          </div>
        {/if}
        
        {#if development.completion_date}
          <div class="flex items-center">
            <CheckCircle class="w-5 h-5 mr-2" />
            <span>Completed {new Date(development.completion_date).getFullYear()}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Quick Navigation -->
  <div class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex space-x-8 overflow-x-auto">
        <button
          class="py-4 px-1 border-b-2 border-transparent font-medium text-sm whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300"
          on:click={() => scrollToSection('overview')}
        >
          Overview
        </button>
        <button
          class="py-4 px-1 border-b-2 border-transparent font-medium text-sm whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300"
          on:click={() => scrollToSection('properties')}
        >
          Available Units ({properties.length})
        </button>
        {#if development.pricing}
        <button
          class="py-4 px-1 border-b-2 border-transparent font-medium text-sm whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300"
          on:click={() => scrollToSection('pricing')}
        >
          Pricing & Examples
        </button>
        {/if}
        {#if development.transport}
        <button
          class="py-4 px-1 border-b-2 border-transparent font-medium text-sm whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300"
          on:click={() => scrollToSection('location')}
        >
          Location & Transport
        </button>
        {/if}
        {#if development.rental || development.market_context || development.projection_scenario || development.ownership_costs}
        <button
          class="py-4 px-1 border-b-2 border-transparent font-medium text-sm whitespace-nowrap text-gray-500 hover:text-gray-700 hover:border-gray-300"
          on:click={() => scrollToSection('investment')}
        >
          Investment Analysis
        </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-6 py-12">
    <!-- Overview Section -->
    <section id="overview" class="scroll-mt-24 mb-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2 space-y-8">
          <!-- Investment Highlights -->
          {#if development.investment_highlights && development.investment_highlights.length > 0}
            <div class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-2xl font-light mb-6 flex items-center">
                <CheckCircle class="w-6 h-6 mr-3 text-green-500" />
                Investment Highlights
              </h2>
              <ul class="space-y-3">
                {#each development.investment_highlights as highlight}
                  <li class="flex items-start">
                    <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span class="text-gray-700 leading-relaxed">{highlight}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          <!-- Unit Mix -->
          {#if development.unit_mix && development.unit_mix.length > 0}
            <div class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-2xl font-light mb-6">Unit Mix</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                {#each development.unit_mix as unit}
                  <div class="text-center">
                    <p class="text-3xl font-light text-[#003d7a]">{unit.count}</p>
                    <p class="text-sm text-gray-600 mt-2">{unit.type} Units</p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- About -->
          {#if development.description}
            <div class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-2xl font-light mb-4">About {development.display_name || development.name}</h2>
              <p class="text-gray-600 leading-relaxed whitespace-pre-line">
                {development.description}
              </p>
            </div>
          {/if}
          
          <!-- Amenities -->
          {#if development.amenities && development.amenities.length > 0}
            <div class="bg-white rounded-lg shadow-md p-8">
              <h2 class="text-2xl font-light mb-6">Building Amenities</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                {#each development.amenities as amenity}
                  <div class="flex items-center text-gray-700">
                    <CheckCircle class="w-5 h-5 mr-3 text-green-500" />
                    <span class="capitalize">{amenity}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Risks & Considerations -->
          {#if development.risks_considerations && development.risks_considerations.length > 0}
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-8">
              <h2 class="text-2xl font-light mb-6 flex items-center">
                <AlertCircle class="w-6 h-6 mr-3 text-amber-600" />
                Risks & Considerations
              </h2>
              <ul class="space-y-3">
                {#each development.risks_considerations as risk}
                  <li class="flex items-start">
                    <div class="w-2 h-2 bg-amber-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span class="text-gray-700 leading-relaxed">{risk}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
        
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div class="text-lg font-medium mb-6">Development Details</div>
            
            <div class="space-y-5">
              {#if development.address}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Address</p>
                  <p class="text-gray-800">{development.address}</p>
                  {#if development.postcode}
                    <p class="text-gray-600">{development.postcode}</p>
                  {/if}
                </div>
              {/if}
              
              {#if development.developer_name}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Developer</p>
                  <p class="text-gray-800">{development.developer_name}</p>
                </div>
              {/if}
              
              {#if development.architect_name}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Architect</p>
                  <p class="text-gray-800">{development.architect_name}</p>
                </div>
              {/if}
              
              {#if development.interior_designer}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Interior Designer</p>
                  <p class="text-gray-800">{development.interior_designer}</p>
                </div>
              {/if}
              
              {#if development.heritage_grade && development.heritage_grade !== 'None'}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Heritage Grade</p>
                  <p class="text-gray-800">{development.heritage_grade}</p>
                </div>
              {/if}
              
              {#if development.ceiling_heights_max_m}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Ceiling Heights</p>
                  <p class="text-gray-800">Up to {development.ceiling_heights_max_m}m</p>
                </div>
              {/if}
              
              {#if development.epc_rating}
                <div>
                  <p class="text-sm text-gray-500 mb-1">EPC Rating</p>
                  <div class="flex items-center">
                    <span class="text-gray-800 font-medium">{development.epc_rating}</span>
                    {#if development.epc_lookup_url}
                      <a 
                        href={development.epc_lookup_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="ml-2 text-[#003d7a] hover:underline text-sm"
                      >
                        Verify →
                      </a>
                    {/if}
                  </div>
                </div>
              {/if}
              
              {#if development.pricing?.headline_price_range}
                <div class="pt-5 border-t border-gray-200">
                  <p class="text-sm text-gray-500 mb-2">Price Range</p>
                  <p class="text-xl font-light text-gray-800">
                    {formatPrice(development.pricing.headline_price_range.min)} - {formatPrice(development.pricing.headline_price_range.max)}
                  </p>
                </div>
              {/if}
            </div>
            
            <button 
              class="w-full mt-6 bg-[#003d7a] text-white py-3 px-6 hover:bg-[#002a55] transition-colors"
              on:click={() => window.location.href = '/contact'}
            >
              Register Interest
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Available Properties Section -->
    <section id="properties" class="scroll-mt-24 mb-16">
      <h2 class="text-3xl font-light mb-8">Available Units</h2>
      {#if properties.length > 0}
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
                <div class="text-xl font-light mb-2 line-clamp-2">
                  {property.title}
                </div>
                
                <p class="text-2xl font-light text-[#003d7a] mb-4">
                  {isAuthenticated 
                    ? (property.price_display || formatPrice(property.price))
                    : getPriceRange(property.price)}
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
      {:else}
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <Home class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div class="text-xl font-medium text-gray-600 mb-2">No Properties Currently Available</div>
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
      {/if}
    </section>

    <!-- Pricing Section -->
    {#if development.pricing}
    <section id="pricing" class="scroll-mt-24 mb-16">
      <h2 class="text-3xl font-light mb-8">Pricing & Examples</h2>
      <div class="space-y-8">
        <!-- Headline Pricing -->
        <div class="bg-white rounded-lg shadow-md p-8">
          <div class="text-xl font-light mb-6">Pricing Overview</div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-2">Price Range</p>
              <p class="text-2xl font-light text-[#003d7a]">
                {formatPrice(development.pricing.headline_price_range.min)}
              </p>
              <p class="text-sm text-gray-500">to</p>
              <p class="text-2xl font-light text-[#003d7a]">
                {formatPrice(development.pricing.headline_price_range.max)}
              </p>
            </div>
            
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-2">Size Range</p>
              <p class="text-2xl font-light">
                {formatSqmToSqft(development.pricing.headline_size_range_sqm.min)} sq ft
              </p>
              <p class="text-sm text-gray-500">to</p>
              <p class="text-2xl font-light">
                {formatSqmToSqft(development.pricing.headline_size_range_sqm.max)} sq ft
              </p>
              <p class="text-xs text-gray-400 mt-1">
                ({development.pricing.headline_size_range_sqm.min} - {development.pricing.headline_size_range_sqm.max} sqm)
              </p>
            </div>
            
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-2">Price per sq ft</p>
              <p class="text-2xl font-light">
                £{Math.round(development.pricing.headline_price_psf_range.min).toLocaleString()}
              </p>
              <p class="text-sm text-gray-500">to</p>
              <p class="text-2xl font-light">
                £{Math.round(development.pricing.headline_price_psf_range.max).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <!-- Example Units -->
        {#if development.pricing.examples && development.pricing.examples.length > 0}
          <div class="bg-white rounded-lg shadow-md p-8">
            <div class="text-xl font-light mb-6">Example Units</div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="text-left py-3 px-4 font-medium text-gray-700">Unit Type</th>
                    <th class="text-center py-3 px-4 font-medium text-gray-700">Beds</th>
                    <th class="text-center py-3 px-4 font-medium text-gray-700">Baths</th>
                    <th class="text-center py-3 px-4 font-medium text-gray-700">Size</th>
                    <th class="text-right py-3 px-4 font-medium text-gray-700">Price</th>
                    <th class="text-right py-3 px-4 font-medium text-gray-700">£/sq ft</th>
                    <th class="text-center py-3 px-4 font-medium text-gray-700">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {#each development.pricing.examples as example}
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="py-4 px-4">{example.unit_label}</td>
                      <td class="text-center py-4 px-4">{example.beds}</td>
                      <td class="text-center py-4 px-4">{example.baths}</td>
                      <td class="text-center py-4 px-4">
                        {formatSqmToSqft(example.size_sqm)} sq ft
                        <span class="text-xs text-gray-500 block">{example.size_sqm} sqm</span>
                      </td>
                      <td class="text-right py-4 px-4 font-medium">{formatPrice(example.price)}</td>
                      <td class="text-right py-4 px-4">£{Math.round(example.price_psf).toLocaleString()}</td>
                      <td class="text-center py-4 px-4">
                        {#if example.source_url}
                          <a 
                            href={example.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="text-[#003d7a] hover:underline"
                          >
                            <ExternalLink class="w-4 h-4 inline" />
                          </a>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/if}
      </div>
    </section>
    {/if}

    <!-- Location & Transport Section -->
    {#if development.transport}
    <section id="location" class="scroll-mt-24 mb-16">
      <h2 class="text-3xl font-light mb-8">Location & Transport</h2>
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="text-xl font-light mb-6 flex items-center">
          <Train class="w-6 h-6 mr-3 text-[#003d7a]" />
          Transport Links
        </div>
        
        {#if development.transport.nearest_stations && development.transport.nearest_stations.length > 0}
          <div class="space-y-4 mb-6">
            {#each development.transport.nearest_stations as station}
              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center">
                  <Train class="w-5 h-5 mr-3 text-gray-500" />
                  <div>
                    <p class="font-medium">{station.name}</p>
                    <p class="text-sm text-gray-500">{station.mode}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-medium">{station.distance_m}m</p>
                  <p class="text-sm text-gray-500">~{Math.round(station.distance_m / 80)} min walk</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
        
        {#if development.transport.walkability_notes}
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-700 leading-relaxed">{development.transport.walkability_notes}</p>
          </div>
        {/if}
      </div>
    </section>
    {/if}

    <!-- Investment Analysis Section -->
    {#if development.rental || development.market_context || development.projection_scenario || development.ownership_costs}
    <section id="investment" class="scroll-mt-24 mb-16">
      <h2 class="text-3xl font-light mb-8">Investment Analysis</h2>
      <div class="space-y-8">
        <!-- Rental Yields -->
        {#if development.rental}
          <div class="bg-white rounded-lg shadow-md p-8">
            <div class="text-xl font-light mb-6">Rental Income Potential</div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <p class="text-sm text-gray-500 mb-2">Estimated Gross Yield</p>
                <p class="text-3xl font-light text-[#003d7a]">{development.rental.estimated_gross_yield_pct}%</p>
              </div>
              
              {#if development.rental.rent_examples && development.rental.rent_examples.length > 0}
                <div>
                  <p class="text-sm text-gray-500 mb-2">Example Rents</p>
                  {#each development.rental.rent_examples as rent}
                    <div class="mb-2">
                      <span class="font-medium">{rent.unit_label}:</span>
                      <span class="ml-2">£{rent.rent_gbp_pw.toLocaleString()}/week</span>
                      {#if rent.source_url}
                        <a 
                          href={rent.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="ml-2 text-[#003d7a] hover:underline text-sm"
                        >
                          View →
                        </a>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
            
            {#if development.rental.letting_notes}
              <div class="border-t border-gray-200 pt-6">
                <p class="text-sm text-gray-600 leading-relaxed">{development.rental.letting_notes}</p>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Market Context -->
        {#if development.market_context}
          <div class="bg-white rounded-lg shadow-md p-8">
            <div class="text-xl font-light mb-6">Market Context</div>
            
            <div class="space-y-4">
              {#if development.market_context.area_positioning}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Market Positioning</p>
                  <p class="text-gray-800 capitalize">{development.market_context.area_positioning}</p>
                </div>
              {/if}
              
              {#if development.market_context.typical_pcl_rent_growth_recent}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Recent Rent Growth</p>
                  <p class="text-gray-800">{development.market_context.typical_pcl_rent_growth_recent}</p>
                </div>
              {/if}
              
              {#if development.market_context.typical_prime_rental_yield_range_pct}
                <div>
                  <p class="text-sm text-gray-500 mb-1">Typical Prime Rental Yields</p>
                  <p class="text-gray-800">
                    {development.market_context.typical_prime_rental_yield_range_pct.min}% - {development.market_context.typical_prime_rental_yield_range_pct.max}%
                  </p>
                </div>
              {/if}
              
              {#if development.market_context.commentary}
                <div class="pt-4">
                  <p class="text-gray-700 leading-relaxed">{development.market_context.commentary}</p>
                </div>
              {/if}
              
              {#if development.market_context.context_source && development.market_context.context_source.length > 0}
                <div class="pt-4 border-t border-gray-200">
                  <p class="text-sm text-gray-500 mb-2">Sources</p>
                  {#each development.market_context.context_source as source}
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="block text-[#003d7a] hover:underline text-sm mb-1"
                    >
                      {source.label} →
                    </a>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Running Costs -->
        {#if development.ownership_costs}
          <div class="bg-white rounded-lg shadow-md p-8">
            <div class="text-xl font-light mb-6">Running Costs</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p class="text-sm text-gray-500 mb-2">Service Charge</p>
                <p class="text-2xl font-light">£{development.ownership_costs.service_charge_gbp_psf_pa}/sq ft per year</p>
                <p class="text-sm text-gray-600 mt-1">
                  Approx £{Math.round(development.ownership_costs.service_charge_gbp_psf_pa * 1000).toLocaleString()}/year for 1,000 sq ft
                </p>
              </div>
              
              <div>
                <p class="text-sm text-gray-500 mb-2">Ground Rent</p>
                <p class="text-2xl font-light">
                  {development.ownership_costs.ground_rent_gbp_pa > 0 
                    ? `£${development.ownership_costs.ground_rent_gbp_pa.toLocaleString()}/year`
                    : 'Peppercorn'}
                </p>
                {#if development.ownership_costs.ground_rent_review_terms}
                  <p class="text-sm text-gray-600 mt-1 capitalize">{development.ownership_costs.ground_rent_review_terms}</p>
                {/if}
              </div>
            </div>
            
            {#if development.ownership_costs.parking_costs_note}
              <div class="mt-6 pt-6 border-t border-gray-200">
                <p class="text-sm text-gray-500 mb-1">Parking</p>
                <p class="text-gray-700">{development.ownership_costs.parking_costs_note}</p>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Investment Projection -->
        {#if development.projection_scenario}
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-8">
            <div class="text-xl font-light mb-6 flex items-center">
              <Calculator class="w-6 h-6 mr-3 text-[#003d7a]" />
              5-Year Investment Projection
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div class="bg-white rounded-lg p-4 text-center">
                <p class="text-sm text-gray-500 mb-1">Gross Yield</p>
                <p class="text-2xl font-light text-[#003d7a]">{development.projection_scenario.outputs.gross_yield_pct}%</p>
              </div>
              <div class="bg-white rounded-lg p-4 text-center">
                <p class="text-sm text-gray-500 mb-1">Net Yield (est)</p>
                <p class="text-2xl font-light text-[#003d7a]">{development.projection_scenario.outputs.net_yield_est_pct}%</p>
              </div>
              <div class="bg-white rounded-lg p-4 text-center">
                <p class="text-sm text-gray-500 mb-1">5-Year Capital Growth</p>
                <p class="text-2xl font-light text-green-600">+{development.projection_scenario.outputs.five_year_capital_growth_pct}%</p>
              </div>
              <div class="bg-white rounded-lg p-4 text-center">
                <p class="text-sm text-gray-500 mb-1">5-Year Total Return</p>
                <p class="text-2xl font-light text-green-600">+{development.projection_scenario.outputs.five_year_total_return_pct}%</p>
              </div>
            </div>
            
            <details class="bg-white rounded-lg p-4">
              <summary class="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                View Assumptions
              </summary>
              <div class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Purchase Price:</span>
                  <span class="ml-2 font-medium">{formatPrice(development.projection_scenario.assumptions.purchase_price)}</span>
                </div>
                <div>
                  <span class="text-gray-500">Annual Rent:</span>
                  <span class="ml-2 font-medium">£{development.projection_scenario.assumptions.annual_rent_gbp.toLocaleString()}</span>
                </div>
                <div>
                  <span class="text-gray-500">Service Charge:</span>
                  <span class="ml-2 font-medium">£{development.projection_scenario.assumptions.service_charge_gbp_pa.toLocaleString()}/year</span>
                </div>
                <div>
                  <span class="text-gray-500">Void Allowance:</span>
                  <span class="ml-2 font-medium">{development.projection_scenario.assumptions.voids_pct}%</span>
                </div>
                <div>
                  <span class="text-gray-500">Rent Growth:</span>
                  <span class="ml-2 font-medium">{development.projection_scenario.assumptions.rent_growth_pct_pa}% p.a.</span>
                </div>
                <div>
                  <span class="text-gray-500">Price Growth:</span>
                  <span class="ml-2 font-medium">{development.projection_scenario.assumptions.price_growth_pct_pa}% p.a.</span>
                </div>
              </div>
            </details>
            
            {#if development.projection_scenario.disclaimer}
              <p class="text-xs text-gray-500 mt-4 italic">{development.projection_scenario.disclaimer}</p>
            {/if}
          </div>
        {/if}
      </div>
    </section>
    {/if}
  </div>
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