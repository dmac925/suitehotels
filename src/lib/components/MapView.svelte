<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { MapPin, Star, Bed, Users } from 'lucide-svelte';
  import type { Map, Marker, Icon } from 'leaflet';
  
  export let suites: any[] = [];
  export let cityName = 'London';
  export let onSuiteClick: (suite: any) => void;
  
  let mapContainer: HTMLElement;
  let map: Map | null = null;
  let markers: Marker[] = [];
  let L: any;
  
  // Default city coordinates
  const cityCoordinates: Record<string, [number, number]> = {
    'London': [51.5074, -0.1278],
    'Paris': [48.8566, 2.3522],
    'New York': [40.7128, -74.0060],
    'Dubai': [25.2048, 55.2708],
    'Tokyo': [35.6762, 139.6503],
    'Rome': [41.9028, 12.4964],
    'Barcelona': [41.3851, 2.1734],
    'Berlin': [52.5200, 13.4050],
  };
  
  // Get center coordinates for the city
  function getCityCenter(city: string): [number, number] {
    const normalizedCity = city.replace(/-/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    return cityCoordinates[normalizedCity] || cityCoordinates['London'];
  }
  
  // Generate random coordinates near city center for demo
  function generateCoordinates(city: string, index: number, seed: string = ''): [number, number] {
    const center = getCityCenter(city);
    // Use hotel name as seed for consistent positioning
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    const distance = 0.02 + (hash % 30) * 0.002; // Vary distance based on hash
    
    const latOffset = Math.sin(angle) * distance;
    const lngOffset = Math.cos(angle) * distance;
    return [center[0] + latOffset, center[1] + lngOffset];
  }
  
  // Group suites by hotel
  function groupSuitesByHotel(suites: any[]) {
    const hotelMap = new Map();
    
    suites.forEach((suite, index) => {
      const hotelKey = suite.hotelName || `Hotel ${index}`;
      
      if (!hotelMap.has(hotelKey)) {
        // Use actual coordinates if available, otherwise generate demo coordinates
        let coordinates = null;
        if (suite.coordinates && Array.isArray(suite.coordinates) && suite.coordinates.length === 2) {
          coordinates = suite.coordinates;
        } else {
          // Fallback to generated coordinates for hotels without lat/lng
          coordinates = generateCoordinates(cityName, index, hotelKey);
        }
        
        hotelMap.set(hotelKey, {
          hotelName: hotelKey,
          hotelStars: suite.hotelStars,
          hotelRating: suite.hotelRating,
          hotelReviews: suite.hotelReviews,
          suites: [],
          minPrice: suite.price,
          maxPrice: suite.price,
          totalSuites: 0,
          coordinates: coordinates,
          hotelSlug: suite.hotelSlug
        });
      }
      
      const hotel = hotelMap.get(hotelKey);
      hotel.suites.push(suite);
      hotel.totalSuites++;
      hotel.minPrice = Math.min(hotel.minPrice, suite.price || Infinity);
      hotel.maxPrice = Math.max(hotel.maxPrice, suite.price || 0);
    });
    
    return Array.from(hotelMap.values());
  }
  
  async function initMap() {
    // Dynamically import Leaflet
    L = await import('leaflet');
    
    // Import Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    
    // Wait for CSS to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const center = getCityCenter(cityName);
    
    // Initialize map
    map = L.map(mapContainer).setView(center, 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Create custom icon
    const hotelIcon = L.divIcon({
      html: `
        <div class="custom-marker">
          <div class="marker-price">$</div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
    
    // Add markers for each suite
    updateMarkers();
  }
  
  function updateMarkers() {
    if (!map || !L) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];
    
    // Group suites by hotel
    const hotels = groupSuitesByHotel(suites);
    
    // Log for debugging
    console.log(`MapView: Found ${hotels.length} hotels with coordinates:`, 
      hotels.map(h => ({ 
        name: h.hotelName, 
        coords: h.coordinates,
        suitesCount: h.totalSuites 
      }))
    );
    
    // Add markers for each hotel
    hotels.forEach((hotel) => {
      const coords = hotel.coordinates;
      
      // Create custom HTML for marker showing number of suites
      const markerHtml = `
        <div class="custom-marker hotel-marker ${hotel.minPrice > 1000 ? 'premium' : ''}">
          <div class="marker-content">
            <span class="suite-count">${hotel.totalSuites}</span>
            <span class="price-range">$${Math.round(hotel.minPrice)}${hotel.minPrice !== hotel.maxPrice ? '+' : ''}</span>
          </div>
        </div>
      `;
      
      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-div-icon',
        iconSize: [70, 35],
        iconAnchor: [35, 35],
        popupAnchor: [0, -35]
      });
      
      const marker = L.marker(coords, { icon: customIcon }).addTo(map);
      
      // Create popup content showing all suites in the hotel
      const suitesList = hotel.suites.slice(0, 5).map(suite => `
        <div class="suite-item" onclick="window.dispatchEvent(new CustomEvent('suite-click', { detail: ${JSON.stringify({ id: suite.id, hotelSlug: suite.hotelSlug, roomSlug: suite.roomSlug })} }))">
          <div class="suite-item-header">
            <span class="suite-name">${suite.roomType}</span>
            <span class="suite-price">$${suite.price?.toLocaleString()}</span>
          </div>
          <div class="suite-item-details">
            <span>${suite.persons} guests</span>
            ${suite.sqft ? `<span>${suite.sqft} ft²</span>` : ''}
          </div>
        </div>
      `).join('');
      
      const moreText = hotel.suites.length > 5 ? 
        `<div class="more-suites">+${hotel.suites.length - 5} more suites available</div>` : '';
      
      const popupContent = `
        <div class="map-popup hotel-popup">
          <div class="popup-header">
            <h3 class="popup-title">${hotel.hotelName}</h3>
            <div class="popup-rating">
              ${Array(hotel.hotelStars || 0).fill('⭐').join('')}
              <span class="rating-text">${hotel.hotelRating}/10 (${hotel.hotelReviews} reviews)</span>
            </div>
          </div>
          <div class="popup-stats">
            <div class="stat">
              <strong>${hotel.totalSuites}</strong> suites available
            </div>
            <div class="stat">
              From <strong>$${hotel.minPrice?.toLocaleString()}</strong>/night
            </div>
          </div>
          <div class="suites-list">
            ${suitesList}
            ${moreText}
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        maxWidth: 350,
        className: 'hotel-popup-wrapper'
      });
      
      markers.push(marker);
    });
    
    // Fit map to show all markers if there are any
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }
  
  // Handle suite click from popup
  function handlePopupClick(event: CustomEvent) {
    const suite = suites.find(s => 
      s.id === event.detail.id || 
      (s.hotelSlug === event.detail.hotelSlug && s.roomSlug === event.detail.roomSlug)
    );
    if (suite && onSuiteClick) {
      onSuiteClick(suite);
    }
  }
  
  onMount(() => {
    initMap();
    window.addEventListener('suite-click', handlePopupClick as any);
  });
  
  onDestroy(() => {
    if (map) {
      map.remove();
    }
    window.removeEventListener('suite-click', handlePopupClick as any);
  });
  
  // Update markers when suites change
  $: if (map && suites) {
    updateMarkers();
  }
