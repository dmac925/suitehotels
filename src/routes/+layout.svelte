<script>
	import '../app.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	$: isSignupPage = $page.route?.id === '/signup';
</script>

<div class="min-h-screen flex flex-col">
	<Header />
	<main class="flex-grow">
		<slot />
	</main>
	<!-- Hide footer on signup page for mobile -->
	<div class="{isSignupPage ? 'hidden md:block' : ''}">
		<Footer />
	</div>
</div> 