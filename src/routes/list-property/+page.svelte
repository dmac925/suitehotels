<script lang="ts">
  import { Home, Camera, MapPin, FileText, Shield, TrendingUp, Clock, Users, CheckCircle, ArrowRight } from 'lucide-svelte';
  
  let propertyType = '';
  let bedrooms = '';
  let bathrooms = '';
  let postcode = '';
  let priceExpectation = '';
  let timeframe = '';
  let ownerName = '';
  let email = '';
  let phone = '';
  let additionalInfo = '';
  
  function handleSubmit(e: Event) {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
  }
</script>

<svelte:head>
  <title>List Your Property | Off Market Prime - Sell Off Market</title>
  <meta name="description" content="List your London property discreetly with Off Market Prime. Connect with pre-qualified buyers and sell off-market with complete privacy and professional support." />
  <meta name="keywords" content="list property, sell off market, private property sale, London property listing" />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-b from-gray-50 to-white py-12">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h1 class="text-4xl lg:text-5xl font-heading font-medium text-gray-900 mb-6">
      List Your Property Off-Market
    </h1>
    <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
      Sell your property discreetly to our network of qualified buyers. No public listings, no disruption, just serious buyers.
    </p>
  </div>
</section>

<!-- Benefits Section -->
<section class="py-12 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      <!-- Benefit 1 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg mb-4">
          <Shield class="h-6 w-6 text-luxury-blue" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Complete Privacy</h3>
        <p class="text-gray-600 text-sm">
          Your property stays off public portals. Only qualified buyers see your listing.
        </p>
      </div>

      <!-- Benefit 2 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg mb-4">
          <Users class="h-6 w-6 text-luxury-blue" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Pre-Qualified Buyers</h3>
        <p class="text-gray-600 text-sm">
          All buyers are verified with proof of funds before viewing your property.
        </p>
      </div>

      <!-- Benefit 3 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg mb-4">
          <Clock class="h-6 w-6 text-luxury-blue" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Faster Sales</h3>
        <p class="text-gray-600 text-sm">
          Motivated buyers mean quicker decisions and faster completion times.
        </p>
      </div>

      <!-- Benefit 4 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg mb-4">
          <TrendingUp class="h-6 w-6 text-luxury-blue" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Best Price</h3>
        <p class="text-gray-600 text-sm">
          Create competition among serious buyers to achieve your property's true value.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Form Section -->
