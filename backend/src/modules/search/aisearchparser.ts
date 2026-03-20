import { getGeminiModel } from "../../utils/gemini";
import { PropertySerachQuery } from "./search.types";

export const parseSearchQueryAI = async (
  text: string,
): Promise<PropertySerachQuery> => {
  try {
    const model = getGeminiModel(); // 🔥 FIX: runtime initialization

    const prompt = `you are a search query parser
return only valid JSON. No Explanation.
Format:{
  "city": string | null,
  "state": string | null,
  "country": string | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "capacity": number | null,
  "amenities": string[] | null
}
Extract amenities like AC, Wifi, Parking, Pool, etc.
User Query: ${text}`;

    const result = await model.generateContent(prompt); // 🔥 use model

    let raw = result.response.text();

    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(raw);

    return {
      city: parsed.city || undefined,
      state: parsed.state || undefined,
      country: parsed.country || undefined,
      minPrice: parsed.minPrice ?? undefined,
      maxPrice: parsed.maxPrice ?? undefined,
      capacity: parsed.capacity ?? undefined,
      amenities: parsed.amenities ?? undefined,
    };
  } catch (error) {
    console.log("Gemini parse failed", error);
    return {};
  }
};
