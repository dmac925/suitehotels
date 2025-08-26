<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let price: string = '';
  export let bedrooms: number = 0;
  export let bathrooms: number = 0;
  export let sqft: number = 0;
  
  const dispatch = createEventDispatcher();
  
  function requestViewing() {
    dispatch('requestViewing');
  }
  
  function saveProperty() {
    dispatch('saveProperty');
  }
  
  function shareProperty() {
    dispatch('shareProperty');
  }
</script>

<div class="sticky top-24">
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <div class="space-y-4">
      <div>
        <p class="text-xs uppercase tracking-wider text-gray-500 mb-2" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">Price Guide</p>
        <p class="text-2xl font-light text-gray-900" style="font-family: 'Georgia', serif;">{price}</p>
      </div>
      
      <div class="pt-4 border-t border-gray-200">
        <div class="space-y-3">
          {#if bedrooms > 0}
            <div class="flex justify-between text-sm">
              <span class="text-gray-600" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Bedrooms</span>
              <span class="text-gray-900" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">{bedrooms}</span>
            </div>
          {/if}
          {#if bathrooms > 0}
            <div class="flex justify-between text-sm">
              <span class="text-gray-600" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Bathrooms</span>
              <span class="text-gray-900" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">{bathrooms}</span>
            </div>
          {/if}
          {#if sqft > 0}
            <div class="flex justify-between text-sm">
              <span class="text-gray-600" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Square Feet</span>
              <span class="text-gray-900" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">{sqft.toLocaleString()}</span>
            </div>
          {/if}
        </div>
      </div>
      
      <div class="pt-4">
        <button 
          on:click={requestViewing}
          class="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 text-sm uppercase tracking-wider rounded" 
          style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400; letter-spacing: 0.1em;"
        >
          Request Viewing
        </button>
        <button 
          on:click={saveProperty}
          class="w-full px-6 py-3 mt-3 border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all duration-300 text-sm uppercase tracking-wider rounded" 
          style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400; letter-spacing: 0.1em;"
        >
          Save Property
        </button>
        <button 
          on:click={shareProperty}
          class="w-full px-6 py-3 mt-3 border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all duration-300 text-sm uppercase tracking-wider rounded" 
          style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400; letter-spacing: 0.1em;"
        >
          Share Property
        </button>
      </div>
    </div>
  </div>
  
  <!-- Agent Contact Info (Optional) -->
  <div class="mt-6 bg-gray-50 rounded-lg p-6">
    <div class="text-xs uppercase tracking-wider text-gray-500 mb-4" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">Contact Agent</div>
    <p class="text-sm text-gray-600 mb-4" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 300;">Get in touch with our team for more information or to arrange a viewing.</p>
    <a href="tel:+442012345678" class="text-sm text-gray-900 hover:text-gray-700" style="font-family: 'Helvetica Neue', sans-serif; font-weight: 400;">+44 20 1234 5678</a>
  </div>
</div>