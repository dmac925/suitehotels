<script lang="ts">
  import { Bed, Bath, Maximize } from 'lucide-svelte';
  
  export let bedrooms: number = 0;
  export let bathrooms: number = 0;
  export let sqft: number = 0;
  export let compact: boolean = false;
</script>

{#if compact}
  <!-- Compact version for mobile -->
  {#if bedrooms > 0}
    <span class="flex items-center gap-1">
      <Bed class="w-4 h-4" />
      {bedrooms}
    </span>
  {/if}
  {#if bathrooms > 0}
    <span class="flex items-center gap-1">
      <Bath class="w-4 h-4" />
      {bathrooms}
    </span>
  {/if}
  {#if sqft > 0}
    <span class="flex items-center gap-1">
      <Maximize class="w-4 h-4" />
      {sqft.toLocaleString()}
    </span>
  {/if}
{:else}
  <!-- Full version for desktop -->
  {#if bedrooms > 0}
    <span class="flex items-center gap-2 text-sm text-gray-600">
      <Bed class="w-4 h-4" />
      {bedrooms} bed{bedrooms !== 1 ? 's' : ''}
    </span>
  {/if}
  {#if bathrooms > 0}
    <span class="flex items-center gap-2 text-sm text-gray-600">
      <Bath class="w-4 h-4" />
      {bathrooms} bath{bathrooms !== 1 ? 's' : ''}
    </span>
  {/if}
  {#if sqft > 0}
    <span class="flex items-center gap-2 text-sm text-gray-600">
      <Maximize class="w-4 h-4" />
      {sqft.toLocaleString()} sq ft
    </span>
  {/if}
{/if}