<script lang="ts">
  import { page } from '$app/stores';
  import { Home, Menu, X, MapPin, Building, Phone } from 'lucide-svelte';
  
  let mobileMenuOpen = false;
  
  const navigation = [
    { name: 'London Hotels', href: '/london' },
    { name: 'New York Hotels', href: '/new-york' },
    { name: 'Paris Hotels', href: '/paris' },
    { name: 'Dubai Hotels', href: '/dubai' },
  ];
  
  const cities = [
    { name: 'London', href: '/london' },
    { name: 'New York', href: '/new-york' },
    { name: 'Paris', href: '/paris' },
    { name: 'Tokyo', href: '/tokyo' },
    { name: 'Dubai', href: '/dubai' },
    { name: 'Singapore', href: '/singapore' },
  ];
</script>

<header class="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg sticky top-0 z-50">
  <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
    <div class="flex h-16 items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="flex items-center">
          <Building class="h-8 w-8 text-amber-400 mr-2" />
          <span class="text-xl font-bold text-white">Suite Theory</span>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex md:items-center md:space-x-8">
        {#each navigation as item}
          <a
            href={item.href}
            class="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors duration-200"
            class:text-amber-400={$page.url.pathname.startsWith(item.href)}
          >
            {item.name}
          </a>
        {/each}
        
        <!-- Destinations Dropdown -->
        <div class="relative group">
          <div class="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
            <div class="py-1">
              {#each cities as city}
                <a href={city.href} class="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-amber-400">
                  {city.name}
                </a>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Button -->
      <div class="hidden md:flex md:items-center">
        <a href="/contact" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-md text-sm font-medium hover:from-amber-400 hover:to-amber-500 transition-all shadow-md">
          <Phone class="w-4 h-4 mr-2" />
          Contact Us
        </a>
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          class="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-slate-700 hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          <span class="sr-only">Open main menu</span>
          {#if mobileMenuOpen}
            <X class="h-6 w-6" />
          {:else}
            <Menu class="h-6 w-6" />
          {/if}
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="md:hidden bg-slate-800">
        <div class="space-y-1 px-2 pb-3 pt-2">
          {#each navigation as item}
            <a
              href={item.href}
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-slate-700 hover:text-amber-400"
              class:text-amber-400={$page.url.pathname.startsWith(item.href)}
              on:click={() => mobileMenuOpen = false}
            >
              {item.name}
            </a>
          {/each}
          
          <!-- More Cities Section -->
          <div class="border-t border-slate-700 pt-4 mt-4">
            <p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">More Destinations</p>
            <div class="mt-2">
              {#each cities as city}
                <a
                  href={city.href}
                  class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-slate-700 hover:text-amber-400"
                  on:click={() => mobileMenuOpen = false}
                >
                  {city.name}
                </a>
              {/each}
            </div>
          </div>
          
          <!-- Contact Button -->
          <div class="border-t border-slate-700 pt-4">
            <a 
              href="/contact" 
              class="flex items-center justify-center mt-2 w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-md text-base font-medium hover:from-amber-400 hover:to-amber-500"
              on:click={() => mobileMenuOpen = false}
            >
              <Phone class="w-4 h-4 mr-2" />
              Contact Us
            </a>
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header> 