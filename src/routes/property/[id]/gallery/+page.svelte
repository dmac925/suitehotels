<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ChevronLeft, ArrowLeft } from 'lucide-svelte';
  import { AuthService } from '$lib/auth';
  
  let isAuthenticated = false;
  let currentUser: any = null;
  
  // Get property ID from URL
  $: propertyId = $page.params.id;
  
  // Active tab - set to photos for gallery route
  let activeTab = 'photos';
  
  // Mock property data - replace with real data fetch
  const property = {
    id: 1,
    title: 'Albury Park Mansion',
    location: 'Guildford, Surrey',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800',
      'https://images.unsplash.com/photo-1574691250077-03a929faece5?w=800',
      'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
    ]
  };
  
  onMount(async () => {
    // Check authentication and email verification
    const { user } = await AuthService.getCurrentUser();
    
    if (!user) {
      // Not logged in - redirect to login
      goto('/login?redirect=/property/' + propertyId + '/gallery');
      return;
    }
    
    if (!user.email_confirmed_at) {
      // Email not verified - redirect to verification notice
      goto('/verify-email?redirect=/property/' + propertyId + '/gallery');
      return;
    }
    
    // User is authenticated and email is verified
    isAuthenticated = true;
    currentUser = user;
  });
  
  function goBack() {
    goto('/property/' + propertyId);
  }
  
  // Make tabs reactive to propertyId
  $: tabs = [
    { id: 'photos', name: `Photos (${property.images.length})`, href: `/property/${propertyId}/gallery` },
    { id: 'floorplan', name: 'Floorplan', href: `/property/${propertyId}/floorplan` },
    { id: 'map', name: 'Map', href: `/property/${propertyId}/map` }
  ];
  
  function setActiveTab(tabId: string, href: string) {
    goto(href);
  }
</script>

<svelte:head>
  <title>Gallery - {property.title} | Off Market Prime</title>
  <meta name="description" content="Photo gallery for {property.title} - {property.location}" />
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Fixed header container -->
  <div class="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
    <!-- Header with back button -->
    <div class="border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center gap-3">
          <button 
            on:click={goBack}
            class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <h1 class="text-base font-medium text-gray-900 truncate">
            {property.title}, {property.location}
          </h1>
        </div>
      </div>
    </div>

    <!-- Navigation tabs -->
    <div class="border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4">
        <nav class="flex space-x-6">
          {#each tabs as tab}
            <button
              on:click={() => setActiveTab(tab.id, tab.href)}
              class="py-3 px-1 border-b-2 font-medium text-sm transition-colors"
              class:border-red-500={activeTab === tab.id}
              class:text-red-600={activeTab === tab.id}
              class:border-transparent={activeTab !== tab.id}
              class:text-gray-500={activeTab !== tab.id}
              class:hover:text-gray-700={activeTab !== tab.id}
            >
              {tab.name}
            </button>
          {/each}
        </nav>
      </div>
    </div>
  </div>

  <!-- Content area with padding for fixed header -->
  <div class="max-w-7xl mx-auto px-4 py-4" style="padding-top: 112px;">
    {#if activeTab === 'photos'}
      <!-- Photos grid -->
      <div class="space-y-4">
        <!-- Kitchen section -->
        <div>
          <h2 class="text-base font-medium text-gray-900 mb-3">Kitchen</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            {#each property.images.slice(0, 3) as image, index}
              <div class="aspect-[4/3] overflow-hidden rounded bg-gray-100">
                <img 
                  src={image} 
                  alt="Kitchen - Image {index + 1}"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            {/each}
          </div>
        </div>

        <!-- Living Areas section -->
        <div>
          <h2 class="text-base font-medium text-gray-900 mb-3">Living Areas</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            {#each property.images.slice(3, 6) as image, index}
              <div class="aspect-[4/3] overflow-hidden rounded bg-gray-100">
                <img 
                  src={image} 
                  alt="Living Area - Image {index + 1}"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            {/each}
          </div>
        </div>

        <!-- Bedrooms section -->
        <div>
          <h2 class="text-base font-medium text-gray-900 mb-3">Bedrooms</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            {#each property.images.slice(6, 9) as image, index}
              <div class="aspect-[4/3] overflow-hidden rounded bg-gray-100">
                <img 
                  src={image} 
                  alt="Bedroom - Image {index + 1}"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            {/each}
          </div>
        </div>

        <!-- Bathrooms section -->
        <div>
          <h2 class="text-base font-medium text-gray-900 mb-3">Bathrooms</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            {#each property.images.slice(9) as image, index}
              <div class="aspect-[4/3] overflow-hidden rounded bg-gray-100">
                <img 
                  src={image} 
                  alt="Bathroom - Image {index + 1}"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else if activeTab === 'floorplan'}
      <!-- Floorplan content -->
      <div class="space-y-6">
        <!-- Ground Floor -->
        <div>
          <h2 class="text-base font-medium text-gray-900 mb-3">Ground Floor</h2>
          <div class="bg-gray-50 rounded overflow-hidden">
            <img 
              src="https://placehold.co/800x600/f8f8f8/333333?text=Ground+Floor+Plan" 
              alt="Ground Floor Plan"
              class="w-full h-auto object-contain"
            />
          </div>
        </div>

        <!-- First Floor -->
        <div>
          <h2 class="text-base font-medium text-gray-900 mb-3">First Floor</h2>
          <div class="bg-gray-50 rounded overflow-hidden">
            <img 
              src="https://placehold.co/800x600/f8f8f8/333333?text=First+Floor+Plan" 
              alt="First Floor Plan"
              class="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    {:else if activeTab === 'map'}
      <!-- Map content -->
      <div class="text-center py-12">
        <div class="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
          <p class="text-gray-500">Map will be displayed here</p>
        </div>
      </div>
    {/if}
  </div>
</div>
