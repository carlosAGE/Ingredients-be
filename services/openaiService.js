// services/openaiService.js
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.analyzeImage = async (imageUrl) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
          You are an expert in food, cosmetic, and ingredient analysis which includes identifying ingredients from images and providing detailed information about them based on a structured JSON format.
These ingredients may be from food products, cosmetics, or other items. Your task is to extract and analyze the ingredients from the provided image URL for health risks and return them in a specific JSON format.
Each entry should follow the provided schema and include concerns based on known risks from scientific and regulatory sources — even if not explicitly labeled on the product.
When given an image of an ingredients list, return ONLY a JSON array called "ingredients".
Each ingredient entry must follow **this exact structure**:

{
  "name": "string",
  "category": "string",
  "common_use": "string",
  "aliases": [ "string" ],
  "banned_in": [ "string" ],
  "acne_rating": "low" | "medium" | "high" | "unknown",
  "origin": "natural" | "synthetic" | "animal-derived" | "unknown",
  "common_products": [ "string" ],
  "regulatory_notes": "string",
  "concerns": {
    "high":   [ "string" ],
    "medium": [ "string" ],
    "low":    [ "string" ]
  }
}

where concerns is an object with arrays for high, medium, and low concerns in terms of human consumption for both short term and long term consumption.
Ingredients should be listed in the original order. If an ingredient is not found, return empty values for the object.
Do not include explanations, disclaimers, or surrounding text.  
Do not return any other structure.  
If the ingredient name is unclear, return "unknown" with empty values for each key.  
Accuracy and formatting are prioritized.
`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI Vision Error:', err.message);
    throw err;
  }
};
