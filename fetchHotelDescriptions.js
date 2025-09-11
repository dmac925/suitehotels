import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// --- Supabase ---
const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL || process.env.supabaseUrl,
  process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- OpenAI (Responses API) ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Strict JSON schema for the response
const DescriptionSchema = {
  name: "HotelDescription",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      description: { 
        type: "string",
        minLength: 100,
        maxLength: 500
      },
      neighbourhood: { 
        type: "string"
      },
      year_built: {
        type: ["integer", "null"],
        minimum: 1600,
        maximum: 2025
      },
      last_refurbished: {
        type: ["integer", "null"],
        minimum: 1990,
        maximum: 2025
      }
    },
    required: [
      "description",
      "neighbourhood",
      "year_built",
      "last_refurbished"
    ]
  },
  strict: true
};

// --- AI fetch using web search ---
async function fetchDescriptionFromAI(hotelName, city, country, address) {
  try {
    const userPrompt = `
Research the hotel "${hotelName}" located at ${address || `${city}, ${country}`}.

Provide:
1. A compelling, sophisticated marketing description (100-500 characters) that:
   - Captures the hotel's unique character and positioning
   - Mentions 1-2 standout features or amenities
   - Appeals to luxury travelers
   - Uses elegant, concise language
   - Avoids clichés and generic phrases

2. The specific London neighbourhood where this hotel is located. Common London neighbourhoods include:
   - Mayfair
   - Belgravia
   - Chelsea
   - Knightsbridge
   - South Kensington
   - Covent Garden
   - Soho
   - Marylebone
   - Fitzrovia
   - Bloomsbury
   - The City
   - Shoreditch
   - Notting Hill
   - Paddington
   - Westminster
   - St. James's
   - Kensington
   - Earl's Court
   - Victoria
   - Pimlico
   - Canary Wharf
   - Greenwich
   - Southbank
   - Borough
   - Bermondsey
   - etc.

3. The year the hotel building was originally built (as an integer, or null if unknown)

4. The year of the most recent major refurbishment or renovation (as an integer, or null if unknown or never refurbished)

Return ONLY valid JSON with exactly these fields:
{
  "description": "The marketing description",
  "neighbourhood": "The neighbourhood name",
  "year_built": 1920,  // or null if unknown
  "last_refurbished": 2019  // or null if unknown/never
}
`;

    const resp = await openai.responses.create({
      model: "gpt-5-mini",
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
      text: { 
        format: { 
          type: "json_schema", 
          name: "HotelDescription",
          schema: DescriptionSchema.schema,
          strict: DescriptionSchema.strict
        },
        verbosity: "medium"
      },
      max_output_tokens: 5000,
      input: [
        {
          role: "system",
          content: "You are a luxury hotel marketing expert and London geography specialist. Use web search to verify facts. Return ONLY valid JSON matching the provided schema."
        },
        { role: "user", content: userPrompt }
      ]
    });

    // The Responses API returns content in resp.output
    const jsonPart = resp.output?.[0]?.content?.find?.((c) => c.type === "output_text");
    const raw = jsonPart ? jsonPart.text : (resp.output_text ?? "");
    const parsed = JSON.parse(raw);
    
    console.log(`  Description: "${parsed.description.substring(0, 60)}..."`);
    console.log(`  Neighbourhood: ${parsed.neighbourhood}`);
    console.log(`  Year Built: ${parsed.year_built || 'Unknown'}`);
    console.log(`  Last Refurbished: ${parsed.last_refurbished || 'Unknown/Never'}`);
    
    return parsed;
  } catch (err) {
    console.error(`Error fetching description for ${hotelName}:`, err?.message || err);
    return null;
  }
}

// --- DB update ---
async function updateHotelDescription(hotelId, data) {
  try {
    const { error } = await supabase
      .from('hotels')
      .update({
        description: data.description,
        neighbourhood: data.neighbourhood,
        year_built: data.year_built,
        last_refurbished: data.last_refurbished,
        updated_at: new Date().toISOString()
      })
      .eq('id', hotelId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Error updating hotel ${hotelId}:`, err?.message || err);
    return false;
  }
}

// --- Main loop ---
async function processHotels(limit = null, offset = 0, forceReprocess = false) {
  try {
    let query = supabase
      .from('hotels')
      .select('id, name, region, country, address_full, description, neighbourhood')
      .order('id', { ascending: true });

    // Only process London hotels with NULL description unless force reprocess
    query = query.eq('region', 'London');
    if (!forceReprocess) {
      query = query.is('description', null);
    }

    if (limit) query = query.range(offset, offset + limit - 1);

    const { data: hotels, error } = await query;
    if (error) throw error;

    console.log(`Found ${hotels.length} hotels to process`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const hotel of hotels) {
      // Skip if already has description and neighbourhood (unless forcing)
      if (!forceReprocess && hotel.description && hotel.neighbourhood) {
        console.log(`\n⏭ Skipping: ${hotel.name} (already has description and neighbourhood)`);
        skippedCount++;
        continue;
      }

      console.log(`\nProcessing: ${hotel.name} (${hotel.region}, ${hotel.country})`);

      const data = await fetchDescriptionFromAI(
        hotel.name,
        hotel.region || 'London',
        hotel.country || 'gb',
        hotel.address_full
      );

      if (data) {
        const ok = await updateHotelDescription(hotel.id, data);
        if (ok) {
          console.log(`✓ Updated hotel ${hotel.id}: ${hotel.name}`);
          successCount++;
        } else {
          console.log(`✗ Failed DB update for hotel ${hotel.id}: ${hotel.name}`);
          errorCount++;
        }
      } else {
        console.log(`✗ Failed to fetch description for hotel ${hotel.id}: ${hotel.name}`);
        errorCount++;
      }

      // Gentle pacing
      await new Promise(res => setTimeout(res, 1000));
    }

    console.log(`\n=== Processing Complete ===`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Total: ${hotels.length}`);
  } catch (err) {
    console.error('Error processing hotels:', err?.message || err);
  }
}

// --- CLI ---
const args = process.argv.slice(2);
const limit = args[0] ? parseInt(args[0], 10) : null;
const offset = args[1] ? parseInt(args[1], 10) : 0;
const forceReprocess = args.includes('--force');

console.log('=== Hotel Description & Neighbourhood Fetcher (gpt-5-mini + web search) ===');
console.log(`Limit: ${limit ?? 'All'}`);
console.log(`Offset: ${offset}`);
console.log(`Force reprocess: ${forceReprocess}`);
console.log('Starting in 3 seconds...\n');

setTimeout(() => {
  processHotels(limit, offset, forceReprocess);
}, 3000);