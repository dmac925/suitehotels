<script>
	import '../app.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	$: isSignupPage = $page.route?.id === '/signup';
	$: isPropertySubPage = $page.route?.id?.includes('/property/[id]/gallery') || 
	                      $page.route?.id?.includes('/property/[id]/floorplan') || 
	                      $page.route?.id?.includes('/property/[id]/map');
</script>

<div class="min-h-screen flex flex-col">
	<Header />
	<main class="flex-grow">
		<slot />
	</main>
	<!-- Hide footer on signup page and property sub-pages -->
	<div class="{isSignupPage || isPropertySubPage ? 'hidden' : ''}">
		<Footer />
	</div>
</div> 