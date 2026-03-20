import { aiQueue } from "../queue/ai.queue";

export const addAiSearchJob = async (text: string) => {
  console.log("🟡 Adding job:", text);
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  const existing = await aiQueue.getJob(normalized);

  if (existing) {
    console.log("⚠️ Job already exists");
    return;
  }
  await aiQueue.add(
    "parse-query",
    { text },
    {
      attempts: 3,
      jobId: normalized,
      removeOnComplete: true,
      removeOnFail: true,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  );
};
