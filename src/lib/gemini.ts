import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateTripItinerary = async (request: {
  destination: string;
  days: number;
  budget: string;
  travelers: string;
}) => {
  const systemPrompt = `You are a world-class trip planner. Generate ONLY valid JSON matching this exact schema, no other text:

{
  "destination": "string",
  "days": "number", 
  "itinerary": [
    {
      "day": "number",
      "theme": "string",
      "places": [
        {
          "name": "string",
          "description": "string",
          "geo": {
            "lat": "number",
            "lng": "number"
          },
          "timeToSpend": "string",
          "category": "string"
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. ONLY real, existing places in ${request.destination} with CORRECT lat/lng coordinates
2. Group by geographic proximity
3. Realistic time estimates
4. Categories: Landmark, Museum, Park, Restaurant, Shopping, etc.
5. Budget: ${request.budget}, Travelers: ${request.travelers}
6. ${request.days} days exactly`;

  const model = genAI.getGenerativeModel({
    // model: "gemini-1.5-flash",
    model: "gemini-1.5-flash-latest",
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 4096,
    }
  });

  const prompt = `Detailed ${request.days}-day itinerary for ${request.destination}.
Budget: ${request.budget}. Travelers: ${request.travelers}.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate itinerary. Please check your API key and try again.');
  }
};

