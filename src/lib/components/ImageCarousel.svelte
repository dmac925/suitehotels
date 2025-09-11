<script lang="ts">
  import { getImageUrl } from '$lib/utils/imageOptimization';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  export let images: string[] = [];
  export let alt: string = '';
  export let className: string = '';
  
  let currentIndex = 0;
  let container: HTMLDivElement;
  
  $: hasMultipleImages = images.length > 1;
  
  function nextImage(event: MouseEvent) {
    event.stopPropagation();
    currentIndex = (currentIndex + 1) % images.length;
  }
  
  function prevImage(event: MouseEvent) {
    event.stopPropagation();
    currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  }
  
  function goToImage(index: number, event: MouseEvent) {
    event.stopPropagation();
    currentIndex = index;
  }
</script>

<div class="relative group {className}">
  <!-- Main Image -->
  <img 
    src={getImageUrl.card(images[currentIndex])} 
    {alt}
    class="w-full h-64 object-cover transition-opacity duration-300"
    loading="lazy"
  />
  
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