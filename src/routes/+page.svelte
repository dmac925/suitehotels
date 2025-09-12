<script lang="ts">
  import { Eye, Lock, MapPin, Users, TrendingUp, Shield, Home, Sparkles, ArrowRight, Building, Star, CheckCircle, Bed, Utensils, Wifi, Car } from 'lucide-svelte';
  


  // Hotel features for guests
  const guestFeatures = [
    {
      icon: Sparkles,
      title: 'Curated luxury experiences',
      description: 'Each suite is thoughtfully designed with premium amenities and personalized service'
    },
    {
      icon: Shield,
      title: 'Uncompromising quality',
      description: 'Every property meets our rigorous standards for comfort, cleanliness, and excellence'
    },
    {
      icon: Eye,
      title: 'Unique locations',
      description: 'Discover exceptional suites in prime destinations you won\'t find elsewhere'
    }
  ];

  // Hotel features for owners
  const ownerFeatures = [
    {
      icon: TrendingUp,
      title: 'Maximize revenue potential',
      description: 'Our platform optimizes pricing and occupancy to deliver exceptional returns'
    },
    {
      icon: Users,
      title: 'Premium guest network',
      description: 'Access our community of discerning travelers seeking luxury accommodations'
    },
    {
      icon: Shield,
      title: 'Professional management',
      description: 'Full-service property management with 24/7 guest support and maintenance'
    }
  ];

  // Hotel destinations
  const destinations = [
    {
      region: 'Available Now',
      areas: [
        { name: 'London', link: '/london' },
        { name: 'New York', link: '/new-york' },
        { name: 'Dubai', link: '/dubai' },
        { name: 'Paris', link: '/paris' }
      ],
      color: 'text-blue-600'
    },
    {
      region: 'Coming Soon',
      areas: [
        { name: 'Tokyo', link: null },
        { name: 'Sydney', link: null },
        { name: 'Malibu', link: null },
        { name: 'Aspen', link: null }
      ],
      color: 'text-gray-400'
    }
  ];

  // Guest testimonials
  const testimonials = [
    {
      quote: "Suite Theory exceeded every expectation. The Manhattan penthouse was flawless, and the concierge service made our anniversary trip unforgettable.",
      author: "Sarah & James",
      location: "Manhattan Penthouse",
      rating: 5
    },
    {
      quote: "From the moment we arrived at our Malibu suite, we knew this was special. The attention to detail and oceanfront location created the perfect getaway.",
      author: "Michael Chen",
      location: "Malibu Oceanfront",
      rating: 5
    },
    {
      quote: "As frequent travelers, we've stayed everywhere. Suite Theory's properties are in a league of their own - true luxury with authentic local character.",
      author: "Alexandra Wright",
      location: "Regular Guest",
      rating: 5
    }
  ];


</script>

<svelte:head>
  <title>Luxury Suite Hotels & Accommodations | Suite Theory</title>
  <meta name="description" content="Suite Theory - Discover exceptional luxury suites and boutique hotels in the world's most desirable destinations. Curated experiences, premium amenities." />
  <meta name="keywords" content="luxury hotels, boutique suites, premium accommodations, luxury travel, suite hotels, exclusive properties, high-end lodging" />
  <meta property="og:title" content="Suite Theory - Luxury Suite Hotels" />
  <meta property="og:description" content="Experience extraordinary luxury accommodations in prime destinations worldwide. Curated suites with uncompromising quality and service." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<!-- Hero Section with Video Background -->
