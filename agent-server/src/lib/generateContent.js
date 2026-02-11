/**
 * Generate a post from diverse trending sources (Polymarket, NewsAPI, RSS).
 * When OPENAI_API_KEY is set, an LLM turns the topic into a short agent post.
 * Otherwise formats the headline with source and timestamp.
 * @returns {Promise<string>} Post content
 */
import { fetchLatestNewsItem } from "./newsFetcher.js";
import { OPENAI_API_KEY } from "../config.js";

const MOCK_HEADLINES = [
  "Consensus protocol upgrade proposed for Q2; governance vote opens next week.",
  "Layer-2 activity reaches new high; fees on mainnet drop 40% month-over-month.",
  "Stablecoin legislation draft released; industry groups call for clarity.",
  "Major wallet provider adds support for account abstraction across 5 chains.",
  "DAO treasury votes to allocate 2% to public goods funding.",
];

/**
 * Use OpenAI to turn a trending topic/headline into a short agent post (1–2 sentences).
 * @param {string} topic - Headline or topic from Polymarket/NewsAPI/RSS
 * @param {string} [source] - e.g. Polymarket, NewsAPI, CoinDesk
 * @returns {Promise<string | null>} Generated post or null on failure
 */
async function generateWithLLM(topic, source = "") {
  if (!OPENAI_API_KEY || !topic?.trim()) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI agent posting on a decentralized social feed. Write a single short post (1–2 sentences) that summarizes or comments on the given trending topic. Be concise, factual, and neutral. Do not use hashtags or emoji. Output only the post text.",
          },
          {
            role: "user",
            content: source ? `Topic (from ${source}): ${topic}` : `Topic: ${topic}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.6,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    return null;
  }
}

export async function generateContent() {
  const item = await fetchLatestNewsItem();
  const timestamp = new Date().toISOString();
  const topic = item?.title?.trim();
  const source = item?.source || "";

  if (topic) {
    const llmPost = await generateWithLLM(topic, source);
    if (llmPost) {
      return `[Consensus Agent] ${llmPost} — ${source || "trending"} ${timestamp}`;
    }
    return `[Consensus Agent] ${topic}${source ? ` (${source})` : ""} — ${timestamp}`;
  }

  const i = Math.floor(Math.random() * MOCK_HEADLINES.length);
  return `[Consensus Agent] ${MOCK_HEADLINES[i]} — ${timestamp}`;
}

/**
 * Generate content in a specific category (for Timeline vs News).
 * @param {"TIMELINE"|"NEWS"} category
 * @returns {Promise<string>}
 */
export async function generateContentForCategory(category) {
  const base = await generateContent();
  if (category === "NEWS") {
    return `[NEWS] ${base}`;
  }
  return base;
}
