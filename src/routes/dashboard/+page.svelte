<script lang="ts">
  import { Heart, Search, Bell, Settings, Eye, MapPin, Calendar, TrendingUp } from 'lucide-svelte';
  
  // Mock user data
  const user = {
    name: 'John Smith',
    email: 'john@example.com',
    memberSince: '2024',
    savedProperties: 12,
    viewedProperties: 47
  };
  
  // Mock recent properties
  const recentProperties = [
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
  
  const quickStats = [
    { label: 'Properties Viewed', value: user.viewedProperties, icon: Eye, color: 'text-blue-600' },
    { label: 'Saved Properties', value: user.savedProperties, icon: Heart, color: 'text-red-600' },
    { label: 'New This Week', value: 8, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Active Searches', value: 3, icon: Search, color: 'text-luxury-gold' }
  ];
</script>

<svelte:head>
  <title>Dashboard - OffMarketEdit | Your Property Portal</title>
  <meta name="description" content="Access your personalized dashboard to view exclusive off-market properties, saved listings, and market insights." />
</svelte:head>

<div class="min-h-screen bg-luxury-pearl">
  
  <!-- Dashboard Header -->
  <div class="bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between py-6">
        <div>
          <h1 class="luxury-heading text-3xl">Welcome back, {user.name}</h1>
          <p class="luxury-text mt-1">Discover your next luxury property investment</p>
        </div>
        <div class="flex items-center space-x-4">
          <button class="p-2 text-gray-400 hover:text-luxury-gold transition-colors">
            <Bell class="h-6 w-6" />
          </button>
          <button class="p-2 text-gray-400 hover:text-luxury-gold transition-colors">
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
            <a href="/london" class="text-luxury-gold hover:underline text-sm font-medium">
              View All Properties
            </a>
          </div>
          
          <div class="space-y-4">
            {#each recentProperties as property}
              <div class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                <img 
                  src={property.image} 
                  alt={property.title}
                  class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div class="flex-grow">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="luxury-heading text-lg">{property.title}</h3>
                      <div class="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin class="h-4 w-4 mr-1" />
                        {property.location}
                      </div>
                      <div class="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <span>{property.bedrooms} bed</span>
                        <span>{property.bathrooms} bath</span>
                        <span class="text-luxury-gold">{property.addedDate}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="luxury-heading text-lg text-luxury-charcoal">{property.price}</div>
                      <div class="flex items-center mt-2">
                        {#if property.status === 'new'}
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        {:else if property.status === 'trending'}
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Trending
                          </span>
                        {:else if property.status === 'saved'}
                          <Heart class="h-4 w-4 text-red-500 fill-current" />
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
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
            <a href="/search" class="block w-full bg-white border-2 border-luxury-gold text-luxury-black px-4 py-3 rounded-md font-medium hover:bg-luxury-champagne transition-colors text-center">
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
              <span class="font-medium">{user.memberSince}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Properties viewed</span>
              <span class="font-medium">{user.viewedProperties}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Properties saved</span>
              <span class="font-medium">{user.savedProperties}</span>
            </div>
          </div>
        </div>
        
        <!-- Market Updates -->
        <div class="luxury-card rounded-lg p-6">
          <h3 class="luxury-heading text-lg mb-4">Market Updates</h3>
          <div class="space-y-4">
            <div class="border-l-4 border-luxury-gold pl-4">
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