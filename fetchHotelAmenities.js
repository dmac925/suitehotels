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

// Strict JSON schema for the response - with detailed objects including name, details, and source
const AmenitiesSchema = {
  name: "Amenities",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      wellness_amenities: { 
        type: "array", 
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            details: { type: "string" },
            source: { type: "string" }
          },
          required: ["name", "details", "source"],
          additionalProperties: false
        }
      },
      dining_amenities: { 
        type: "array", 
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            details: { type: "string" },
            source: { type: "string" }
          },
          required: ["name", "details", "source"],
          additionalProperties: false
        }
      },
      service_amenities: { 
        type: "array", 
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            details: { type: "string" },
            source: { type: "string" }
          },
          required: ["name", "details", "source"],
          additionalProperties: false
        }
      },
      unique_features: { 
        type: "array", 
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            details: { type: "string" },
            source: { type: "string" }
          },
          required: ["name", "details", "source"],
          additionalProperties: false
        }
      }
    },
    required: [
      "wellness_amenities",
      "dining_amenities",
      "service_amenities",
      "unique_features"
    ]
  },
  strict: true
};

// Prompt template (taxonomy kept exactly as you provided)
const getAmenitiesPrompt = (hotelName, city, country) => `
For the hotel ${hotelName}${city ? `, ${city}` : ""}${country ? `, ${country}` : ""}, provide a JSON object with the following four categories.
Only include amenities or features that go beyond the basics (e.g. not "WiFi", "daily housekeeping", "standard toiletries"). Do not include amenities specific to individual rooms/suite (e.g. if there is a hot tub or sauna in a particular suite)

Use exactly the terminologies listed below when naming amenities/features. If a hotel offers something not in the list, either map it to the closest term, or add a clearly-labelled "other:" entry.

Terminology taxonomy:

wellness_amenities
  • Hot Tub / Spa
  • Sauna
  • Steam Room
  • Indoor pool
  • Outdoor pool
  • Fitness centre
  • Personal trainer service
  • Yoga / Pilates studio
  • Wellness treatments (massage, facial, hydrotherapy, etc.)
  • Poolside cabanas / daybeds

dining_amenities
  • Fine dining restaurant(s)
  • Casual restaurant / café
  • Bar / lounge
  • Rooftop bar / terrace dining
  • Executive lounge refreshments
  • Afternoon tea service
  • Private dining room

service_amenities
  • 24-hour room service
  • Valet parking
  • Airport / limousine transfer
  • Complimentary Town Car
  • Butler service
  • Business centre
  • Meeting / event facilities
  • Digital check-in / mobile key
  • Dry cleaning / laundry service
  • Childcare / babysitting service
  • Pet services / pet-friendly amenities
  • Bicycle storage / rental
  • Turndown service
  • Executive lounge access

unique_features
  • Panoramic or landmark views
  • Historical building / heritage architecture
  • Art or curated design collection
  • Prime location (landmark adjacent, riverfront, iconic neighbourhood)
  • Sustainability / eco-certified operations
  • Bespoke scent branding or aromatherapy programme
  • Exclusive access (e.g. members-only club)
  • Technologically advanced rooms (automation, voice control, smart-home integration)
  • Wellness-focused design (sleep pods, circadian lighting, air purification)

Return ONLY a valid JSON object with these four keys, where each array contains objects with:
- "name": The amenity name from the taxonomy
- "details": Specific details about this amenity at this hotel to be displayed on public facing marketing website
- "source": The source URL(s) where this information was found

Example format:
{
  "wellness_amenities": [
    {
      "name": "Indoor pool",
      "details": "25-metre indoor swimming pool with lap lanes",
      "source": "(marriott.com, hotel website)"
    }
  ],
  "dining_amenities": [],
  "service_amenities": [],
  "unique_features": []
}
`;

