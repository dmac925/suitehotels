<script lang="ts">
  import { Heart, Search, Bell, Settings, Eye, MapPin, Calendar, TrendingUp } from 'lucide-svelte';
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  
  let user: any = null;
  let userProfile: any = null;
  let recentProperties: any[] = [];
  let isLoading = true;
  
  onMount(async () => {
    try {
      // Check if user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }
      user = currentUser;

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      userProfile = profile;

      // Get recent properties based on user preferences
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      // Filter by user preferences if available
      if (profile?.location) {
        query = query.ilike('neighborhood', `%${profile.location}%`);
      }
      if (profile?.property_type) {
        query = query.eq('property_type', profile.property_type);
      }
      if (profile?.price_range) {
        // Add price filtering logic based on price_range
        switch (profile.price_range) {
          case 'under-2m':
            query = query.lt('price', 2000000);
            break;
          case '2m-5m':
            query = query.gte('price', 2000000).lte('price', 5000000);
            break;
          case '5m-10m':
            query = query.gte('price', 5000000).lte('price', 10000000);
            break;
          case 'over-10m':
            query = query.gt('price', 10000000);
            break;
        }
      }

      const { data: properties } = await query;
      recentProperties = properties || [];

    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      isLoading = false;
    }
  });

  // Mock fallback data structure for display
  const fallbackRecentProperties = [
    {
      id: 1,
      title: 'Luxury Penthouse in Mayfair',
      location: 'Mayfair, London W1',
      price: '£4,500,000',
      bedrooms: 3,
      bathrooms: 3,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      addedDate: '2 days ago',
      status: 'new'
    },
    {
      id: 2,
      title: 'Georgian Townhouse',
      location: 'Chelsea, London SW3',
      price: '£6,200,000',
      bedrooms: 4,
      bathrooms: 4,
      image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop',
      addedDate: '5 days ago',
      status: 'trending'
    },
    {
      id: 3,
      title: 'Modern Apartment',
      location: 'Kensington, London SW7',
      price: '£2,800,000',
      bedrooms: 2,
      bathrooms: 2,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
      addedDate: '1 week ago',
      status: 'saved'
    }
  ];
  
  $: quickStats = [
    { label: 'Properties Viewed', value: 47, icon: Eye, color: 'text-blue-600' },
    { label: 'Saved Properties', value: 12, icon: Heart, color: 'text-red-600' },
    { label: 'New This Week', value: recentProperties.length, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Active Searches', value: userProfile?.location ? 1 : 0, icon: Search, color: 'text-luxury-blue' }
  ];
</script>

<svelte:head>
  <title>Dashboard - OffMarketPrime | Your Property Portal</title>
  <meta name="description" content="Access your personalized dashboard to view exclusive off-market properties, saved listings, and market insights." />
</svelte:head>

<div class="min-h-screen bg-luxury-pearl">
  
  <!-- Dashboard Header -->
  <div class="bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between py-6">
        <div>
          {#if isLoading}
            <h1 class="luxury-heading text-3xl">Loading...</h1>
          {:else if userProfile}
            <h1 class="luxury-heading text-3xl">Welcome back, {userProfile.first_name}</h1>
            <p class="luxury-text mt-1">Discover your next luxury property investment</p>
          {:else}
            <h1 class="luxury-heading text-3xl">Welcome back</h1>
          {/if}
        </div>
        <div class="flex items-center space-x-4">
          <button class="p-2 text-gray-400 hover:text-luxury-blue transition-colors">
            <Bell class="h-6 w-6" />
          </button>
          <button class="p-2 text-gray-400 hover:text-luxury-blue transition-colors">
            <Settings class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {#each quickStats as stat}
        <div class="luxury-card rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{stat.label}</p>
              <p class="luxury-heading text-2xl mt-1">{stat.value}</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg">
              <svelte:component this={stat.icon} class="h-6 w-6 {stat.color}" />
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Recent Properties -->
      <div class="lg:col-span-2">
        <div class="luxury-card rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="luxury-heading text-xl">Recent Properties</h2>
            <a href="/london" class="text-luxury-blue hover:underline text-sm font-medium">
              View All Properties
            </a>
          </div>
          
          <div class="space-y-4">
            {#if isLoading}
              <div class="animate-pulse space-y-4">
                {#each Array(3) as _}
                  <div class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                    <div class="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div class="flex-grow space-y-2">
                      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else if recentProperties.length > 0}
              {#each recentProperties as property}
                <div class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <img 
                    src={property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop'} 
                    alt={property.title}
                    class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div class="flex-grow">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="luxury-heading text-lg">{property.title}</h3>
                        <div class="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin class="h-4 w-4 mr-1" />
                          {property.neighborhood}, London
                        </div>
                        <div class="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                          <span>{property.bedrooms} bed</span>
                          <span>{property.bathrooms} bath</span>
                          <span class="text-luxury-blue">New</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="luxury-heading text-lg text-luxury-charcoal">{property.price_display}</div>
                        <div class="flex items-center mt-2">
                          {#if property.is_featured}
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Featured
                            </span>
                          {:else}
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              New
                            </span>
                          {/if}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {:else}
              <div class="text-center py-8">
                <p class="text-gray-500">No properties match your preferences yet.</p>
                <a href="/london" class="text-luxury-blue hover:underline">Browse all properties</a>
              </div>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Sidebar -->
      <div class="space-y-6">
        
        <!-- Quick Actions -->
        <div class="luxury-card rounded-lg p-6">
          <h3 class="luxury-heading text-lg mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <a href="/london" class="block w-full luxury-button rounded-md py-3 text-center">
              Browse Properties
            </a>
            <a href="/search" class="block w-full bg-white border-2 border-luxury-blue text-luxury-black px-4 py-3 rounded-md font-medium hover:bg-luxury-lightblue transition-colors text-center">
              Advanced Search
            </a>
            <a href="/saved" class="block w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors text-center">
              View Saved Properties
            </a>
          </div>
        </div>
        
        <!-- Account Info -->
        <div class="luxury-card rounded-lg p-6">
          <h3 class="luxury-heading text-lg mb-4">Account Overview</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Member since</span>
              <span class="font-medium">{userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : '2024'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Buyer type</span>
              <span class="font-medium capitalize">{userProfile?.buyer_type?.replace('-', ' ') || 'Not set'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Location interest</span>
              <span class="font-medium">{userProfile?.location || 'Any'}</span>
            </div>
          </div>
        </div>
        
        <!-- Market Updates -->
        <div class="luxury-card rounded-lg p-6">
          <h3 class="luxury-heading text-lg mb-4">Market Updates</h3>
          <div class="space-y-4">
            <div class="border-l-4 border-luxury-blue pl-4">
              <h4 class="font-medium text-sm">London Property Market</h4>
              <p class="text-xs text-gray-600 mt-1">Off-market activity increased by 15% this month</p>
            </div>
            <div class="border-l-4 border-blue-400 pl-4">
              <h4 class="font-medium text-sm">Mayfair Trends</h4>
              <p class="text-xs text-gray-600 mt-1">Average prices up 3.2% in premium areas</p>
            </div>
            <div class="border-l-4 border-green-400 pl-4">
              <h4 class="font-medium text-sm">New Listings</h4>
              <p class="text-xs text-gray-600 mt-1">8 new exclusive properties added this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 