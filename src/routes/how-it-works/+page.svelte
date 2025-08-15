<script lang="ts">
  import { UserPlus, Search, Eye, HandHeart, Shield, Users, TrendingUp, CheckCircle, ArrowRight, Clock, Star } from 'lucide-svelte';
</script>

<svelte:head>
  <title>How It Works | Off Market Prime - Off Market Property Platform</title>
  <meta name="description" content="Discover how Off Market Prime connects buyers with exclusive off-market properties and helps sellers find qualified purchasers discreetly. Simple 3-step process." />
  <meta name="keywords" content="how it works, off market properties, property platform, exclusive properties, London property" />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-b from-gray-50 to-white py-16">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h1 class="text-4xl lg:text-5xl font-heading font-medium text-gray-900 mb-6">
      How Off Market Prime Works
    </h1>
    <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
      We connect discerning buyers with exclusive off-market properties and help sellers find qualified purchasers - all through our private, curated platform.
    </p>
  </div>
</section>

<!-- For Buyers Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">
        For Property Buyers
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Get exclusive access to premium properties before they reach the public market
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
      <!-- Step 1 -->
      <div class="text-center px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-blue rounded-full mb-8">
          <UserPlus class="h-8 w-8 text-white" />
        </div>
        <div class="mb-6">
          <span class="inline-block bg-luxury-blue text-white text-sm font-medium px-3 py-1 rounded-full mb-3">Step 1</span>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Sign Up & Tell Us Your Needs</h3>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Create your free account and complete our buyer profile. Tell us about your ideal property, budget, and preferred neighborhoods.
        </p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li>• Property type preferences</li>
          <li>• Budget range</li>
          <li>• Desired neighborhoods</li>
          <li>• Timeline to purchase</li>
        </ul>
      </div>

      <!-- Step 2 -->
      <div class="text-center px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-blue rounded-full mb-8">
          <Search class="h-8 w-8 text-white" />
        </div>
        <div class="mb-6">
          <span class="inline-block bg-luxury-blue text-white text-sm font-medium px-3 py-1 rounded-full mb-3">Step 2</span>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Get Matched With Properties</h3>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Our platform matches you with off-market properties that fit your criteria. Receive exclusive listings before they go public.
        </p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li>• Curated property recommendations</li>
          <li>• Off-market exclusive access</li>
          <li>• Detailed property information</li>
          <li>• Direct seller contact</li>
        </ul>
      </div>

      <!-- Step 3 -->
      <div class="text-center px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-luxury-blue rounded-full mb-8">
          <HandHeart class="h-8 w-8 text-white" />
        </div>
        <div class="mb-6">
          <span class="inline-block bg-luxury-blue text-white text-sm font-medium px-3 py-1 rounded-full mb-3">Step 3</span>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">View & Make Offers</h3>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Schedule viewings and make competitive offers with less competition than public market properties.
        </p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li>• Private property viewings</li>
          <li>• Direct seller communication</li>
          <li>• Reduced competition</li>
          <li>• Expert guidance support</li>
        </ul>
      </div>
    </div>

    <!-- CTA for Buyers -->
    <div class="text-center mt-12">
      <a href="/signup" class="inline-flex items-center px-8 py-3 bg-luxury-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        Start as a Buyer
        <ArrowRight class="ml-2 h-4 w-4" />
      </a>
    </div>
  </div>
</section>

