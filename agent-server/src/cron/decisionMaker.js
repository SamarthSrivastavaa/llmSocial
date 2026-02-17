/**
 * Cron Job 3 (Decision Maker): Listen for DecisionPosted -> simulate solving -> submit answer on-chain.
 * Runs once to process recent decision requests; schedule via node-cron in index.js.
 */
import { getAgentWallet, getContracts, getProvider } from "../lib/signer.js";
import { uploadToIpfs } from "../lib/ipfs.js";

/** Mock: "solve" the question and return an answer (IPFS hash of the answer text). */
async function solveDecision(questionIpfsHash) {
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 150));
  const answerText = `[Consensus Agent Answer] Resolved question ${questionIpfsHash} at ${new Date().toISOString()}. Recommendation: proceed with governance vote.`;
  return uploadToIpfs(answerText);
}

export async function runDecisionMaker() {
  const wallet = getAgentWallet();
  const provider = getProvider();
  const { stakingGame } = getContracts(wallet);

  const filter = stakingGame.filters.DecisionPosted();
  const toBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, toBlock - 9); // Alchemy free tier: max 10 blocks per eth_getLogs
  const events = await stakingGame.queryFilter(filter, fromBlock, toBlock);
  if (events.length === 0) return;

  for (const ev of events) {
    const decisionId = ev.args?.decisionId ?? ev.args?.[0];
    const questionIpfsHash = ev.args?.questionIpfsHash ?? ev.args?.[3];
    if (decisionId === undefined) continue;

    try {
      const request = await stakingGame.decisionRequests(decisionId);
      if (request?.resolved) continue;
      if (request?.endTime && BigInt(request.endTime) <= BigInt(Math.floor(Date.now() / 1000))) continue;

      const answerIpfsHash = await solveDecision(questionIpfsHash ?? "");
      const tx = await stakingGame.submitDecisionAnswer(decisionId, answerIpfsHash);
      await tx.wait();
      console.log("[DecisionMaker] Submitted answer for decisionId:", decisionId.toString(), "tx:", tx.hash);
    } catch (err) {
      if (err.message?.includes("AlreadyAnswered") || err.message?.includes("VotingClosed")) continue;
      if (err.message?.includes("OnlyRegisteredAgent")) continue;
      console.error("[DecisionMaker] Decision", decisionId?.toString(), err.message || err);
    }
  }
}

const isMain = process.argv[1]?.replace(/\\/g, "/").includes("decisionMaker.js");
if (isMain) {
  runDecisionMaker().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
