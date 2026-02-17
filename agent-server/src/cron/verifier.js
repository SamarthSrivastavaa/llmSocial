/**
 * Cron Job 2 (Verifier): Listen for NewPost events -> fetch content (from IPFS/mock) -> verifyTruth -> StakingGame.verifyPost().
 * Runs once to process recent posts, then exits. Schedule via node-cron in index.js.
 */
import { getAgentWallet, getContracts, getProvider } from "../lib/signer.js";
import { verifyTruth } from "../lib/verifyTruth.js";
import { MIN_STAKE_WEI } from "../lib/contracts.js";

/** Fetch content from IPFS (mock: return placeholder; real impl would use ipfs.get) */
async function fetchContentFromIpfs(ipfsHash) {
  // Mock: we don't have a real gateway in agent-server for simplicity; use hash as placeholder
  return `[Content for ${ipfsHash}]`;
}

export async function runVerifier() {
  const wallet = getAgentWallet();
  const provider = getProvider();
  const { stakingGame, socialLedger } = getContracts(wallet);
  const agentAddress = wallet.address;

  const filter = socialLedger.filters.NewPost();
  const toBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, toBlock - 9); // Alchemy free tier: max 10 blocks per eth_getLogs

  const events = await socialLedger.queryFilter(filter, fromBlock, toBlock);
  if (events.length === 0) return;

  for (const ev of events) {
    const postId = ev.args?.postId ?? ev.args?.[0];
    const author = ev.args?.author ?? ev.args?.[1];
    const ipfsHash = ev.args?.ipfsHash ?? ev.args?.[2];
    if (postId === undefined) continue;
    if (author === agentAddress) continue; // do not vote on own post

    try {
      const post = await socialLedger.getPost(postId);
      const ipfsFromPost = Array.isArray(post) ? post[2] : post?.ipfsHash;
      const content = await fetchContentFromIpfs(ipfsFromPost ?? ipfsHash ?? "");
      const { valid } = await verifyTruth(content, ipfsHash);

      const balance = await provider.getBalance(agentAddress);
      if (balance < MIN_STAKE_WEI) {
        console.warn("[Verifier] Skip post", postId.toString(), "- insufficient balance");
        continue;
      }

      const tx = await stakingGame.verifyPost(postId, valid, { value: MIN_STAKE_WEI });
      await tx.wait();
      console.log("[Verifier] Voted postId:", postId.toString(), "support:", valid, "tx:", tx.hash);
    } catch (err) {
      if (err.message?.includes("VotingClosed") || err.message?.includes("AlreadyResolved")) continue;
      if (err.message?.includes("CannotVoteOwnPost")) continue;
      console.error("[Verifier] Post", postId?.toString(), err.message || err);
    }
  }
}

const isMain = process.argv[1]?.replace(/\\/g, "/").includes("verifier.js");
if (isMain) {
  runVerifier().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
