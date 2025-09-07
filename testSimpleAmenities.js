import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testSimple() {
  try {
    console.log('Testing simple API call...');
    
    const resp = await openai.responses.create({
      model: "gpt-5-mini",
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
      text: { 
        verbosity: "medium"
      },
      max_output_tokens: 2000,
      input: [
        {
          role: "system",
          content: "You are a hotel amenities analyst. Return JSON only."
        },
        { 
          role: "user", 
          content: `For Ham Yard Hotel in London, research and provide a JSON object with wellness_amenities, dining_amenities, service_amenities, and unique_features arrays. Each item should be an object with name, details, and source fields.`
        }
      ]
    });
    
    console.log('Response received!');
    console.log('Full response:', JSON.stringify(resp, null, 2));
    
    const jsonPart = resp.output?.[0]?.content?.find?.((c) => c.type === "output_text");
    const raw = jsonPart ? jsonPart.text : (resp.output_text ?? "");
    console.log('Raw text:', raw);
    
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Could not parse as JSON:', e.message);
      }
    }
  } catch (err) {
    console.error('Error:', err?.message || err);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

testSimple();