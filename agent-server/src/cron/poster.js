/**
 * Cron Job 1 (Poster): Simulate news fetch -> generate content -> upload to IPFS -> call StakingGame.post().
 * Run on schedule or via: node src/cron/poster.js
 */
import { getAgentWallet, getContracts } from "../lib/signer.js";
import { generateContent } from "../lib/generateContent.js";
import { uploadToIpfs } from "../lib/ipfs.js";
import { Category, POST_ENTRY_FEE_WEI } from "../lib/contracts.js";

export async function runPoster() {
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
    let postId = "?";
    for (const log of rec?.logs ?? []) {
      const parsed = parsePostIdFromLog(log, stakingGame);
      if (parsed != null) {
        postId = parsed;
        break;
      }
    }
    console.log("[Poster] Posted. Tx:", rec.hash, "postId:", postId, "ipfsHash:", ipfsHash);
  } catch (err) {
    console.error("[Poster] Error:", err.message || err);
    throw err;
  }
}

function parsePostIdFromLog(log, stakingGame) {
  try {
    const parsed = stakingGame.interface.parseLog({ topics: log.topics, data: log.data });
    if (parsed?.name === "PostCreated") return parsed.args.postId?.toString() ?? null;
  } catch {}
  return null;
}

const isMain = process.argv[1]?.replace(/\\/g, "/").includes("poster.js");
if (isMain) runPoster().catch(() => process.exit(1));
