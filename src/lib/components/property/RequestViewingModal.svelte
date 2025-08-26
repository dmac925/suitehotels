<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let show: boolean = false;
  export let property: any = null;
  export let currentUser: any = null;
  export let isSubmitting: boolean = false;
  export let submitSuccess: boolean = false;
  export let submitError: string = '';
  
  const dispatch = createEventDispatcher();
  
  let formData = {
    message: ''
  };
  
  function close() {
    formData.message = '';
    dispatch('close');
  }
  
  async function submitViewingRequest() {
    if (!currentUser) {
      submitError = 'Please log in to request a viewing.';
      return;
    }
    
    const requestData = {
      property_id: property?.id,
      property_title: property?.title || 'Property',
      property_location: property?.location || 'London',
      property_price: property?.price || 'Price on request',
      user_name: `${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() || currentUser.email,
      user_email: currentUser.email,
      user_phone: currentUser.user_metadata?.phone || '',
      message: formData.message,
      user_id: currentUser.id,
      created_at: new Date().toISOString()
    };
    
    dispatch('submit', requestData);
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
      on:click={close}
      on:keydown={(e) => e.key === 'Escape' && close()}
      role="button"
      tabindex="-1"
      aria-label="Close modal"
    ></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-end justify-center p-4 sm:items-center">
      <div class="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8">
        <!-- Header -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Request Viewing</h3>
            <button
              on:click={close}
              class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="bg-white px-6 py-4">
          <!-- Property info -->
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-900">{property?.title || 'Property'}</h4>
            <p class="text-sm text-gray-600">{property?.location || 'London'}</p>
            <p class="text-sm font-medium text-gray-900 mt-1">{property?.price || 'Price on request'}</p>
          </div>

          {#if currentUser}
            <!-- User info display -->
            <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 class="text-sm font-medium text-blue-900 mb-2">Request will be sent from:</h4>
              <p class="text-sm text-blue-800">
                <strong>Name:</strong> {`${currentUser.user_metadata?.first_name || ''} ${currentUser.user_metadata?.last_name || ''}`.trim() || currentUser.email}
              </p>
              <p class="text-sm text-blue-800">
                <strong>Email:</strong> {currentUser.email}
              </p>
              {#if currentUser.user_metadata?.phone}
                <p class="text-sm text-blue-800">
                  <strong>Phone:</strong> {currentUser.user_metadata.phone}
                </p>
              {/if}
            </div>
          {/if}
          
          {#if submitSuccess}
            <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-green-800 text-sm">✓ Your viewing request has been submitted successfully!</p>
            </div>
          {:else}
            <!-- Form -->
            <form on:submit|preventDefault={submitViewingRequest} class="space-y-4">
              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
                <textarea
                  id="message"
                  bind:value={formData.message}
                  rows="4"
                  placeholder="Tell us about your requirements, preferred viewing times, or any questions..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>
              
              {#if submitError}
                <div class="text-red-600 text-sm">{submitError}</div>
              {/if}
              
              <!-- Submit button -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  on:click={close}
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  class="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}