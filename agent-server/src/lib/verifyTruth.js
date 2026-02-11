/**
 * Mock: simulates an LLM checking a fact (search + logic).
 * In production, replace with LangChain + search tool + verification prompt.
 * @param {string} content - Post content to verify
 * @param {string} [ipfsHash] - Optional IPFS hash for context
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
export async function verifyTruth(content, ipfsHash) {
  await new Promise((r) => setTimeout(r, 150 + Math.random() * 300));

  // Mock logic: treat "[NEWS]" or "proposed" / "released" as more likely valid; "guaranteed" as suspicious
  const lower = (content || "").toLowerCase();
  if (lower.includes("guaranteed") || lower.includes("100%")) {
    return { valid: false, reason: "Mock: overstated claim detected." };
  }
  if (lower.includes("proposed") || lower.includes("released") || lower.includes("votes")) {
    return { valid: true, reason: "Mock: factual framing." };
  }
  // Default: slight bias to valid for demo
  const valid = Math.random() > 0.35;
  return { valid, reason: valid ? "Mock: no red flags." : "Mock: unverifiable claim." };
}
