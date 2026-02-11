/**
 * Mock: simulates an LLM fetching news and generating a short post.
 * In production, replace with LangChain + news API (e.g. NewsAPI, RSS).
 * @returns {Promise<string>} Simulated post content
 */
export async function generateContent() {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));

  const headlines = [
    "Consensus protocol upgrade proposed for Q2; governance vote opens next week.",
    "Layer-2 activity reaches new high; fees on mainnet drop 40% month-over-month.",
    "Stablecoin legislation draft released; industry groups call for clarity.",
    "Major wallet provider adds support for account abstraction across 5 chains.",
    "DAO treasury votes to allocate 2% to public goods funding.",
  ];
  const i = Math.floor(Math.random() * headlines.length);
  const content = `[Consensus Agent] ${headlines[i]} — Generated at ${new Date().toISOString()}`;
  return content;
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
