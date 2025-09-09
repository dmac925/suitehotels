<script lang="ts">
  import { Shield, Award, Star, Mail, Phone } from 'lucide-svelte';
</script>

<footer class="bg-luxury-charcoal text-white">
  <!-- Trust indicators -->
  <div class="border-b border-gray-700">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div class="flex items-center space-x-4">
          <Shield class="h-8 w-8 text-luxury-blue flex-shrink-0" />
          <div>
            <h3 class="font-semibold">Verified Hotels</h3>
            <p class="text-sm text-gray-300">Every suite is thoroughly vetted and verified</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <Award class="h-8 w-8 text-luxury-blue flex-shrink-0" />
          <div>
            <h3 class="font-semibold">Premium Partners</h3>
            <p class="text-sm text-gray-300">Working with world's leading luxury hotels</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <Star class="h-8 w-8 text-luxury-blue flex-shrink-0" />
          <div>
            <h3 class="font-semibold">Best Price Guarantee</h3>
            <p class="text-sm text-gray-300">Exclusive rates on luxury suites</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Main footer content -->
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
      <!-- Company info -->
      <div class="md:col-span-1">
        <h3 class="luxury-heading text-lg text-white mb-4">Suite Hotels</h3>
        <p class="text-sm text-gray-300 mb-4">
          Your gateway to the world's finest luxury hotel suites. 
          Experience unparalleled comfort and elegance.
        </p>
        <div class="space-y-2">
          <div class="flex items-center space-x-2 text-sm text-gray-300">
            <Mail class="h-4 w-4" />
            <span>reservations@suitehotels.com</span>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-300">
            <Phone class="h-4 w-4" />
            <span>+44 20 7946 0958</span>
          </div>
        </div>
      </div>

      <!-- Popular Destinations -->
      <div>
        <h3 class="text-sm font-semibold text-white mb-4">Popular Cities</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="/london" class="hover:text-luxury-blue transition-colors">London</a></li>
          <li><a href="/paris" class="hover:text-luxury-blue transition-colors">Paris</a></li>
          <li><a href="/new-york" class="hover:text-luxury-blue transition-colors">New York</a></li>
          <li><a href="/dubai" class="hover:text-luxury-blue transition-colors">Dubai</a></li>
          <li><a href="/tokyo" class="hover:text-luxury-blue transition-colors">Tokyo</a></li>
        </ul>
      </div>

      <!-- Services -->
      <div>
        <h3 class="text-sm font-semibold text-white mb-4">Services</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="/luxury-suites" class="hover:text-luxury-blue transition-colors">Luxury Suites</a></li>
          <li><a href="/business-travel" class="hover:text-luxury-blue transition-colors">Business Travel</a></li>
          <li><a href="/concierge" class="hover:text-luxury-blue transition-colors">Concierge Service</a></li>
          <li><a href="/group-bookings" class="hover:text-luxury-blue transition-colors">Group Bookings</a></li>
          <li><a href="/contact" class="hover:text-luxury-blue transition-colors">Contact Us</a></li>
        </ul>
      </div>

      <!-- Support -->
      <div>
        <h3 class="text-sm font-semibold text-white mb-4">Support</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="/help" class="hover:text-luxury-blue transition-colors">Help Center</a></li>
          <li><a href="/cancellation" class="hover:text-luxury-blue transition-colors">Cancellation Policy</a></li>
          <li><a href="/privacy" class="hover:text-luxury-blue transition-colors">Privacy Policy</a></li>
          <li><a href="/terms" class="hover:text-luxury-blue transition-colors">Terms & Conditions</a></li>
          <li><a href="/cookies" class="hover:text-luxury-blue transition-colors">Cookie Policy</a></li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="mt-8 border-t border-gray-700 pt-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-gray-300">
          © 2025 Suite Hotels. All rights reserved.
        </p>
        <div class="mt-4 md:mt-0 flex items-center space-x-4 text-sm text-gray-300">
          <span>Part of the Luxury Hotels Collection</span>
        </div>
      </div>
    </div>
  </div>
</footer> 