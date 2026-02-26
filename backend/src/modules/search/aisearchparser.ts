import { text } from "stream/consumers";
import { geminiModel } from "../../utils/gemini";
import { PropertySerachQuery } from "./search.types";

export const parseSearchQueryAI = async (
  text: string,
): Promise<PropertySerachQuery> => {
  try {
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
Extract amenities 
AC, Wifi, Parking, and more amenities . 
        User Query:${text}`;

    const result = await geminiModel.generateContent(prompt);
    let raw = result.response.text();
    raw = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(raw);
    const lowerText = text.toLowerCase();
    // let detectedAmenities = parsed.amenities || [];

    // if (!detectedAmenities.length) {
    //   if (lowerText.includes("ac")) detectedAmenities.push("AC");
    //   if (lowerText.includes("wifi")) detectedAmenities.push("Wifi");
    //   if (lowerText.includes("parking")) detectedAmenities.push("Parking");
    //   if (lowerText.includes("pool")) detectedAmenities.push("Pool");
    // }
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
