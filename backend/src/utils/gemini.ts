import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log("Gemini using key:", apiKey);

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
};
