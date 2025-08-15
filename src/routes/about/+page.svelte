<script lang="ts">
  import { Shield, Users, TrendingUp, Award } from 'lucide-svelte';
</script>

<svelte:head>
  <title>About Us | Off Market Prime - London's Off-Market Property Platform</title>
  <meta name="description" content="Off Market Prime connects discerning buyers with exclusive off-market properties in London's most prestigious neighborhoods. Discover our story and mission." />
  <meta name="keywords" content="about Off Market Prime, off market property London, exclusive property platform" />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-b from-gray-50 to-white py-16">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h1 class="text-4xl lg:text-5xl font-heading font-medium text-gray-900 mb-6">
      About Off Market Prime
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Redefining how London's finest properties are bought and sold - privately, efficiently, and exclusively.
    </p>
  </div>
</section>

<!-- Mission Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="prose prose-lg max-w-none text-gray-600">
      <p class="text-lg leading-relaxed mb-8">
        Off Market Prime was founded with a simple vision: to create a better way for London's property market to operate at the highest level. We recognized that both buyers and sellers of premium properties needed a more discreet, efficient alternative to traditional estate agency.
      </p>
      
      <p class="text-lg leading-relaxed mb-8">
        Our platform connects serious buyers with exclusive properties before they reach the public market. For sellers, we offer complete privacy and access to pre-qualified purchasers. For buyers, we provide first access to properties that match their exact requirements.
      </p>

      <p class="text-lg leading-relaxed">
        Operating across London's most sought-after neighborhoods - from Mayfair to Chelsea, Kensington to Hampstead - we've built a trusted network of property owners, buyers, and partners who value discretion, expertise, and results.
      </p>
    </div>
  </div>
</section>

<!-- Values Section -->
<section class="py-16 bg-gray-50">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-heading font-medium text-gray-900 mb-12 text-center">
      Our Core Values
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Value 1 -->
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg">
            <Shield class="h-6 w-6 text-luxury-blue" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Absolute Discretion</h3>
          <p class="text-gray-600">
            Your privacy is paramount. Every transaction is handled with complete confidentiality.
          </p>
        </div>
      </div>

      <!-- Value 2 -->
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg">
            <Users class="h-6 w-6 text-luxury-blue" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Verified Network</h3>
          <p class="text-gray-600">
            Every buyer is pre-qualified, every property is verified. No time wasters, only serious participants.
          </p>
        </div>
      </div>

      <!-- Value 3 -->
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg">
            <TrendingUp class="h-6 w-6 text-luxury-blue" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Market Expertise</h3>
          <p class="text-gray-600">
            Deep knowledge of London's property market ensures accurate valuations and successful transactions.
          </p>
        </div>
      </div>

      <!-- Value 4 -->
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg">
            <Award class="h-6 w-6 text-luxury-blue" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Premium Service</h3>
          <p class="text-gray-600">
            White-glove service from initial contact through to completion, with dedicated support throughout.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="py-16 bg-luxury-charcoal text-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl font-heading font-medium mb-4">
      Experience the Difference
    </h2>
    <p class="text-lg text-gray-300 mb-8">
      Join London's premier off-market property platform today
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/signup" class="inline-flex items-center justify-center px-8 py-3 bg-luxury-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        Find Properties
      </a>
      <a href="/list-property" class="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium">
        List Your Property
      </a>
    </div>
  </div>
</section>