<section class="py-12 bg-gray-50">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-lg shadow-sm p-8">
      <div class="mb-8 text-center">
        <h2 class="text-2xl font-heading font-medium text-gray-900 mb-2">
          Tell Us About Your Property
        </h2>
        <p class="text-gray-600">
          Complete the form below and we'll contact you within 24 hours to discuss your property
        </p>
      </div>

      <form on:submit={handleSubmit} class="space-y-6">
        <!-- Property Details Section -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home class="h-5 w-5 mr-2 text-luxury-blue" />
            Property Details
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Property Type -->
            <div>
              <label for="propertyType" class="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                id="propertyType"
                bind:value={propertyType}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                <option value="">Select property type</option>
                <option value="house">House</option>
                <option value="flat">Flat</option>
                <option value="penthouse">Penthouse</option>
                <option value="duplex">Duplex</option>
                <option value="maisonette">Maisonette</option>
                <option value="mews">Mews House</option>
              </select>
            </div>

            <!-- Bedrooms -->
            <div>
              <label for="bedrooms" class="block text-sm font-medium text-gray-700 mb-2">
                Number of Bedrooms
              </label>
              <select
                id="bedrooms"
                bind:value={bedrooms}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                <option value="">Select bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5">5 Bedrooms</option>
                <option value="6+">6+ Bedrooms</option>
              </select>
            </div>

            <!-- Bathrooms -->
            <div>
              <label for="bathrooms" class="block text-sm font-medium text-gray-700 mb-2">
                Number of Bathrooms
              </label>
              <select
                id="bathrooms"
                bind:value={bathrooms}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                <option value="">Select bathrooms</option>
                <option value="1">1 Bathroom</option>
                <option value="2">2 Bathrooms</option>
                <option value="3">3 Bathrooms</option>
                <option value="4">4 Bathrooms</option>
                <option value="5+">5+ Bathrooms</option>
              </select>
            </div>

            <!-- Postcode -->
            <div>
              <label for="postcode" class="block text-sm font-medium text-gray-700 mb-2">
                Property Postcode
              </label>
              <input
                type="text"
                id="postcode"
                bind:value={postcode}
                required
                placeholder="e.g., W1K 1AA"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              />
            </div>
          </div>
        </div>

        <!-- Sale Details Section -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText class="h-5 w-5 mr-2 text-luxury-blue" />
            Sale Details
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Price Expectation -->
            <div>
              <label for="priceExpectation" class="block text-sm font-medium text-gray-700 mb-2">
                Price Expectation
              </label>
              <select
                id="priceExpectation"
                bind:value={priceExpectation}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                <option value="">Select price range</option>
                <option value="500k-1m">£500,000 - £1,000,000</option>
                <option value="1m-2m">£1,000,000 - £2,000,000</option>
                <option value="2m-3m">£2,000,000 - £3,000,000</option>
                <option value="3m-5m">£3,000,000 - £5,000,000</option>
                <option value="5m-10m">£5,000,000 - £10,000,000</option>
                <option value="10m+">£10,000,000+</option>
              </select>
            </div>

            <!-- Timeframe -->
            <div>
              <label for="timeframe" class="block text-sm font-medium text-gray-700 mb-2">
                Selling Timeframe
              </label>
              <select
                id="timeframe"
                bind:value={timeframe}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              >
                <option value="">Select timeframe</option>
                <option value="asap">As soon as possible</option>
                <option value="1-3months">1-3 months</option>
                <option value="3-6months">3-6 months</option>
                <option value="6-12months">6-12 months</option>
                <option value="exploring">Just exploring options</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contact Details Section -->
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users class="h-5 w-5 mr-2 text-luxury-blue" />
            Your Contact Details
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label for="ownerName" class="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="ownerName"
                bind:value={ownerName}
                required
                placeholder="John Smith"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                bind:value={email}
                required
                placeholder="john@example.com"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              />
            </div>

            <!-- Phone -->
            <div class="md:col-span-2">
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                bind:value={phone}
                required
                placeholder="+44 20 1234 5678"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue"
              />
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div>
          <label for="additionalInfo" class="block text-sm font-medium text-gray-700 mb-2">
            Additional Information (Optional)
          </label>
          <textarea
            id="additionalInfo"
            bind:value={additionalInfo}
            rows={4}
            placeholder="Tell us about any special features, recent renovations, or other details that make your property unique..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-blue focus:border-luxury-blue resize-none"
          ></textarea>
        </div>

        <!-- Privacy Notice -->
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-600">
            <Shield class="inline h-4 w-4 mr-1 text-luxury-blue" />
            Your information is kept strictly confidential. We will only share your property details with pre-qualified buyers who sign a non-disclosure agreement.
          </p>
        </div>

        <!-- Submit Button -->
        <div class="text-center">
          <button
            type="submit"
            class="inline-flex items-center px-8 py-4 bg-luxury-blue text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Submit Property Listing
            <ArrowRight class="ml-2 h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  </div>
</section>

<!-- What Happens Next Section -->
<section class="py-12 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">
        What Happens Next?
      </h2>
      <p class="text-lg text-gray-600">
        Our simple process ensures a smooth, confidential sale
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Step 1 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-blue text-white rounded-full mb-4 font-semibold">
          1
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Property Review</h3>
        <p class="text-gray-600 text-sm">
          We'll contact you within 24 hours to discuss your property and arrange a confidential valuation.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-blue text-white rounded-full mb-4 font-semibold">
          2
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Buyer Matching</h3>
        <p class="text-gray-600 text-sm">
          We'll match your property with qualified buyers from our network who are looking for similar properties.
        </p>
      </div>

      <!-- Step 3 -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-blue text-white rounded-full mb-4 font-semibold">
          3
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Private Viewings</h3>
        <p class="text-gray-600 text-sm">
          Arrange discreet viewings with serious buyers and receive competitive offers.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Trust Section -->
<section class="py-12 bg-gray-50">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <CheckCircle class="h-8 w-8 text-luxury-blue mx-auto mb-3" />
        <h3 class="font-semibold text-gray-900 mb-1">No Obligation</h3>
        <p class="text-sm text-gray-600">Free valuation with no commitment to sell</p>
      </div>
      <div>
        <CheckCircle class="h-8 w-8 text-luxury-blue mx-auto mb-3" />
        <h3 class="font-semibold text-gray-900 mb-1">Expert Support</h3>
        <p class="text-sm text-gray-600">Professional guidance throughout the process</p>
      </div>
      <div>
        <CheckCircle class="h-8 w-8 text-luxury-blue mx-auto mb-3" />
        <h3 class="font-semibold text-gray-900 mb-1">Competitive Fees</h3>
        <p class="text-sm text-gray-600">Lower fees than traditional estate agents</p>
      </div>
    </div>
  </div>
</section>
