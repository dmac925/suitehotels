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
  
  // Active tab - set to map for this route
  let activeTab = 'map';
  
  // Mock property data - replace with real data fetch
  const property = {
    id: 1,
    title: 'Albury Park Mansion',
    location: 'Guildford, Surrey',
    coordinates: { lat: 51.2362, lng: -0.5704 },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
    ]
  };


  
  onMount(async () => {
    // Check authentication and email verification
    const { user } = await AuthService.getCurrentUser();
    
    if (!user) {
      // Not logged in - redirect to login
      goto('/login?redirect=/property/' + propertyId + '/map');
      return;
    }
    
    if (!user.email_confirmed_at) {
      // Email not verified - redirect to verification notice
      goto('/verify-email?redirect=/property/' + propertyId + '/map');
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
  <title>Map - {property.title} | OffMarketPrime</title>
  <meta name="description" content="Location map for {property.title} - {property.location}" />
</svelte:head>

<div class="bg-white" style="height: 100vh; overflow: hidden;">
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

  <!-- Content area - Full height map with padding for fixed header -->
  <div class="overflow-hidden" style="padding-top: 107px; height: 100vh;">
    <!-- Google Maps -->
    <div class="h-full w-full">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2486.5234567!2d-0.5704!3d51.2362!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4875d2ac0!2sGuildford%2C%20Surrey%2C%20UK!5e0!3m2!1sen!2suk!4v1234567890"
        width="100%"
        height="100%"
        style="border:0;"
        allowfullscreen={true}
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Property Location Map">
      </iframe>
    </div>
  </div>
</div>
