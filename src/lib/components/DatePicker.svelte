<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ChevronLeft, ChevronRight, Calendar } from 'lucide-svelte';
  
  export let checkIn: Date | null = null;
  export let checkOut: Date | null = null;
  
  const dispatch = createEventDispatcher<{
    change: { checkIn: Date | null; checkOut: Date | null };
  }>();
  
  let isOpen = false;
  let currentMonth = new Date();
  let selectingCheckOut = false;
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    
    return days;
  }
  
  function formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  function isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }
  
  function isCurrentMonth(date: Date): boolean {
    return date.getMonth() === currentMonth.getMonth();
  }
  
  function isSelected(date: Date): boolean {
    if (checkIn && date.toDateString() === checkIn.toDateString()) return true;
    if (checkOut && date.toDateString() === checkOut.toDateString()) return true;
    return false;
  }
  
  function isBetweenDates(date: Date): boolean {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  }
  
  function selectDate(date: Date) {
    if (isPastDate(date)) return;
    
    if (!checkIn || selectingCheckOut) {
      if (!checkIn) {
        checkIn = date;
        selectingCheckOut = true;
      } else if (date <= checkIn) {
        checkIn = date;
        checkOut = null;
        selectingCheckOut = true;
      } else {
        checkOut = date;
        selectingCheckOut = false;
        isOpen = false;
        dispatch('change', { checkIn, checkOut });
      }
    } else {
      if (date <= checkIn) {
        checkIn = date;
        checkOut = null;
        selectingCheckOut = true;
      } else {
        checkOut = date;
        selectingCheckOut = false;
        isOpen = false;
        dispatch('change', { checkIn, checkOut });
      }
    }
  }
  
  function previousMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  }
  
  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }
  
  function toggleCalendar() {
    isOpen = !isOpen;
    if (isOpen) {
      currentMonth = checkIn || new Date();
      // Reset selection state so first click is always check-in
      selectingCheckOut = false;
      // Clear existing dates to start fresh
      checkIn = null;
      checkOut = null;
    }
  }
  
  function handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    // Don't close if clicking inside the date picker container or mobile modal
    if (!target.closest('.date-picker-container') && !target.closest('.mobile-calendar-modal')) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="date-picker-container relative">
  <button
    on:click={toggleCalendar}
    class="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
  >
    <div class="flex items-center gap-3">
      <Calendar class="h-5 w-5 text-gray-500" />
      <div class="text-left">
        {#if checkIn && checkOut}
          <div class="text-sm font-medium text-gray-900">
            {formatDate(checkIn)} - {formatDate(checkOut)}
          </div>
          <div class="text-xs text-gray-500">
            {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
          </div>
        {:else if checkIn}
          <div class="text-sm font-medium text-gray-900">
            {formatDate(checkIn)} - Select checkout
          </div>
          <div class="text-xs text-gray-500">Choose your departure date</div>
        {:else}
          <div class="text-sm text-gray-500">Select your dates</div>
          <div class="text-xs text-gray-400">Check-in • Check-out</div>
        {/if}
      </div>
    </div>
    <ChevronRight class="h-4 w-4 text-gray-400 transform transition-transform {isOpen ? 'rotate-90' : ''}" />
  </button>
  
  {#if isOpen}
    <!-- Mobile Modal Overlay (shown on mobile) -->
    <div 
      class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      on:click={(e) => { if (e.target === e.currentTarget) isOpen = false; }}
    >
      <div class="mobile-calendar-modal bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-full max-w-sm mx-4">
        <!-- Mobile Calendar Content -->
        <!-- Calendar Header -->
        <div class="flex items-center justify-between mb-4">
          <button
            on:click={previousMonth}
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <ChevronLeft class="h-5 w-5 text-gray-600" />
          </button>
          <h3 class="font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            on:click={nextMonth}
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <ChevronRight class="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <!-- Day Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          {#each dayNames as day}
            <div class="text-xs font-medium text-gray-500 text-center py-2">
              {day}
            </div>
          {/each}
        </div>
        
        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1">
          {#each getDaysInMonth(currentMonth) as date}
            <button
              on:click={() => selectDate(date)}
              disabled={isPastDate(date)}
              class="aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                {isPastDate(date) 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : isSelected(date)
                    ? 'bg-amber-500 text-white font-semibold'
                    : isBetweenDates(date)
                      ? 'bg-amber-100 text-amber-800'
                      : isCurrentMonth(date)
                        ? 'text-gray-900 hover:bg-amber-50'
                        : 'text-gray-400 hover:bg-gray-50'
                }
                {isToday(date) && !isSelected(date) ? 'ring-2 ring-amber-300' : ''}"
              type="button"
            >
              {date.getDate()}
            </button>
          {/each}
        </div>
        
        <!-- Helper Text -->
        <div class="mt-4 pt-3 border-t border-gray-100">
          <p class="text-xs text-gray-500 text-center">
            {selectingCheckOut && checkIn 
              ? 'Select your check-out date' 
              : 'Select your check-in date'}
          </p>
        </div>
        
        <!-- Close button for mobile -->
        <div class="mt-4 pt-3 border-t border-gray-100">
          <button
            on:click={() => isOpen = false}
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Desktop Dropdown (hidden on mobile) -->
    <div class="hidden md:block absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 w-80">
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-4">
        <button
          on:click={previousMonth}
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
        >
          <ChevronLeft class="h-5 w-5 text-gray-600" />
        </button>
        <h3 class="font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          on:click={nextMonth}
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
        >
          <ChevronRight class="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      <!-- Day Headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        {#each dayNames as day}
          <div class="text-xs font-medium text-gray-500 text-center py-2">
            {day}
          </div>
        {/each}
      </div>
      
      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        {#each getDaysInMonth(currentMonth) as date}
          <button
            on:click={() => selectDate(date)}
            disabled={isPastDate(date)}
            class="aspect-square flex items-center justify-center text-sm rounded-lg transition-all
              {isPastDate(date) 
                ? 'text-gray-300 cursor-not-allowed' 
                : isSelected(date)
                  ? 'bg-amber-500 text-white font-semibold'
                  : isBetweenDates(date)
                    ? 'bg-amber-100 text-amber-800'
                    : isCurrentMonth(date)
                      ? 'text-gray-900 hover:bg-amber-50'
                      : 'text-gray-400 hover:bg-gray-50'
              }
              {isToday(date) && !isSelected(date) ? 'ring-2 ring-amber-300' : ''}"
            type="button"
          >
            {date.getDate()}
          </button>
        {/each}
      </div>
      
      <!-- Helper Text -->
      <div class="mt-4 pt-3 border-t border-gray-100">
        <p class="text-xs text-gray-500 text-center">
          {selectingCheckOut && checkIn 
            ? 'Select your check-out date' 
            : 'Select your check-in date'}
        </p>
      </div>
    </div>
  {/if}
</div>