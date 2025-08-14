<script lang="ts">
  import { Eye, Lock, MapPin, Users, TrendingUp, Shield, Home, Sparkles, ArrowRight, Building, Star, CheckCircle } from 'lucide-svelte';
  


  // Features for buyers
  const buyerFeatures = [
    {
      icon: Eye,
      title: 'Discover hidden opportunities',
      description: 'Explore premium properties that never reach traditional listing platforms'
    },
    {
      icon: Sparkles,
      title: 'Smart property matching',
      description: 'Advanced algorithms connect you with homes that fit your unique criteria'
    },
    {
      icon: Shield,
      title: 'Professionally authenticated',
      description: 'Each listing undergoes rigorous verification by our property specialists'
    }
  ];

  // Features for sellers
  const sellerFeatures = [
    {
      icon: Lock,
      title: 'Market your property discreetly',
      description: 'Explore buyer interest without public exposure or marketing history'
    },
    {
      icon: Users,
      title: 'Pre-vetted buyer network',
      description: 'Access our exclusive community of financially qualified purchasers'
    },
    {
      icon: TrendingUp,
      title: 'Optimize value & timing',
      description: 'Secure exceptional offers through strategic private market positioning'
    }
  ];

  // Area groups
  const areaGroups = [
    {
      region: 'Central',
      areas: ['Mayfair', 'Belgravia', 'Marylebone', 'Knightsbridge', 'Westminster', 'Covent Garden'],
      color: 'text-blue-600'
    },
    {
      region: 'West',
      areas: ['Chelsea', 'Kensington', 'Notting Hill', 'Holland Park', 'Fulham', 'Chiswick'],
      color: 'text-purple-600'
    },
    {
      region: 'North',
      areas: ['Hampstead', 'Primrose Hill', 'St John\'s Wood', 'Highgate', 'Islington', 'Camden'],
      color: 'text-green-600'
    },
    {
      region: 'South West',
      areas: ['Battersea', 'Clapham', 'Wandsworth', 'Wimbledon', 'Richmond', 'Barnes'],
      color: 'text-orange-600'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "OffMarketPrime's intelligent matching system led us to our perfect Belgravia residence. Their recommendations opened our eyes to possibilities we hadn't imagined.",
      author: "Sarah & James",
      location: "Belgravia",
      rating: 5
    },
    {
      quote: "Within three weeks, we'd sold our Chelsea property through their private network. No viewings circus, just serious buyers with genuine interest.",
      author: "Michael Chen",
      location: "Chelsea",
      rating: 5
    },
    {
      quote: "The exclusive access to pre-market opportunities has transformed my investment strategy. OffMarketPrime delivers insights you simply can't get elsewhere.",
      author: "Alexandra Wright",
      location: "Investment Portfolio",
      rating: 5
    }
  ];


</script>

<svelte:head>
  <title>Off Market Properties For Sale | Off Market Prime</title>
  <meta name="description" content="Off Market Prime - Your inside track to off-market homes. Discover premium properties in Hampstead, Chelsea, Mayfair and beyond." />
  <meta name="keywords" content="off market properties, luxury properties london, off market london, off market hampstead, off market chelsea, exclusive properties" />
  <meta property="og:title" content="OffMarketPrime - Off Market Homes" />
  <meta property="og:description" content="Exclusive access to luxury off-market properties in London's most prestigious neighbourhoods." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<!-- Hero Section with Search -->
<section class="relative bg-gradient-to-b from-gray-50 to-white">
  <div class="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-gray-900 mb-4">
        Off Market Properties
        <span class="block font-medium text-luxury-blue">marketplace</span>
      </h1>
      <p class="text-xl text-gray-600 mb-2">
        Exclusive access to luxury homes before they reach the public market
      </p>
      

    </div>

    <!-- Action Buttons -->
    <div class="max-w-2xl mx-auto">
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="/signup" 
          class="px-8 py-4 bg-luxury-blue text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-lg"
        >
          Sign up for access
        </a>
        <a 
          href="/list-property" 
          class="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium text-lg"
        >
          Schedule a free valuation
        </a>
      </div>
      
      <p class="text-center mt-8 text-gray-600">
        Discover exceptional properties through our curated network of premium listings and pre-market opportunities not found on Rightmove or Zoopla.
      </p>
    </div>
  </div>
