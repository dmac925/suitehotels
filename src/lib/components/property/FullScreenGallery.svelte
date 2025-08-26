<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';
  
  // Props
  export let isOpen = false;
  export let images: string[] = [];
  export let initialIndex = 0;
  export let title = '';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // State
  let currentIndex = initialIndex;
  let isLoading = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;
  let isImageLoaded = false;
  let galleryElement: HTMLDivElement;
  
  // Reactive statements
  $: if (isOpen) {
    currentIndex = initialIndex;
  }
  
  $: if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  
  $: currentImage = images[currentIndex] || '';
  
  // Functions
  function close() {
    dispatch('close');
    isOpen = false;
  }
  
  function nextImage() {
    if (!images || images.length === 0) return;
    
    if (currentIndex < images.length - 1) {
      currentIndex++;
    } else {
      // Loop back to first image
      currentIndex = 0;
    }
    isImageLoaded = false;
  }
  
  function prevImage() {
    if (!images || images.length === 0) return;
    
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      // Loop to last image
      currentIndex = images.length - 1;
    }
    isImageLoaded = false;
  }
  
  function goToImage(index: number) {
    if (index >= 0 && index < images.length) {
      currentIndex = index;
      isImageLoaded = false;
    }
  }
  
  // Keyboard navigation
  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevImage();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextImage();
        break;
    }
  }
  
  // Touch handling for swipe navigation
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
    
    // If horizontal movement is greater than vertical, prevent default
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }
  
  function handleTouchEnd(e: TouchEvent) {
    if (!isSwiping) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);
    
    // Only process horizontal swipes
    if (Math.abs(diffX) > swipeThreshold && diffY < 100) {
      if (diffX > 0) {
        // Swiped left - next image
        nextImage();
      } else {
        // Swiped right - previous image
        prevImage();
      }
    }
    
    isSwiping = false;
  }
  
  // Handle clicks on overlay (close gallery)
  function handleOverlayClick(e: MouseEvent) {
    // Only close if clicking the backdrop, not the image or controls
    if ((e.target as HTMLElement).classList.contains('gallery-backdrop')) {
      close();
    }
  }
  
  // Image loading handler
  function handleImageLoad() {
    isImageLoaded = true;
    isLoading = false;
  }
  
  function handleImageError() {
    isImageLoaded = false;
    isLoading = false;
  }
  
  // Lifecycle
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });
  
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
  });
  
  // Watch for image changes to set loading state
  $: if (currentImage && isOpen) {
    isLoading = true;
    isImageLoaded = false;
  }
</script>

<!-- Full-screen overlay -->
{#if isOpen}
  <div 
    class="fixed inset-0 z-50 bg-white flex items-center justify-center gallery-backdrop"
    on:click={handleOverlayClick}
    on:keydown={() => {}}
    bind:this={galleryElement}
    on:touchstart={handleTouchStart}
    on:touchmove|nonpassive={handleTouchMove}
    on:touchend={handleTouchEnd}
    role="dialog"
    aria-modal="true"
    aria-label="Image gallery"
    tabindex="-1"
  >
    <!-- Close button -->
    <button
      on:click|stopPropagation={close}
      class="absolute top-4 right-4 z-10 p-2 text-gray-700 hover:text-gray-900 transition-colors bg-white rounded-full shadow-lg"
      aria-label="Close gallery"
    >
      <X class="w-6 h-6" />
    </button>
    
    <!-- Image counter -->
    <div class="absolute top-4 left-4 z-10 px-3 py-1 bg-white text-gray-900 rounded shadow-lg text-sm font-medium">
      {currentIndex + 1} / {images.length}
    </div>
    
    <!-- Previous button (desktop) -->
    {#if images.length > 1}
      <button
        on:click|stopPropagation={prevImage}
        class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-gray-700 hover:text-gray-900 transition-all bg-white rounded-full hidden md:block shadow-lg hover:shadow-xl"
        aria-label="Previous image"
      >
        <ChevronLeft class="w-6 h-6" />
      </button>
    {/if}
    
    <!-- Next button (desktop) -->
    {#if images.length > 1}
      <button
        on:click|stopPropagation={nextImage}
        class="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-gray-700 hover:text-gray-900 transition-all bg-white rounded-full hidden md:block shadow-lg hover:shadow-xl"
        aria-label="Next image"
      >
        <ChevronRight class="w-6 h-6" />
      </button>
    {/if}
    
    <!-- Main image container -->
    <div class="relative w-full h-full flex items-center justify-center p-4 md:p-8">
      <!-- Loading indicator -->
      {#if isLoading}
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-gray-400 border-t-transparent"></div>
        </div>
      {/if}
      
      <!-- Current image -->
      {#if currentImage}
        <img
          src={currentImage}
          alt="{title} - Image {currentIndex + 1}"
          class="w-full h-full object-contain transition-opacity duration-300"
          class:opacity-0={!isImageLoaded}
          class:opacity-100={isImageLoaded}
          on:load={handleImageLoad}
          on:error={handleImageError}
        />
      {/if}
    </div>
    
  </div>
{/if}

<style>
  /* Ensure the gallery backdrop covers everything */
  .gallery-backdrop {
    touch-action: none;
  }
  
  /* Focus styles for accessibility */
  button:focus-visible {
    outline: 2px solid #1e40af;
    outline-offset: 2px;
  }
</style>