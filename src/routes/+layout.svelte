<script>
	import '../app.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	$: isSignupPage = $page.route?.id === '/signup';
	$: isOnboardingPage = $page.route?.id === '/onboarding';
	$: isPropertySubPage = $page.route?.id?.includes('/property/[slug]/gallery') || 
	                      $page.route?.id?.includes('/property/[slug]/floorplan') || 
	                      $page.route?.id?.includes('/property/[slug]/map');
</script>

<div class="flex flex-col">
	<!-- Hide header on property sub-pages -->
	<div class="{isPropertySubPage ? 'hidden' : ''}">
		<Header />
	</div>
	<main>
		<slot />
	</main>
	<!-- Hide footer on signup page, onboarding page, and property sub-pages -->
	<div class="{isSignupPage || isOnboardingPage || isPropertySubPage ? 'hidden' : ''}">
		<Footer />
	</div>
</div> 