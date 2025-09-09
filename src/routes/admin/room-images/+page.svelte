<script>
	import { onMount } from 'svelte';
	
	let rooms = [];
	let loading = true;
	let updating = false;
	let message = '';
	let hideCompleted = false;
	
	$: filteredRooms = hideCompleted ? rooms.filter(r => !r.main_image) : rooms;
	
	onMount(async () => {
		await loadRooms();
	});
	
	async function loadRooms() {
		try {
			const response = await fetch('/admin/room-images/api');
			if (response.ok) {
				rooms = await response.json();
			} else {
				message = 'Failed to load rooms';
			}
		} catch (error) {
			message = 'Error loading rooms: ' + error.message;
		} finally {
			loading = false;
		}
	}
	
	async function updateMainImage(roomId, imageUrl) {
		updating = true;
		message = '';
		
		try {
			const response = await fetch('/admin/room-images/api', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					roomId,
					mainImage: imageUrl
				})
			});
			
			if (response.ok) {
				message = `Main image updated for room ${roomId}`;
				const roomIndex = rooms.findIndex(r => r.id === roomId);
				if (roomIndex !== -1) {
					rooms[roomIndex].main_image = imageUrl;
				}
			} else {
				message = 'Failed to update main image';
			}
		} catch (error) {
			message = 'Error updating: ' + error.message;
		} finally {
			updating = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-8">Room Image Selection Admin</h1>
	
	<div class="mb-6 flex items-center justify-between">
		<label class="flex items-center space-x-2 cursor-pointer">
			<input 
				type="checkbox" 
				bind:checked={hideCompleted}
				class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
			/>
			<span class="text-lg">Hide rooms with main image already selected</span>
		</label>
		<div class="text-sm text-gray-600">
			Showing {filteredRooms.length} of {rooms.length} rooms
		</div>
	</div>
	
	{#if message}
		<div class="mb-4 p-4 rounded {message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
			{message}
		</div>
	{/if}
	
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="text-lg">Loading rooms...</div>
		</div>
	{:else if filteredRooms.length === 0}
		<div class="text-center text-gray-600">
			{#if hideCompleted && rooms.length > 0}
				All rooms have main images selected! 🎉
			{:else}
				No rooms found
			{/if}
		</div>
	{:else}
		<div class="space-y-8">
			{#each filteredRooms as room}
				<div class="border rounded-lg p-6 bg-white shadow-sm">
					<div class="mb-4">
						<h2 class="text-xl font-semibold">{room.hotel_name}</h2>
						<p class="text-gray-600">Room: {room.room_type}</p>
						<p class="text-sm text-gray-500">Room ID: {room.id} | Hotel ID: {room.hotel_id}</p>
						<p class="text-sm text-gray-500">Size: {room.size_sqft} sqft | Guests: {room.persons}</p>
					</div>
					
					{#if room.images && room.images.length > 0}
						<div class="mb-2">
							<p class="font-medium mb-2">Select main image:</p>
							{#if room.main_image}
								<p class="text-sm text-green-600 mb-2">Current main: {room.main_image}</p>
							{/if}
						</div>
						
						<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{#each room.images as image}
								<div class="relative group">
									<img 
										src={image} 
										alt="Room" 
										class="w-full h-32 object-cover rounded border-2 cursor-pointer transition-all
											{room.main_image === image ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-200 hover:border-blue-400'}"
										on:click={() => updateMainImage(room.id, image)}
									/>
									{#if room.main_image === image}
										<div class="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
											Main
										</div>
									{/if}
									<div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded pointer-events-none"></div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-gray-500">No images available for this room</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
	
	{#if updating}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white p-6 rounded-lg">
				<p>Updating main image...</p>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background-color: #f3f4f6;
	}
</style>