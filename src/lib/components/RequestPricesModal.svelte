<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X } from 'lucide-svelte';
  
  export let show: boolean = false;
  export let suite: any = null;
  export let hotel: any = null;
  export let checkIn: Date | null = null;
  export let checkOut: Date | null = null;
  export let isSubmitting: boolean = false;
  export let submitSuccess: boolean = false;
  export let submitError: string = '';
  
  const dispatch = createEventDispatcher();
  
  let formData = {
    email: '',
    name: '',
    phone: '',
    guests: 2,
    message: ''
  };
  
  function close() {
    formData = {
      email: '',
      name: '',
      phone: '',
      guests: 2,
      message: ''
    };
    dispatch('close');
  }
  
  function formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  function getNights(): number {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  async function submitRequest() {
    if (!formData.email || !formData.name) {
      submitError = 'Please fill in your name and email address.';
      return;
    }
    
    if (!checkIn || !checkOut) {
      submitError = 'Please select your check-in and check-out dates.';
      return;
    }
    
    const requestData = {
      suite_id: suite?.id,
      suite_type: suite?.roomType || 'Suite',
      hotel_name: hotel?.name || 'Hotel',
      hotel_location: hotel?.address?.city || 'Location',
      check_in: checkIn.toISOString(),
      check_out: checkOut.toISOString(),
      nights: getNights(),
      guests: formData.guests,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      created_at: new Date().toISOString()
    };
    
    dispatch('submit', requestData);
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
      on:click={close}
      role="button"
      tabindex="-1"
      aria-label="Close modal"
    ></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-end justify-center p-4 sm:items-center">
      <div class="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8">
        <!-- Header -->
        <div class="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 border-b border-amber-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900">Request Prices</h3>
            <button
              on:click={close}
              class="rounded-md bg-white/80 text-gray-400 hover:text-gray-500 hover:bg-white focus:outline-none p-1 transition-colors"
            >
              <span class="sr-only">Close</span>
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="bg-white px-6 py-6">
          <!-- Suite info -->
          <div class="mb-6 p-4 bg-gradient-to-r from-slate-50 to-amber-50 rounded-lg border border-amber-200">
            <h4 class="font-semibold text-slate-900">{suite?.roomType || 'Suite'}</h4>
            <p class="text-sm text-slate-600">{hotel?.name || 'Hotel'}</p>
            <p class="text-sm text-slate-600">{hotel?.address?.city || 'Location'}</p>
            
            {#if checkIn && checkOut}
              <div class="mt-3 pt-3 border-t border-amber-200">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-slate-500">Check-in:</span>
                    <p class="font-medium text-slate-900">{formatDate(checkIn)}</p>
                  </div>
                  <div>
                    <span class="text-slate-500">Check-out:</span>
                    <p class="font-medium text-slate-900">{formatDate(checkOut)}</p>
                  </div>
                </div>
                <div class="mt-2 text-sm">
                  <span class="text-slate-500">Duration:</span>
                  <span class="font-medium text-slate-900 ml-1">{getNights()} nights</span>
                </div>
              </div>
            {/if}
          </div>

          {#if submitSuccess}
            <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.107 10.5a.75.75 0 00-1.214 1.029l2.5 3.5a.75.75 0 001.321-.049l4-5.5z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">Request Submitted!</h3>
                  <p class="mt-1 text-sm text-green-700">
                    Thank you! We'll send you pricing information and availability within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          {:else}
            <!-- Form -->
            <form on:submit|preventDefault={submitRequest} class="space-y-4">
              <!-- Name and Email -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    id="name"
                    type="text"
                    bind:value={formData.name}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    id="email"
                    type="email"
                    bind:value={formData.email}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <!-- Phone and Guests -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    bind:value={formData.phone}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label for="guests" class="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                  <select
                    id="guests"
                    bind:value={formData.guests}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    {#each Array(suite?.persons || 4).fill(0) as _, i}
                      <option value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                    {/each}
                  </select>
                </div>
              </div>
              
              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                  id="message"
                  bind:value={formData.message}
                  rows="3"
                  placeholder="Any special requirements or questions about your stay..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                ></textarea>
              </div>
              
              {#if submitError}
                <div class="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p class="text-red-700 text-sm">{submitError}</p>
                </div>
              {/if}
              
              <!-- Submit button -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  on:click={close}
                  class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  class="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md"
                >
                  {isSubmitting ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}