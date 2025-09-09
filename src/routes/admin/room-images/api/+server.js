import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
	try {
		const { data, error } = await supabase
			.from('rooms')
			.select('id, hotel_id, hotel_name, room_type, persons, size_sqft, images, main_image')
			.order('hotel_name', { ascending: true })
			.order('room_type', { ascending: true });
		
		if (error) {
			console.error('Supabase error:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		const processedData = data.map(room => ({
			...room,
			images: typeof room.images === 'string' ? JSON.parse(room.images) : room.images
		}));
		
		return json(processedData);
	} catch (error) {
		console.error('Server error:', error);
		return json({ error: 'Failed to fetch rooms' }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const { roomId, mainImage } = await request.json();
		
		if (!roomId || !mainImage) {
			return json({ error: 'Missing roomId or mainImage' }, { status: 400 });
		}
		
		const { error } = await supabase
			.from('rooms')
			.update({ main_image: mainImage })
			.eq('id', roomId);
		
		if (error) {
			console.error('Supabase update error:', error);
			return json({ error: error.message }, { status: 500 });
		}
		
		return json({ success: true });
	} catch (error) {
		console.error('Server error:', error);
		return json({ error: 'Failed to update main image' }, { status: 500 });
	}
}