</script>

<div class="map-container">
  <div bind:this={mapContainer} class="map-element"></div>
  
  <!-- Map Legend -->
  <div class="map-legend">
    <div class="legend-item">
      <div class="legend-marker">
        <span class="legend-count">5</span>
        <span class="legend-price">$500</span>
      </div>
      <span>Hotels with suite count & min price</span>
    </div>
    <div class="legend-info">
      Click markers to see all available suites
    </div>
  </div>
</div>

<style>
  .map-container {
    position: relative;
    width: 100%;
    height: 600px;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .map-element {
    width: 100%;
    height: 100%;
  }
  
  .map-legend {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: white;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 1000;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .legend-item:last-child {
    margin-bottom: 0;
  }
  
  .legend-marker {
    width: 70px;
    height: 28px;
    background: white;
    border: 2px solid #3b82f6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 11px;
    padding: 0 4px;
  }
  
  .legend-count {
    font-weight: bold;
    color: #3b82f6;
  }
  
  .legend-price {
    color: #666;
  }
  
  .legend-info {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
  
  :global(.custom-div-icon) {
    background: transparent;
    border: none;
  }
  
  :global(.custom-marker) {
    background: white;
    border: 2px solid #3b82f6;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  :global(.custom-marker.hotel-marker) {
    padding: 2px 6px;
  }
  
  :global(.custom-marker:hover) {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  :global(.custom-marker.premium) {
    background: #3b82f6;
    color: white;
  }
  
  :global(.marker-content) {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  
  :global(.suite-count) {
    font-weight: bold;
    font-size: 14px;
  }
  
  :global(.price-range) {
    color: #666;
    font-weight: normal;
  }
  
  :global(.custom-marker.premium .price-range) {
    color: #e0e0e0;
  }
  
  :global(.hotel-popup-wrapper .leaflet-popup-content-wrapper) {
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  :global(.hotel-popup-wrapper .leaflet-popup-content) {
    margin: 0;
    width: 350px !important;
  }
  
  :global(.hotel-popup) {
    padding: 16px;
  }
  
  :global(.popup-header) {
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 12px;
    margin-bottom: 12px;
  }
  
  :global(.popup-title) {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 6px 0;
    color: #1f2937;
  }
  
  :global(.popup-rating) {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
  }
  
  :global(.rating-text) {
    color: #666;
    font-size: 12px;
    margin-left: 4px;
  }
  
  :global(.popup-stats) {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    margin-bottom: 12px;
    background: #f9fafb;
    border-radius: 6px;
    padding: 12px;
  }
  
  :global(.stat) {
    font-size: 13px;
    color: #4b5563;
  }
  
  :global(.stat strong) {
    color: #1f2937;
    font-weight: 600;
  }
  
  :global(.suites-list) {
    max-height: 250px;
    overflow-y: auto;
  }
  
  :global(.suite-item) {
    padding: 10px;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
  }
  
  :global(.suite-item:hover) {
    background: #f3f4f6;
    border-color: #3b82f6;
  }
  
  :global(.suite-item-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  
  :global(.suite-name) {
    font-weight: 500;
    color: #1f2937;
    font-size: 14px;
  }
  
  :global(.suite-price) {
    font-weight: 600;
    color: #3b82f6;
    font-size: 14px;
  }
  
  :global(.suite-item-details) {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #6b7280;
  }
  
  :global(.more-suites) {
    text-align: center;
    padding: 8px;
    color: #6b7280;
    font-size: 13px;
    font-style: italic;
    border-top: 1px solid #e5e5e5;
    margin-top: 8px;
  }
  
  @media (max-width: 768px) {
    .map-container {
      height: 400px;
    }
    
    .map-legend {
      bottom: 10px;
      left: 10px;
      padding: 8px;
    }
    
    .legend-item {
      font-size: 12px;
    }
  }
</style>