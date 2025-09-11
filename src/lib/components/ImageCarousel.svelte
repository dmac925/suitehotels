<script lang="ts">
  import { getImageUrl } from '$lib/utils/imageOptimization';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  export let images: string[] = [];
  export let alt: string = '';
  export let className: string = '';
  
  let currentIndex = 0;
  let container: HTMLDivElement;
  
  $: hasMultipleImages = images.length > 1;
  
  // Touch handling for Instagram-style swipe
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let currentTranslateX = 0;
  let isDragging = false;
  let containerEl: HTMLElement;
  
  // Update translate position when index changes
  $: if (!isDragging) {
    currentTranslateX = -currentIndex * 100;
  }
  
  function nextImage(event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (images.length > 0) {
      currentIndex = (currentIndex + 1) % images.length;
    }
  }
  
  function prevImage(event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (images.length > 0) {
      currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    }
  }
  
  function goToImage(index: number, event: MouseEvent) {
    event.stopPropagation();
    currentIndex = index;
  }
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isDragging = false;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!touchStartX || !touchStartY) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;
    
    // Determine if this is a horizontal swipe
    if (!isDragging && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
      isDragging = true;
    }
    
    if (isDragging) {
      e.preventDefault();
      
      // Calculate position with edge resistance
      const containerWidth = containerEl?.offsetWidth || window.innerWidth;
      let translateX = diffX / containerWidth * 100;
      
      // Add resistance at edges (Instagram-style rubber band effect)
      const basePosition = -currentIndex * 100;
      if ((currentIndex === 0 && diffX > 0) || 
          (currentIndex === images.length - 1 && diffX < 0)) {
        translateX = translateX * 0.35; // Rubber band resistance
      }
      
      currentTranslateX = basePosition + translateX;
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!isDragging) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndTime = Date.now();
    
    const distance = touchEndX - touchStartX;
    const duration = touchEndTime - touchStartTime;
    const velocity = Math.abs(distance) / duration;
    
    const containerWidth = containerEl?.offsetWidth || window.innerWidth;
    const threshold = containerWidth * 0.4; // 40% threshold like Instagram
    const velocityThreshold = 0.25; // Velocity sensitivity
    
    // Determine if we should change images
    const shouldSwipe = Math.abs(distance) > threshold || velocity > velocityThreshold;
    
    if (shouldSwipe && Math.abs(distance) > 30) { // Min 30px to avoid accidental swipes
      if (distance < 0 && currentIndex < images.length - 1) {
        currentIndex++;
      } else if (distance > 0 && currentIndex > 0) {
        currentIndex--;
      }
    }
    
    // Smooth snap to final position
    currentTranslateX = -currentIndex * 100;
    isDragging = false;
    
    // Reset touch values
    touchStartX = 0;
    touchStartY = 0;
    touchStartTime = 0;
  }
</script>

<div 
  class="relative group {className} w-full h-64 overflow-hidden bg-gray-100"
  bind:this={containerEl}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
  on:touchend={handleTouchEnd}
>
  <!-- Image track -->
  <div 
    class="flex h-full transition-transform {isDragging ? 'duration-0' : 'duration-300 ease-out'}"
    style="transform: translateX({currentTranslateX}%); will-change: transform;"
  >
    {#each images as image, index}
      <div class="min-w-full h-full">
        <img 
          src={getImageUrl.card(image)} 
          alt="{alt} - Image {index + 1}"
          class="w-full h-full object-cover"
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      </div>
    {/each}
  </div>
  
  {#if hasMultipleImages}
    <!-- Navigation Arrows -->
    <button
      on:click={prevImage}
      class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
      aria-label="Previous image"
    >
      <ChevronLeft class="h-4 w-4" />
    </button>
    
    <button
      on:click={nextImage}
      class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
      aria-label="Next image"
    >
      <ChevronRight class="h-4 w-4" />
    </button>
    
    <!-- Image Indicator Dots -->
    <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
      {#each images as _, index}
        <button
          on:click={(e) => goToImage(index, e)}
          class="w-2 h-2 rounded-full transition-colors {
            currentIndex === index ? 'bg-white' : 'bg-white/50'
          }"
          aria-label="Go to image {index + 1}"
        />
      {/each}
    </div>
    
    <!-- Image Counter -->
    <div class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
      {currentIndex + 1} / {images.length}
    </div>
  {/if}
</div>