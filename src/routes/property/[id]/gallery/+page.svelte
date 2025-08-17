<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ChevronLeft, ArrowLeft } from 'lucide-svelte';
  import { AuthService } from '$lib/auth';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let isAuthenticated = false;
  let currentUser: any = null;
  let isLoadingAuth = true;
  
  // Get property ID from URL
  $: propertyId = $page.params.id;
  
  // Get property data from server
  $: rawProperty = data.property;
  $: serverError = data.error;
  
  // Active tab - set to photos for gallery route
  let activeTab = 'photos';
  
  // Function to parse property images from Supabase JSON
  function parsePropertyImages(property: any): string[] {
    if (!property?.images) {
      return ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'];
    }

    try {
      // If images is already an array
      if (Array.isArray(property.images)) {
        return property.images.map((img: any) => 
          typeof img === 'object' ? img.url : img
        ).filter(Boolean);
      }
      
      // If images is a JSON string, parse it
      if (typeof property.images === 'string') {
        const parsedImages = JSON.parse(property.images);
        if (Array.isArray(parsedImages)) {
          return parsedImages.map((img: any) => 
            typeof img === 'object' ? img.url : img
          ).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('Error parsing property images:', e);
    }
    
    return ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'];
  }

  // Transform Supabase property data to expected format
  $: property = rawProperty ? {
    id: rawProperty.id,
    title: rawProperty.title || 'Property Title',
    location: `${rawProperty.address || 'London'} • ${rawProperty.tenure || 'Freehold'}`,
    price: rawProperty.price_display || rawProperty.price?.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }) || 'Price on request',
    propertyType: rawProperty.property_type?.charAt(0).toUpperCase() + rawProperty.property_type?.slice(1) || 'Property',
    images: parsePropertyImages(rawProperty),
    locationDetails: {
      address: rawProperty.address || 'London'
    }
  } : null;
  
  // Helper function to create signup URL with property context
  function createSignupUrlWithPropertyContext() {
    if (!property) {
      return '/signup';
    }
    
    const params = new URLSearchParams({
      redirect: `/property/${propertyId}/gallery`,
      propertyId: property.id.toString(),
      address: property.locationDetails.address,
      price: property.price,
      propertyType: property.propertyType,
      bedrooms: '0',
      bathrooms: '0',
      sqft: '0',
      image: property.images[0]
    });
    return `/signup?${params.toString()}`;
  }

  onMount(async () => {
    try {
      // Check authentication and email verification
      const { user } = await AuthService.getCurrentUser();
      
      if (!user) {
        // Not logged in - redirect to signup with property context
        goto(createSignupUrlWithPropertyContext());
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
    } catch (error) {
      console.error('Authentication error:', error);
      // On error, redirect to signup with property context
      goto(createSignupUrlWithPropertyContext());
    } finally {
      // Set loading to false only after auth check is complete
      isLoadingAuth = false;
    }
  });
  
  function goBack() {
    goto('/property/' + propertyId);
  }
  
  // Make tabs reactive to propertyId and property data
  $: tabs = [
    { id: 'photos', name: `Photos (${property?.images.length || 0})`, href: `/property/${propertyId}/gallery` },
    { id: 'floorplan', name: 'Floorplan', href: `/property/${propertyId}/floorplan` },
    { id: 'map', name: 'Map', href: `/property/${propertyId}/map` }
  ];
  
  function setActiveTab(tabId: string, href: string) {
    goto(href);
  }
</script>

<svelte:head>
  <title>Gallery - {property?.title || 'Property'} | Off Market Prime</title>
  <meta name="description" content="Photo gallery for {property ? `${property.title} - ${property.location}` : 'Property from Off Market Prime'}" />
</svelte:head>

<div class="min-h-screen bg-white">
{#if serverError}
  <!-- Server error loading property -->
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center max-w-md mx-auto px-4">
      <div class="text-red-500 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">Property Not Found</h1>
      <p class="text-gray-600 mb-6">The property you're looking for could not be found or is no longer available.</p>
      <a href="/london" class="bg-luxury-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
        Browse All Properties
      </a>
    </div>
  </div>
{:else if !property}
  <!-- No property data -->
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading property...</p>
    </div>
  </div>
{:else if isLoadingAuth}
  <!-- Loading screen while checking authentication -->
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading...</p>
    </div>
  </div>
{:else if isAuthenticated}
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
            {property.title}, {property.location.split('•')[0].trim()}
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
        {#if property.images.length > 0}
          <!-- All Images Gallery -->
          <div>
            <h2 class="text-base font-medium text-gray-900 mb-3">Property Images</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {#each property.images as image, index}
                <div class="aspect-[4/3] overflow-hidden rounded bg-gray-100">
                  <img 
                    src={image} 
                    alt="{property.title} - Image {index + 1}"
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    loading={index < 6 ? 'eager' : 'lazy'}
                  />
                </div>
              {/each}
            </div>
          </div>
        {:else}
          <!-- No images available -->
          <div class="text-center py-12">
            <div class="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <p class="text-gray-500">No images available</p>
            </div>
          </div>
        {/if}
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
{/if}
</div>
