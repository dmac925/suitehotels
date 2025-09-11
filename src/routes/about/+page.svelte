<script lang="ts">
  import { Star, MapPin, Calendar, Award } from 'lucide-svelte';
</script>

<svelte:head>
  <title>About Us | SuiteTheory - Discover the World's Most Luxurious Hotel Suites</title>
  <meta name="description" content="SuiteTheory curates exceptional luxury hotel suites and experiences across the world's finest destinations. Discover our story and passion for luxury hospitality." />
  <meta name="keywords" content="about SuiteTheory, luxury hotel suites, premium accommodations, luxury travel" />
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-b from-gray-50 to-white py-16">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h1 class="text-4xl lg:text-5xl font-heading font-medium text-gray-900 mb-6">
      About SuiteTheory
    </h1>
    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
      Curating the world's most exceptional luxury hotel suites and experiences for discerning travelers.
    </p>
  </div>
</section>

<!-- Mission Section -->
<section class="py-16 bg-white">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <div class="prose prose-lg max-w-none text-gray-600">
      <p class="text-lg leading-relaxed mb-8">
        SuiteTheory was born from a passion for exceptional hospitality and a belief that luxury travel should be effortless. We recognized that discerning travelers needed more than just a booking platform - they needed a curator who understands the art of exceptional accommodation.
      </p>
      
      <p class="text-lg leading-relaxed mb-8">
        Our platform showcases carefully selected luxury hotel suites from the world's finest establishments. Each property is chosen for its unique character, impeccable service, and ability to create unforgettable experiences. We don't just show you rooms - we reveal destinations.
      </p>

      <p class="text-lg leading-relaxed">
        From iconic city landmarks to hidden luxury retreats, we've built relationships with premier hotels across the globe. Whether you're seeking a palatial suite overlooking Central Park or an intimate hideaway in the Cotswolds, SuiteTheory connects you with accommodations that exceed expectations.
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
            <Star class="h-6 w-6 text-luxury-blue" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Curated Excellence</h3>
          <p class="text-gray-600">
            Every suite is personally selected for its exceptional quality, service, and unique character.
          </p>
        </div>
      </div>

      <!-- Value 2 -->
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg">
            <MapPin class="h-6 w-6 text-luxury-blue" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Global Reach</h3>
          <p class="text-gray-600">
            From iconic city centers to exclusive retreats, we showcase luxury suites in the world's finest destinations.
          </p>
        </div>
      </div>

      <!-- Value 3 -->
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-lightblue rounded-lg">
            <Calendar class="h-6 w-6 text-luxury-blue" />
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Hospitality Expertise</h3>
          <p class="text-gray-600">
            Deep understanding of luxury hospitality ensures we showcase only the finest accommodations and experiences.
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
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Exceptional Experience</h3>
          <p class="text-gray-600">
            Every detail is considered to ensure your journey from discovery to stay exceeds expectations.
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
      Discover Exceptional Luxury
    </h2>
    <p class="text-lg text-gray-300 mb-8">
      Explore the world's finest hotel suites and create unforgettable memories
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/london" class="inline-flex items-center justify-center px-8 py-3 bg-luxury-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        Explore Suites
      </a>
      <a href="/destinations" class="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium">
        View Destinations
      </a>
    </div>
  </div>
</section>