</section>

<!-- Buyer & Seller Value Props -->
<section class="py-20 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-16">
      <!-- Buyer Section -->
      <div>
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 text-sm font-medium text-gray-900 bg-gray-100 px-4 py-2 rounded-full mb-4">
            <Home class="h-4 w-4" />
            <span>For Buyers</span>
          </div>
          <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Ready to find your perfect home?</h2>
          <p class="text-lg text-gray-600">
            Gain early access to London's most desirable properties. Our intelligent platform connects you with exclusive opportunities tailored to your preferences.
          </p>
        </div>
        
        <div class="space-y-6">
          {#each buyerFeatures as feature}
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svelte:component this={feature.icon} class="h-6 w-6 text-gray-900" />
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p class="text-gray-600">{feature.description}</p>
              </div>
            </div>
          {/each}
        </div>
        
        <div class="mt-8">
          <a href="/signup" class="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-luxury-blue transition-colors">
            Explore properties
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>
      </div>
      
      <!-- Seller Section -->
      <div>
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 text-sm font-medium text-gray-900 bg-gray-100 px-4 py-2 rounded-full mb-4">
            <Building class="h-4 w-4" />
            <span>For Sellers</span>
          </div>
          <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Ready to sell discretely?</h2>
          <p class="text-lg text-gray-600">
            Explore market interest confidentially while connecting with our network of pre-qualified, motivated buyers.
          </p>
        </div>
        
        <div class="space-y-6">
          {#each sellerFeatures as feature}
            <div class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svelte:component this={feature.icon} class="h-6 w-6 text-gray-900" />
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p class="text-gray-600">{feature.description}</p>
              </div>
            </div>
          {/each}
        </div>
        
        <div class="mt-8">
          <a href="/signup" class="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-luxury-blue transition-colors">
            Sell privately
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Coverage Areas -->
<section class="py-20 bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Expanding across London's prime areas</h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        Our network spans London's most sought-after neighborhoods, with new areas added regularly. 
        Browse properties by location to discover your next home.
      </p>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each areaGroups as group}
        <div>
          <h3 class="text-lg font-medium {group.color} mb-4">{group.region}</h3>
          <div class="space-y-2">
            {#each group.areas as area}
              <a href="/london/{area.toLowerCase().replace(' ', '-')}" 
                 class="block text-gray-700 hover:text-gray-900 hover:translate-x-1 transition-all">
                {area}
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Testimonials -->
<section class="py-20 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Trusted by discerning clients</h2>
      <p class="text-lg text-gray-600">Hear from members who've found success through our platform</p>
    </div>
    
    <div class="grid md:grid-cols-3 gap-8">
      {#each testimonials as testimonial}
        <div class="bg-gray-50 rounded-2xl p-8">
          <div class="flex gap-1 mb-4">
            {#each Array(testimonial.rating) as _}
              <Star class="h-5 w-5 text-blue-500 fill-current" />
            {/each}
          </div>
          <p class="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
          <div>
            <p class="font-medium text-gray-900">{testimonial.author}</p>
            <p class="text-sm text-gray-600">{testimonial.location}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Final CTA -->
<section class="py-20 bg-gray-900 text-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl font-heading font-medium mb-4">
      Your personal property concierge.
    </h2>
    <p class="text-lg text-gray-300 mb-8">
      Experience personalized property discovery through our intelligent matching technology.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <a href="/signup" class="bg-luxury-blue text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
        Join OffMarketPrime
      </a>
      <div class="flex items-center gap-2 text-gray-400">
        <CheckCircle class="h-5 w-5" />
        <span>Free for buyers</span>
      </div>
    </div>
  </div>
</section>