<!-- For Sellers Section -->
<section class="py-16 bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">
        For Property Sellers
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Sell your property discreetly to our network of qualified, pre-vetted buyers
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
      <!-- Step 1 -->
      <div class="text-center px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-8">
          <Shield class="h-8 w-8 text-white" />
        </div>
        <div class="mb-6">
          <span class="inline-block bg-gray-900 text-white text-sm font-medium px-3 py-1 rounded-full mb-3">Step 1</span>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">List Your Property Privately</h3>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Submit your property details for our private listing. We'll create a confidential profile to share with qualified buyers only.
        </p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li>• Confidential listing process</li>
          <li>• Professional photography</li>
          <li>• Market valuation guidance</li>
          <li>• No public advertising</li>
        </ul>
      </div>

      <!-- Step 2 -->
      <div class="text-center px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-8">
          <Users class="h-8 w-8 text-white" />
        </div>
        <div class="mb-6">
          <span class="inline-block bg-gray-900 text-white text-sm font-medium px-3 py-1 rounded-full mb-3">Step 2</span>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Connect With Qualified Buyers</h3>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed">
          We match your property with our verified buyer network. All interested parties are pre-qualified and financially vetted.
        </p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li>• Pre-qualified buyer network</li>
          <li>• Financial verification</li>
          <li>• Serious inquiries only</li>
          <li>• Direct buyer communication</li>
        </ul>
      </div>

      <!-- Step 3 -->
      <div class="text-center px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-8">
          <TrendingUp class="h-8 w-8 text-white" />
        </div>
        <div class="mb-6">
          <span class="inline-block bg-gray-900 text-white text-sm font-medium px-3 py-1 rounded-full mb-3">Step 3</span>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Negotiate & Complete Sale</h3>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Receive competitive offers from motivated buyers. Complete your sale with professional support throughout the process.
        </p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li>• Competitive offer negotiations</li>
          <li>• Faster sale completion</li>
          <li>• Professional transaction support</li>
          <li>• Reduced marketing costs</li>
        </ul>
      </div>
    </div>

    <!-- CTA for Sellers -->
    <div class="text-center mt-12">
      <a href="/list-property" class="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
        List Your Property
        <ArrowRight class="ml-2 h-4 w-4" />
      </a>
    </div>
  </div>
</section>

<!-- Why Choose Us Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">
        Why Choose Off Market Prime?
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        The advantages of using our exclusive off-market property platform
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Advantage 1 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg mb-4">
          <Eye class="h-6 w-6 text-luxury-blue" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Exclusive Access</h3>
        <p class="text-gray-600 text-sm">
          Properties available only to our registered members before public listing
        </p>
      </div>

      <!-- Advantage 2 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg mb-4">
          <Clock class="h-6 w-6 text-luxury-blue" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Faster Process</h3>
        <p class="text-gray-600 text-sm">
          Reduced competition and faster decision-making for both buyers and sellers
        </p>
      </div>

      <!-- Advantage 3 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg mb-4">
          <Shield class="h-6 w-6 text-luxury-blue" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Verified Network</h3>
        <p class="text-gray-600 text-sm">
          All buyers and sellers are verified and qualified through our vetting process
        </p>
      </div>

      <!-- Advantage 4 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg mb-4">
          <Star class="h-6 w-6 text-luxury-blue" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Premium Service</h3>
        <p class="text-gray-600 text-sm">
          Dedicated support and guidance throughout your property journey
        </p>
      </div>
    </div>
  </div>
</section>

<!-- FAQ Section -->
<section class="py-16 bg-gray-50">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">
        Frequently Asked Questions
      </h2>
    </div>

    <div class="space-y-8">
      <!-- FAQ 1 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          What makes a property "off-market"?
        </h3>
        <p class="text-gray-600">
          Off-market properties are those not publicly advertised on traditional property portals like Rightmove or Zoopla. They're available exclusively to our registered network before (or instead of) public listing, giving buyers first access to premium opportunities.
        </p>
      </div>

      <!-- FAQ 2 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Is there a cost to join as a buyer?
        </h3>
        <p class="text-gray-600">
          Registration and access to our property listings is completely free for buyers. We're paid by sellers when transactions complete, so there are no upfront costs or membership fees for purchasers.
        </p>
      </div>

      <!-- FAQ 3 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          How are buyers and sellers verified?
        </h3>
        <p class="text-gray-600">
          All buyers provide proof of funds or mortgage pre-approval. Sellers verify property ownership and provide necessary legal documentation. This ensures all parties are genuine and qualified to proceed with transactions.
        </p>
      </div>

      <!-- FAQ 4 -->
      <div class="bg-white rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          What areas do you cover?
        </h3>
        <p class="text-gray-600">
          We currently focus on premium London properties across Central, West, and North London including Mayfair, Chelsea, Kensington, Hampstead, and other prestigious neighborhoods. We're expanding to cover more areas based on demand.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Final CTA Section -->
<section class="py-16 bg-luxury-charcoal text-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl font-heading font-medium mb-4">
      Ready to Get Started?
    </h2>
    <p class="text-lg text-gray-300 mb-8">
      Join our exclusive network of buyers and sellers today
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/signup" class="inline-flex items-center justify-center px-8 py-3 bg-luxury-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        Sign Up as Buyer
      </a>
      <a href="/list-property" class="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium">
        List Your Property
      </a>
    </div>
  </div>
</section>
