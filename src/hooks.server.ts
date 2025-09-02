import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	
	// Ensure HTML responses have the correct Content-Type with charset
	if (response.headers.get('content-type')?.startsWith('text/html')) {
		response.headers.set('content-type', 'text/html; charset=utf-8');
	}
	
	return response;
};