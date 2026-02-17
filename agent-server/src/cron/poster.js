/**
 * Cron Job 1 (Poster): Simulate news fetch -> generate content -> upload to IPFS -> call StakingGame.post().
 * Run on schedule or via: node src/cron/poster.js
 */
import { getAgentWallet, getContracts } from "../lib/signer.js";
import { generateContent } from "../lib/generateContent.js";
import { uploadToIpfs } from "../lib/ipfs.js";
import { Category, POST_ENTRY_FEE_WEI } from "../lib/contracts.js";
import { loadAgentConfig } from "../lib/agentConfigStore.js";

export async function runPoster() {
  const cfg = await loadAgentConfig();
  if (cfg.role === "validator") {
    console.log("[Poster] Skipping run - agent role set to validator");
    return;
  }
  const wallet = getAgentWallet();
  const { stakingGame } = getContracts(wallet);

  const balance = await wallet.provider.getBalance(wallet.address);
  if (balance < POST_ENTRY_FEE_WEI) {
    console.warn("[Poster] Insufficient balance for post fee. Need at least", POST_ENTRY_FEE_WEI.toString(), "wei");
    return;
  }

  try {
    const content = await generateContent();
    const ipfsHash = await uploadToIpfs(content);
    const category = Math.random() > 0.5 ? Category.NEWS : Category.TIMELINE;

    const tx = await stakingGame.post(ipfsHash, category, {
      value: POST_ENTRY_FEE_WEI,
    });
    const rec = await tx.wait();
    let postId = parsePostIdFromReceipt(rec, stakingGame);
    if (postId == null) postId = "?";
    console.log("[Poster] Posted. Tx:", rec.hash, "postId:", postId, "ipfsHash:", ipfsHash);
  } catch (err) {
    console.error("[Poster] Error:", err.message || err);
    throw err;
  }
}

/**
 * Extract postId from transaction receipt (PostCreated event).
 * Tries interface.parseLog; fallback: decode postId from StakingGame log topics[1].
 */
function parsePostIdFromReceipt(receipt, stakingGame) {
  if (!receipt?.logs?.length) return null;
  const stakingAddr = (stakingGame.target || stakingGame.address || "").toLowerCase();
  for (const log of receipt.logs) {
    const fromStaking = log.address && String(log.address).toLowerCase() === stakingAddr;
    try {
      const parsed = stakingGame.interface.parseLog(log);
      if (parsed?.name === "PostCreated") {
        const id = parsed.args?.postId ?? parsed.args?.[0];
        return id != null ? String(id) : null;
      }
    } catch {
      if (fromStaking && log.topics?.length >= 2) {
        const postIdHex = log.topics[1];
        if (typeof postIdHex === "string" && postIdHex.startsWith("0x")) {
          return String(BigInt(postIdHex));
        }
      }
      continue;
    }
  }
  return null;
}

const isMain = process.argv[1]?.replace(/\\/g, "/").includes("poster.js");
if (isMain) runPoster().catch(() => process.exit(1));
