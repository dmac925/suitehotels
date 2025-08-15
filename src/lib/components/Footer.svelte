<script lang="ts">
  import { Shield, Award, Users, Mail, Instagram } from 'lucide-svelte';
</script>

<footer class="bg-luxury-charcoal text-white">
  <!-- Trust indicators -->
  <div class="border-b border-gray-700">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div class="flex items-center space-x-4">
          <Shield class="h-8 w-8 text-luxury-blue flex-shrink-0" />
          <div>
            <h3 class="font-semibold">Verified Properties</h3>
            <p class="text-sm text-gray-300">Every property is thoroughly vetted and verified</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <Award class="h-8 w-8 text-luxury-blue flex-shrink-0" />
          <div>
            <h3 class="font-semibold">Trusted Partners</h3>
            <p class="text-sm text-gray-300">Working with London's premier estate agents</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <Users class="h-8 w-8 text-luxury-blue flex-shrink-0" />
          <div>
            <h3 class="font-semibold">Exclusive Access</h3>
            <p class="text-sm text-gray-300">Members-only off-market opportunities</p>
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
        <h3 class="luxury-heading text-lg text-white mb-4">Off Market Prime</h3>
        <p class="text-sm text-gray-300 mb-4">
          London's premier platform for exclusive off-market luxury properties. 
          Discover your next investment opportunity.
        </p>
        <div class="flex items-center space-x-2 text-sm text-gray-300 mb-4">
          <Mail class="h-4 w-4" />
          <span>hello@offmarketprime.com</span>
        </div>
        
        <!-- Social Media -->
        <div>
          <h4 class="text-sm font-semibold text-white mb-2">Follow Us</h4>
          <a 
            href="https://www.instagram.com/offmarketprime/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center space-x-2 text-gray-300 hover:text-luxury-blue transition-colors"
          >
            <Instagram class="h-5 w-5" />
            <span class="text-sm">@offmarketprime</span>
          </a>
        </div>
      </div>

      <!-- Properties -->
      <div>
        <h3 class="text-sm font-semibold text-white mb-4">Properties</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="/london/mayfair" class="hover:text-luxury-blue transition-colors">Mayfair</a></li>
          <li><a href="/london/chelsea" class="hover:text-luxury-blue transition-colors">Chelsea</a></li>
          <li><a href="/london/hampstead" class="hover:text-luxury-blue transition-colors">Hampstead</a></li>
          <li><a href="/london/kensington" class="hover:text-luxury-blue transition-colors">Kensington</a></li>
        </ul>
      </div>

      <!-- Company -->
      <div>
        <h3 class="text-sm font-semibold text-white mb-4">Company</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="/about" class="hover:text-luxury-blue transition-colors">About Us</a></li>
          <li><a href="/contact" class="hover:text-luxury-blue transition-colors">Contact</a></li>
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h3 class="text-sm font-semibold text-white mb-4">Legal</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="/privacy" class="hover:text-luxury-blue transition-colors">Privacy Policy</a></li>
          <li><a href="/terms" class="hover:text-luxury-blue transition-colors">Terms of Service</a></li>
          <li><a href="/cookies" class="hover:text-luxury-blue transition-colors">Cookie Policy</a></li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="mt-8 border-t border-gray-700 pt-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-gray-300">
          © 2025 Off Market Prime. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</footer> 