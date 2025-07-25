<script lang="ts">
  import { Eye, Lock, MapPin, Users, TrendingUp, Shield } from 'lucide-svelte';
  
  const features = [
    {
      icon: Lock,
      title: 'Exclusive Access',
      description: 'Members-only off-market properties not available elsewhere'
    },
    {
      icon: Shield,
      title: 'Verified Listings',
      description: 'Every property is thoroughly vetted by our expert team'
    },
    {
      icon: Users,
      title: 'Trusted Network',
      description: 'Access to London\'s most reputable estate agents and developers'
    },
    {
      icon: TrendingUp,
      title: 'Market Intelligence',
      description: 'Comprehensive market data and investment insights'
    }
  ];

  const neighborhoods = [
    { name: 'Mayfair', properties: 23, href: '/london/mayfair' },
    { name: 'Chelsea', properties: 18, href: '/london/chelsea' },
    { name: 'Hampstead', properties: 15, href: '/london/hampstead' },
    { name: 'Kensington', properties: 21, href: '/london/kensington' },
    { name: 'Belgravia', properties: 12, href: '/london/belgravia' },
    { name: 'Notting Hill', properties: 16, href: '/london/notting-hill' }
  ];
</script>

<svelte:head>
  <title>OffMarketEdit - Luxury Off Market Properties in London</title>
  <meta name="description" content="Your inside track to off-market homes in London's most prestigious neighbourhoods. Members-only access to verified premium properties." />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-luxury-pearl to-white">
  <div class="absolute inset-0 bg-black/5"></div>
  <div class="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
    <div class="text-center animate-fade-in">
      <h1 class="luxury-heading text-4xl sm:text-5xl lg:text-6xl mb-6">
        Your inside track to
        <span class="text-luxury-gold block">off-market homes</span>
      </h1>
      <p class="mx-auto max-w-2xl text-xl luxury-text mb-8">
        Off-market homes in London's most prestigious neighbourhoods. 
        Access exclusive opportunities before they reach the public market.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a href="/signup" class="luxury-button rounded-full text-lg px-10 py-4">
          Join Exclusive Access
        </a>
        <a href="/london" class="inline-flex items-center text-lg font-medium text-luxury-charcoal hover:text-luxury-gold transition-colors">
          Browse Properties
          <MapPin class="ml-2 h-5 w-5" />
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-24 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="luxury-heading text-3xl lg:text-4xl mb-4">
        How OffMarketEdit Works
      </h2>
      <p class="max-w-2xl mx-auto text-lg luxury-text">
        We provide unparalleled access to London's most exclusive property market
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each features as feature}
        <div class="luxury-card rounded-lg p-6 text-center animate-slide-up">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-champagne rounded-full mb-4">
            <svelte:component this={feature.icon} class="h-8 w-8 text-luxury-gold" />
          </div>
          <h3 class="luxury-heading text-lg mb-2">{feature.title}</h3>
          <p class="luxury-text">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Neighborhoods Section -->
<section class="py-24 bg-luxury-pearl">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="luxury-heading text-3xl lg:text-4xl mb-4">
        Prime London Locations
      </h2>
      <p class="max-w-2xl mx-auto text-lg luxury-text">
        Explore off-market properties in London's most sought-after neighbourhoods
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each neighborhoods as neighborhood}
        <a href={neighborhood.href} class="luxury-card rounded-lg p-6 hover:scale-105 transition-all duration-300 block">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="luxury-heading text-lg mb-1">{neighborhood.name}</h3>
              <p class="text-sm luxury-text">{neighborhood.properties} exclusive properties</p>
            </div>
            <div class="text-right">
              <div class="w-12 h-12 bg-luxury-champagne rounded-full flex items-center justify-center">
                <MapPin class="h-6 w-6 text-luxury-gold" />
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="py-24 bg-luxury-charcoal text-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="luxury-heading text-3xl lg:text-4xl mb-4 text-white">
      Ready to Discover Exclusive Properties?
    </h2>
    <p class="max-w-2xl mx-auto text-lg text-gray-300 mb-8">
      Join our exclusive community and gain access to off-market  properties 
      in London's most prestigious postcodes.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <a href="/signup" class="bg-luxury-gold text-luxury-black px-10 py-4 rounded-full font-semibold hover:bg-luxury-champagne transition-colors duration-300">
        Start Your Search
      </a>
      <div class="flex items-center text-gray-300">
        <Eye class="h-5 w-5 mr-2" />
        <span>View sample properties without registration</span>
      </div>
    </div>
  </div>
</section>