// --- AI fetch using web search ---
async function fetchAmenitiesFromAI(hotelName, city, country) {
  try {
    const userPrompt = `
Research the official website and trustworthy sources for "${hotelName}" in ${city || "Unknown City"}, ${country || "Unknown Country"}.
Extract only CURRENT amenities that clearly exceed basics, then map them to the exact taxonomy terms below.
If something doesn't match, include it prefixed with "other:".
Return STRICT JSON only — no prose, no markdown.

${getAmenitiesPrompt(hotelName, city, country)}
`;

    const resp = await openai.responses.create({
      model: "gpt-5-mini",
      // Let the model use the built-in web search tool
      tools: [{ type: "web_search" }],
      // Choose 'auto' to let the model decide when to search.
      // Or force search on every call with: tool_choice: { type: "web_search" }
      tool_choice: "auto",
      // Ask for strict structured output with medium verbosity
      text: { 
        format: { 
          type: "json_schema", 
          name: "Amenities",
          schema: AmenitiesSchema.schema,
          strict: AmenitiesSchema.strict
        },
        verbosity: "medium"
      },
      max_output_tokens: 8500, // plenty for the arrays without bloat
      input: [
        {
          role: "system",
          content:
            "You are a meticulous luxury hotel amenities analyst. Use web search to verify facts. Return ONLY valid JSON matching the provided schema. No extra keys, no commentary."
        },
        { role: "user", content: userPrompt }
      ]
    });

    // The Responses API returns content in resp.output
    const jsonPart = resp.output?.[0]?.content?.find?.((c) => c.type === "output_text");
    const raw = jsonPart ? jsonPart.text : (resp.output_text ?? "");
    const parsed = JSON.parse(raw);
    
    // Log a sample of what we received
    console.log(`Sample amenity data received:`);
    if (parsed.wellness_amenities?.[0]) {
      console.log(`  Wellness sample:`, JSON.stringify(parsed.wellness_amenities[0], null, 2));
    }
    
    return parsed;
  } catch (err) {
    console.error(`Error fetching amenities for ${hotelName}:`, err?.message || err);
    return null;
  }
}

// --- DB update ---
async function updateHotelAmenities(hotelId, amenities) {
  try {
    const { error } = await supabase
      .from('hotels')
      .update({
        wellness_amenities: amenities.wellness_amenities || [],
        dining_amenities: amenities.dining_amenities || [],
        // DB uses services_amenities (plural) — map accordingly:
        services_amenities: amenities.service_amenities || [],
        // DB uses unique_points — map accordingly:
        unique_points: amenities.unique_features || [],
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
async function processHotels(limit = null, offset = 0) {
  try {
    let query = supabase
      .from('hotels')
      .select('id, name, region, country')
      .order('id', { ascending: true });

    if (limit) query = query.range(offset, offset + limit - 1);

    const { data: hotels, error } = await query;
    if (error) throw error;

    console.log(`Found ${hotels.length} hotels to process`);

    let successCount = 0;
    let errorCount = 0;

    for (const hotel of hotels) {
      console.log(`\nProcessing: ${hotel.name} (${hotel.region}, ${hotel.country})`);

      const amenities = await fetchAmenitiesFromAI(
        hotel.name,
        hotel.region || 'Unknown City',
        hotel.country || 'Unknown Country'
      );

      if (amenities) {
        const ok = await updateHotelAmenities(hotel.id, amenities);
        if (ok) {
          console.log(`✓ Updated hotel ${hotel.id}: ${hotel.name}`);
          successCount++;
        } else {
          console.log(`✗ Failed DB update for hotel ${hotel.id}: ${hotel.name}`);
          errorCount++;
        }
      } else {
        console.log(`✗ Failed to fetch amenities for hotel ${hotel.id}: ${hotel.name}`);
        errorCount++;
      }

      // Gentle pacing
      await new Promise(res => setTimeout(res, 1000));
    }

    console.log(`\n=== Processing Complete ===`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total: ${hotels.length}`);
  } catch (err) {
    console.error('Error processing hotels:', err?.message || err);
  }
}

// --- CLI ---
const args = process.argv.slice(2);
const limit = args[0] ? parseInt(args[0], 10) : null;
const offset = args[1] ? parseInt(args[1], 10) : 0;

console.log('=== Hotel Amenities Fetcher (gpt-5-mini + web search) ===');
console.log(`Limit: ${limit ?? 'All'}`);
console.log(`Offset: ${offset}`);
console.log('Starting in 3 seconds...\n');

setTimeout(() => {
  processHotels(limit, offset);
}, 3000);