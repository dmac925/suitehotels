<script lang="ts">
  import { Eye, Share2 } from 'lucide-svelte';
  import FullScreenGallery from './FullScreenGallery.svelte';
  
  export let images: string[] = [];
  export let title: string = '';
  export let propertySlug: string = '';
  
  let currentImageIndex = 0;
  
  // Full-screen gallery state
  let isFullScreenOpen = false;
  let fullScreenInitialIndex = 0;
  
  function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
  }
  
  function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  }
  
  // Touch handling for swipe
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }
  
  function handleTouchMove(e: TouchEvent) {
    if (!isSwiping) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = Math.abs(touchX - touchStartX);
    const diffY = Math.abs(touchY - touchStartY);
    
    // If horizontal movement is greater than vertical, prevent default to stop page bounce
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }
  
  function handleTouchEnd(e: TouchEvent) {
    if (!isSwiping) return;
    
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
    isSwiping = false;
  }
  
  function handleSwipe() {
    const swipeThreshold = 50; // minimum distance for swipe
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - next image
        nextImage();
      } else {
        // Swiped right - previous image
        prevImage();
      }
    }
  }
  
  // Full-screen gallery functions
  function openFullScreen(index: number) {
    fullScreenInitialIndex = index;
    isFullScreenOpen = true;
  }
  
  function closeFullScreen() {
    isFullScreenOpen = false;
  }
  
  // Handle image click to open full-screen
  function handleImageClick() {
    openFullScreen(currentImageIndex);
  }
</script>

<style>
  .carousel-container {
    position: relative;
    width: 100%;
    height: 350px;
    overflow: hidden;
    background: #f5f5f5;
  }
  
  @media (min-width: 768px) {
    .carousel-container {
      height: 500px;
      max-width: 1200px;
    }
  }
  
  .carousel-track {
    display: flex;
    height: 100%;
    transition: transform 0.3s ease-out;
  }
  
  .carousel-slide {
    min-width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .cursor-prev-arrow {
    cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTEiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTE0IDhMOSAxMkwxNCAxNiIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'), auto;
  }
  
  .cursor-next-arrow {
    cursor: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTEiIGZpbGw9IndoaXRlIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTEwIDhMMTUgMTJMMTAgMTYiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg=='), auto;
  }
</style>

<section class="md:bg-white md:py-4">
  <!-- Mobile: Full width -->
  <div class="md:hidden">
    <div 
      class="carousel-container"
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      <!-- Image carousel -->
      <div 
        class="carousel-track"
        style="transform: translateX(-{currentImageIndex * 100}%)"
      >
        {#each images as image, index}
          <div class="carousel-slide">
            <button 
              class="w-full h-full"
              on:click={handleImageClick}
              aria-label="View image {index + 1} in full screen"
            >
              <img 
                src={image} 
                alt="{title} - Image {index + 1}"
                loading={index === 0 ? 'eager' : 'lazy'}
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        {/each}
      </div>
      
      <!-- Image counter -->
      <div class="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
        {currentImageIndex + 1} / {images.length}
      </div>
    </div>
    
    <!-- Mobile action buttons below image -->
    <div class="bg-white px-4 py-4">
      <div class="flex justify-center gap-3">
        <a href="/property/{propertySlug}/floorplan" class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
          <Eye class="w-4 h-4" />
          Floorplan
        </a>
        <a href="/property/{propertySlug}/gallery" class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm transition-colors">
          <Eye class="w-4 h-4" />
          Gallery ({images.length})
        </a>
        <button class="p-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors">
          <Share2 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>

  <!-- Desktop: Contained with navigation -->
  <div class="hidden md:block">
    <div class="w-full px-4 lg:px-8 xl:px-12">
      <div 
        class="carousel-container rounded-lg shadow-lg mx-auto"
        on:touchstart={handleTouchStart}
        on:touchmove={handleTouchMove}
        on:touchend={handleTouchEnd}
      >
        <!-- Image carousel -->
        <div 
          class="carousel-track"
          style="transform: translateX(-{currentImageIndex * 100}%)"
        >
          {#each images as image, index}
            <div class="carousel-slide">
              <button 
                class="w-full h-full"
                on:click={handleImageClick}
                aria-label="View image {index + 1} in full screen"
              >
                <img 
                  src={image} 
                  alt="{title} - Image {index + 1}"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          {/each}
        </div>
        
        <!-- Image counter -->
        <div class="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {currentImageIndex + 1} / {images.length}
        </div>
        
        <!-- Navigation hover zones - Desktop only -->
        <button 
          on:click={prevImage}
          class="absolute left-0 top-0 w-1/2 h-full cursor-prev-arrow bg-transparent hover:bg-gradient-to-r hover:from-black/10 hover:to-transparent transition-colors"
          aria-label="Previous image"
        >
          <span class="sr-only">Previous image</span>
        </button>
        <button 
          on:click={nextImage}
          class="absolute right-0 top-0 w-1/2 h-full cursor-next-arrow bg-transparent hover:bg-gradient-to-l hover:from-black/10 hover:to-transparent transition-colors"
          aria-label="Next image"
        >
          <span class="sr-only">Next image</span>
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Full-screen gallery component -->
<FullScreenGallery 
  bind:isOpen={isFullScreenOpen}
  {images}
  initialIndex={fullScreenInitialIndex}
  {title}
  on:close={closeFullScreen}
/>