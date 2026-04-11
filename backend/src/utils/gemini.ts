import { GoogleGenerativeAI } from "@google/generative-ai";

let cachedModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null =
  null;

export const getGeminiModel = () => {
  if (cachedModel) {
    return cachedModel;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  cachedModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  return cachedModel;
};
