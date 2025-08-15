<script lang="ts">
  import { page } from '$app/stores';
  import { Home, Menu, X, Lock, User } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { AuthService } from '$lib/auth';
  
  let mobileMenuOpen = false;
  let isAuthenticated = false;
  let currentUser: any = null;
  
  // Check authentication state on mount and listen for changes
  onMount(async () => {
    // Check initial auth state
    const { user } = await AuthService.getCurrentUser();
    isAuthenticated = !!user;
    currentUser = user;
    
    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      isAuthenticated = !!user;
      currentUser = user;
    });
    
    // Cleanup subscription on component destroy
    return () => {
      subscription?.unsubscribe();
    };
  });
  
  const handleSignOut = async () => {
    await AuthService.signOut();
    // User state will be updated automatically via the auth state listener
  };
  
  const navigation = [
    { name: 'How it works', href: '/how-it-works' },
    { name: 'Properties', href: '/london' },
    { name: 'List your home', href: '/list-property' },
  ];
</script>

<header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
  <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
    <div class="flex h-16 items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/" class="flex items-center">
          <img src="/offmarketprime_logo.png" alt="Off Market Prime" class="h-12 w-auto" />
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex md:items-center md:space-x-8">
        {#each navigation as item}
          <a
            href={item.href}
            class="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors duration-200"
            class:text-gray-900={$page.url.pathname === item.href}
          >
            {item.name}
          </a>
        {/each}
      </div>

      <!-- Authentication Button -->
      <div class="hidden md:flex md:items-center">
        {#if isAuthenticated}
          <div class="flex items-center space-x-4">
            <a href="/dashboard" class="inline-flex items-center px-4 py-2 border border-luxury-blue text-luxury-blue rounded-md text-sm font-medium bg-white hover:bg-luxury-blue hover:text-white transition-colors">
              <User class="w-4 h-4 mr-2" />
              My Profile
            </a>
            <button 
              on:click={handleSignOut}
              class="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        {:else}
          <a href="/login" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Lock class="w-4 h-4 mr-2" />
            Sign in
          </a>
        {/if}
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          class="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-luxury-blue focus:outline-none focus:ring-2 focus:ring-luxury-blue focus:ring-offset-2"
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
              class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-luxury-blue"
              class:text-luxury-blue={$page.url.pathname === item.href}
              on:click={() => mobileMenuOpen = false}
            >
              {item.name}
            </a>
          {/each}
          <div class="border-t border-gray-200 pt-4">
            {#if isAuthenticated}
              <a 
                href="/dashboard" 
                class="flex items-center rounded-md px-3 py-2 text-base font-medium text-luxury-blue hover:bg-gray-50"
                on:click={() => mobileMenuOpen = false}
              >
                <User class="w-4 h-4 mr-2" />
                My Profile
              </a>
              <button 
                on:click={() => { handleSignOut(); mobileMenuOpen = false; }}
                class="flex items-center w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign Out
              </button>
            {:else}
              <a 
                href="/login" 
                class="flex items-center justify-center mt-2 w-full px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                on:click={() => mobileMenuOpen = false}
              >
                <Lock class="w-4 h-4 mr-2" />
                Sign in
              </a>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header> 