<section class="relative overflow-hidden">
  <!-- Video Background -->
  <div class="absolute inset-0 w-full h-full">
    <div class="relative w-full h-full overflow-hidden">
      <iframe
        src="https://customer-sf4ifbppskki29nb.cloudflarestream.com/e6cb6e525b56acaf5cc75fb2b10345d7/iframe?muted=true&preload=true&loop=true&autoplay=true"
        loading="lazy"
        class="absolute top-1/2 left-1/2"
        style="border: none; transform: translate(-50%, -50%); width: max(100vw, calc(100vh * 16/9)); height: max(100vh, calc(100vw * 9/16));"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowfullscreen="true"
        title="Introduction Video">
      </iframe>
    </div>
  </div>
  
  <!-- Overlay for better text readability -->
  <div class="absolute inset-0 bg-black/40"></div>
  
  <!-- Content -->
  <div class="relative z-10 mx-auto max-w-4xl px-4 pt-32 pb-32 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-white mb-6">
        Luxury Suite Hotels
        <span class="block font-medium text-luxury-white">redefined</span>
      </h1>
      <p class="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
        Experience extraordinary accommodations in the world's most desirable destinations
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href="/london" 
          class="px-8 py-4 bg-luxury-blue text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-lg shadow-lg"
        >
          Book your stay
        </a>
        <a 
          href="/london" 
          class="px-8 py-4 bg-white text-gray-900 border-2 border-white rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium text-lg shadow-lg"
        >
          Browse properties
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Guest & Owner Value Props -->
<section class="py-20 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-16">
      <!-- Guest Section -->
      <div>
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 text-sm font-medium text-gray-900 bg-gray-100 px-4 py-2 rounded-full mb-4">
            <Bed class="h-4 w-4" />
            <span>For Guests</span>
          </div>
          <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Ready for an unforgettable stay?</h2>
          <p class="text-lg text-gray-600">
            Discover luxury suites that redefine hospitality. Our curated collection offers exceptional accommodations in the world's most sought-after destinations.
          </p>
        </div>
        
        <div class="space-y-6">
          {#each guestFeatures as feature}
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
          <a href="/london" class="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-luxury-blue transition-colors">
            Book your suite
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>
      </div>
      
      <!-- Owner Section -->
      <div>
        <div class="mb-8">
          <div class="inline-flex items-center gap-2 text-sm font-medium text-gray-900 bg-gray-100 px-4 py-2 rounded-full mb-4">
            <Building class="h-4 w-4" />
            <span>For Property Owners</span>
          </div>
          <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Ready to maximize your returns?</h2>
          <p class="text-lg text-gray-600">
            Transform your luxury property into a premier hospitality destination. Our platform connects you with discerning guests while maximizing your investment potential.
          </p>
        </div>
        
        <div class="space-y-6">
          {#each ownerFeatures as feature}
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
          <a href="/london" class="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-luxury-blue transition-colors">
            Partner with us
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Destinations -->
<section class="py-20 bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Exceptional destinations worldwide</h2>
      <p class="text-lg text-gray-600 max-w-3xl mx-auto">
        From vibrant cities to serene retreats, discover luxury suites in the world's most coveted locations. 
        Each destination offers unique experiences crafted for the discerning traveler.
      </p>
    </div>
    
    <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {#each destinations as destination}
        <div>
          <h3 class="text-lg font-medium {destination.color} mb-4">{destination.region}</h3>
          <div class="space-y-2">
            {#each destination.areas as area}
              {#if area.link}
                <a href="{area.link}" 
                   class="block text-gray-700 hover:text-gray-900 hover:translate-x-1 transition-all">
                  {area.name}
                </a>
              {:else}
                <span class="block text-gray-400 cursor-not-allowed">
                  {area.name}
                </span>
              {/if}
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
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Trusted by discerning travelers</h2>
      <p class="text-lg text-gray-600">Discover what makes Suite Theory exceptional through our guests' experiences</p>
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
      Your luxury travel companion.
    </h2>
    <p class="text-lg text-gray-300 mb-8">
      Experience extraordinary hospitality through our curated collection of premium suites worldwide.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <a href="/london" class="bg-luxury-blue text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
        Book Suite Theory
      </a>
      <div class="flex items-center gap-2 text-gray-400">
        <CheckCircle class="h-5 w-5" />
        <span>Exceptional experiences guaranteed</span>
      </div>
    </div>
  </div>
</section>
