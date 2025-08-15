<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ArrowLeft } from 'lucide-svelte';
  import { AuthService } from '$lib/auth';
  
  let isAuthenticated = false;
  let currentUser: any = null;
  
  // Get property ID from URL
  $: propertyId = $page.params.id;
  
  // Active tab - set to floorplan for this route
  let activeTab = 'floorplan';
  
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
      goto('/login?redirect=/property/' + propertyId + '/floorplan');
      return;
    }
    
    if (!user.email_confirmed_at) {
      // Email not verified - redirect to verification notice
      goto('/verify-email?redirect=/property/' + propertyId + '/floorplan');
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
  <title>Floorplan - {property.title} | OffMarketPrime</title>
  <meta name="description" content="Floorplan for {property.title} - {property.location}" />
</svelte:head>

<div class="min-h-screen bg-white">
  <!-- Header with back button -->
  <div class="bg-white border-b border-gray-200 sticky top-16 z-40">
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
  <div class="bg-white border-b border-gray-200">
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

  <!-- Content area -->
  <div class="max-w-7xl mx-auto px-4 py-4">
    <!-- Floorplan content -->
    <div class="space-y-4">
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
  </div>
</div>
