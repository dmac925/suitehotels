<script lang="ts">
  import { page } from '$app/stores';
  import { Home, Menu, X, Lock } from 'lucide-svelte';
  
  let mobileMenuOpen = false;
  
  // Mock authentication state - replace with real auth later
  let isAuthenticated = false;
  
  const navigation = [
    { name: 'Properties', href: '/properties' },
    { name: 'London', href: '/london' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];
</script>

<header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
  <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
    <div class="flex h-16 items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="flex items-center space-x-2">
          <Home class="h-8 w-8 text-luxury-gold" />
          <span class="luxury-heading text-xl">OffMarketEdit</span>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex md:items-center md:space-x-8">
        {#each navigation as item}
          <a
            href={item.href}
            class="text-sm font-medium text-gray-700 hover:text-luxury-gold transition-colors duration-200"
            class:text-luxury-gold={$page.url.pathname === item.href}
          >
            {item.name}
          </a>
        {/each}
      </div>

      <!-- Authentication Buttons -->
      <div class="hidden md:flex md:items-center md:space-x-4">
        {#if isAuthenticated}
          <a href="/dashboard" class="text-sm font-medium text-gray-700 hover:text-luxury-gold">
            Dashboard
          </a>
          <button class="text-sm font-medium text-gray-700 hover:text-luxury-gold">
            Sign Out
          </button>
        {:else}
          <a href="/login" class="text-sm font-medium text-gray-700 hover:text-luxury-gold">
            Sign In
          </a>
          <a href="/signup" class="luxury-button rounded-md">
            Join Now
          </a>
        {/if}
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          class="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2"
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
      <div class="md:hidden">
        <div class="space-y-1 px-2 pb-3 pt-2">
          {#each navigation as item}
            <a
              href={item.href}
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-luxury-gold"
              class:text-luxury-gold={$page.url.pathname === item.href}
              on:click={() => mobileMenuOpen = false}
            >
              {item.name}
            </a>
          {/each}
          <div class="border-t border-gray-200 pt-4">
            {#if isAuthenticated}
              <a href="/dashboard" class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-luxury-gold">
                Dashboard
              </a>
              <button class="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-luxury-gold">
                Sign Out
              </button>
            {:else}
              <a href="/login" class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-luxury-gold">
                Sign In
              </a>
              <a href="/signup" class="block mt-2 luxury-button rounded-md text-center">
                Join Now
              </a>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header> 