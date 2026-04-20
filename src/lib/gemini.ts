// import { GoogleGenerativeAI } from "@google/generative-ai";

// const GEMINI_API_KEY = import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : process.env.GEMINI_API_KEY;

// if (!GEMINI_API_KEY) {
//   throw new Error('GEMINI_API_KEY environment variable is required');
// }

// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// export const generateTripItinerary = async (request: {
//   destination: string;
//   days: number;
//   budget: string;
//   travelers: string;
// }) => {
//   const systemPrompt = `You are a world-class trip planner. Generate ONLY valid JSON matching this exact schema, no other text:

// {
//   "destination": "string",
//   "days": "number", 
//   "itinerary": [
//     {
//       "day": "number",
//       "theme": "string",
//       "places": [
//         {
//           "name": "string",
//           "description": "string",
//           "geo": {
//             "lat": "number",
//             "lng": "number"
//           },
//           "timeToSpend": "string",
//           "category": "string"
//         }
//       ]
//     }
//   ]
// }

// CRITICAL RULES:
// 1. ONLY real, existing places in ${request.destination} with CORRECT lat/lng coordinates
// 2. Group by geographic proximity
// 3. Realistic time estimates
// 4. Categories: Landmark, Museum, Park, Restaurant, Shopping, etc.
// 5. Budget: ${request.budget}, Travelers: ${request.travelers}
// 6. ${request.days} days exactly`;

//   const model = genAI.getGenerativeModel({
//     // model: "gemini-1.5-flash",
//     model: "gemini-2.0-flash",
//     systemInstruction: systemPrompt,
//     generationConfig: {
//       responseMimeType: "application/json",
//       temperature: 0.3,
//       maxOutputTokens: 4096,
//     }
//   });

//   const prompt = `Detailed ${request.days}-day itinerary for ${request.destination}.
// Budget: ${request.budget}. Travelers: ${request.travelers}.`;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response.text();
//     return JSON.parse(response);
//   } catch (error) {
//     console.error('Gemini API Error:', error);
//     throw new Error('Failed to generate itinerary. Please check your API key and try again.');
//   }
// };




// import { GoogleGenerativeAI } from "@google/generative-ai";

// const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// export const generateTripItinerary = async (request: {
//   destination: string;
//   days: number;
//   budget: string;
//   travelers: string;
// }) => {
//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

//   const prompt = `Generate ONLY valid JSON, no markdown, no extra text.
// Schema:
// {"destination":"string","days":number,"itinerary":[{"day":number,"theme":"string","places":[{"name":"string","description":"string","geo":{"lat":number,"lng":number},"timeToSpend":"string","category":"string"}]}]}
// Rules: real places in ${request.destination}, correct coordinates, budget: ${request.budget}, travelers: ${request.travelers}, exactly ${request.days} days.
// Generate ${request.days}-day itinerary for ${request.destination}.`;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
//     const cleaned = text.replace(/```json|```/g, "").trim();
//     return JSON.parse(cleaned);
//   } catch (error) {
//     console.error('Gemini API Error:', error);
//     throw new Error('Failed to generate itinerary. Please check your API key and try again.');
//   }
// };


import Groq from "groq-sdk";

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const generateTripItinerary = async (request: {
  destination: string;
  days: number;
  budget: string;
  travelers: string;
}) => {
  const prompt = `You are a world-class trip planner. Generate ONLY valid JSON, no markdown fences, no extra text.

Schema:
{
  "destination": "string",
  "days": number,
  "itinerary": [
    {
      "day": number,
      "theme": "string",
      "places": [
        {
          "name": "string",
          "description": "string",
          "geo": { "lat": number, "lng": number },
          "timeToSpend": "string",
          "category": "string"
        }
      ]
    }
  ]
}

Rules:
- Only real places in ${request.destination} with correct coordinates
- Budget: ${request.budget}, Travelers: ${request.travelers}
- Exactly ${request.days} days
- Categories: Landmark, Museum, Park, Restaurant, Shopping

Generate a ${request.days}-day itinerary for ${request.destination}.`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const text = response.choices[0]?.message?.content ?? "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to generate itinerary. Please check your API key and try again.');
  }
};